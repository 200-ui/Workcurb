
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateScheduleRequest {
  company_id: string;
  schedule_name: string;
  week_start_date: string;
  schedule_id?: string; // For regeneration
  regenerate?: boolean;
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

    const { company_id, schedule_name, week_start_date, schedule_id, regenerate }: GenerateScheduleRequest = requestBody;

    if (!company_id || !schedule_name || !week_start_date) {
      console.error('Missing required parameters:', { company_id, schedule_name, week_start_date });
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: company_id, schedule_name, or week_start_date',
        received: { company_id, schedule_name, week_start_date }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Generating schedule with params:', { company_id, schedule_name, week_start_date, regenerate });

    // Get all active employees for this company
    console.log('Fetching active employees for company:', company_id);
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, full_name, department')
      .eq('created_by', company_id)
      .eq('is_active', true);

    if (empError) {
      console.error('Error fetching employees:', empError);
      return new Response(JSON.stringify({ 
        error: `Failed to fetch employees: ${empError.message}`,
        details: empError
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!employees || employees.length === 0) {
      console.log('No active employees found for company:', company_id);
      return new Response(JSON.stringify({ 
        error: 'No active employees found. Please add employees before generating a schedule.',
        company_id 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Found ${employees.length} active employees:`, employees.map(e => ({ id: e.id, name: e.full_name })));

    let scheduleData;

    if (regenerate && schedule_id) {
      // Use existing schedule
      const { data: existingSchedule, error: scheduleError } = await supabase
        .from('shift_schedules')
        .select('*')
        .eq('id', schedule_id)
        .single();

      if (scheduleError) {
        console.error('Error fetching existing schedule:', scheduleError);
        return new Response(JSON.stringify({ 
          error: `Failed to fetch existing schedule: ${scheduleError.message}`,
          details: scheduleError
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      scheduleData = existingSchedule;
    } else {
      // Create new schedule record
      console.log('Creating schedule record...');
      const startDate = new Date(week_start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      const { data: newSchedule, error: scheduleError } = await supabase
        .from('shift_schedules')
        .insert({
          company_id,
          schedule_name,
          week_start_date,
          week_end_date: endDate.toISOString().split('T')[0],
          created_by: company_id,
          status: 'draft'
        })
        .select()
        .single();

      if (scheduleError) {
        console.error('Error creating schedule:', scheduleError);
        return new Response(JSON.stringify({ 
          error: `Failed to create schedule: ${scheduleError.message}`,
          details: scheduleError
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      scheduleData = newSchedule;
    }

    console.log('Using schedule:', scheduleData);

    // Create shifts for each employee with varied timing patterns
    const shifts = [];
    const shiftTypes = ['morning', 'afternoon', 'evening'];
    const shiftTimes = {
      morning: [
        { start: '06:00:00', end: '14:00:00' },
        { start: '07:00:00', end: '15:00:00' },
        { start: '08:00:00', end: '16:00:00' }
      ],
      afternoon: [
        { start: '14:00:00', end: '22:00:00' },
        { start: '15:00:00', end: '23:00:00' },
        { start: '13:00:00', end: '21:00:00' }
      ],
      evening: [
        { start: '18:00:00', end: '02:00:00' },
        { start: '19:00:00', end: '03:00:00' },
        { start: '20:00:00', end: '04:00:00' }
      ]
    };
    
    console.log('Creating shifts for employees...');
    
    const startDate = new Date(week_start_date);
    
    employees.forEach((employee, empIndex) => {
      console.log(`Creating shifts for employee: ${employee.full_name} (ID: ${employee.id})`);
      
      // Assign 5 working days (Monday to Friday) to each employee
      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        const shiftDate = new Date(startDate);
        shiftDate.setDate(startDate.getDate() + dayOffset);
        
        // Create varied shift patterns for each employee and regeneration
        const shiftTypeIndex = (empIndex + dayOffset + (regenerate ? Math.floor(Math.random() * 3) : 0)) % 3;
        const shiftType = shiftTypes[shiftTypeIndex];
        const timeVariantIndex = (empIndex + dayOffset) % 3;
        const times = shiftTimes[shiftType as keyof typeof shiftTimes][timeVariantIndex];
        
        const shift = {
          schedule_id: scheduleData.id,
          employee_id: employee.id,
          company_id,
          shift_date: shiftDate.toISOString().split('T')[0],
          shift_type: shiftType,
          shift_start_time: times.start,
          shift_end_time: times.end,
          status: 'scheduled'
        };
        
        shifts.push(shift);
        console.log(`Added shift for ${employee.full_name} on ${shift.shift_date}: ${shiftType} (${times.start} - ${times.end})`);
      }
    });

    console.log(`Total shifts to create: ${shifts.length}`);

    // Insert all shifts
    const { data: createdShifts, error: shiftsError } = await supabase
      .from('employee_shifts')
      .insert(shifts)
      .select();

    if (shiftsError) {
      console.error('Error creating shifts:', shiftsError);
      return new Response(JSON.stringify({ 
        error: `Failed to create shifts: ${shiftsError.message}`,
        details: shiftsError
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Successfully created ${createdShifts?.length || 0} shifts`);

    return new Response(JSON.stringify({ 
      success: true, 
      schedule_id: scheduleData.id,
      message: `Shift schedule ${regenerate ? 'regenerated' : 'generated'} successfully with ${createdShifts?.length || 0} fresh shifts assigned to ${employees.length} employees`,
      employees_count: employees.length,
      shifts_created: createdShifts?.length || 0,
      schedule_details: {
        schedule_name: scheduleData.schedule_name,
        week_start_date: scheduleData.week_start_date,
        week_end_date: scheduleData.week_end_date,
        status: scheduleData.status
      },
      employee_assignments: employees.map(emp => ({
        employee_id: emp.id,
        employee_name: emp.full_name,
        shifts_assigned: 5
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Unexpected error in generate-shift-schedule function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message || 'Failed to generate shift schedule',
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
