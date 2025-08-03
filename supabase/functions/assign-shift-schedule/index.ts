
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssignScheduleRequest {
  schedule_id: string;
  company_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Initializing Supabase client...');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const { schedule_id, company_id }: AssignScheduleRequest = requestBody;

    if (!schedule_id || !company_id) {
      console.error('Missing required parameters:', { schedule_id, company_id });
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: schedule_id or company_id',
        received: { schedule_id, company_id }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Assigning schedule with params:', { schedule_id, company_id });

    // First verify the schedule exists and belongs to the company
    console.log('Verifying schedule existence...');
    const { data: schedule, error: scheduleError } = await supabase
      .from('shift_schedules')
      .select('id, schedule_name, status')
      .eq('id', schedule_id)
      .eq('company_id', company_id)
      .single();

    if (scheduleError) {
      console.error('Error verifying schedule:', scheduleError);
      return new Response(JSON.stringify({ 
        error: `Failed to verify schedule: ${scheduleError.message}`,
        details: scheduleError
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!schedule) {
      console.error('Schedule not found or access denied');
      return new Response(JSON.stringify({ 
        error: 'Schedule not found or access denied',
        schedule_id,
        company_id
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Found schedule:', schedule);

    // Try calling the database function first
    console.log('Calling assign_shift_schedule database function...');
    const { data: functionResult, error: functionError } = await supabase
      .rpc('assign_shift_schedule', {
        p_schedule_id: schedule_id,
        p_company_id: company_id
      });

    console.log('Function result:', functionResult);
    console.log('Function error:', functionError);

    if (functionError) {
      console.error('Database function error:', JSON.stringify(functionError, null, 2));
      
      // Try manual assignment if RPC fails
      console.log('RPC failed, trying manual assignment...');
      
      // Update schedule status
      const { error: updateScheduleError } = await supabase
        .from('shift_schedules')
        .update({ 
          status: 'assigned', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', schedule_id)
        .eq('company_id', company_id);

      if (updateScheduleError) {
        console.error('Error updating schedule status:', updateScheduleError);
        return new Response(JSON.stringify({ 
          error: `Failed to update schedule status: ${updateScheduleError.message}`,
          details: updateScheduleError
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Update shifts status
      const { error: updateShiftsError } = await supabase
        .from('employee_shifts')
        .update({ 
          status: 'confirmed', 
          updated_at: new Date().toISOString() 
        })
        .eq('schedule_id', schedule_id)
        .eq('company_id', company_id);

      if (updateShiftsError) {
        console.error('Error updating shifts status:', updateShiftsError);
        return new Response(JSON.stringify({ 
          error: `Failed to update shifts status: ${updateShiftsError.message}`,
          details: updateShiftsError
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      console.log('Schedule assigned successfully via manual update');

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Shift schedule assigned successfully to all employees (manual assignment)',
        method: 'manual'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Schedule assigned successfully via RPC');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Shift schedule assigned successfully to all employees',
      method: 'rpc'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Unexpected error in assign-shift-schedule function:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message || 'Failed to assign shift schedule',
      details: {
        name: error.name,
        stack: error.stack?.split('\n')[0] || 'No stack trace available'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
