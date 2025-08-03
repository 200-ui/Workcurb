
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { employee_id, company_id, leave_type, start_date, end_date, reason } = await req.json()

    if (!employee_id || !company_id || !leave_type || !start_date || !end_date || !reason) {
      throw new Error('All fields are required')
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({
        employee_id,
        company_id,
        leave_type,
        start_date,
        end_date,
        reason: reason.trim(),
        status: 'pending'
      })
      .select()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating leave request:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
