
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      employee_id, 
      course_id, 
      company_id, 
      assigned_by 
    } = await req.json()

    // Check if course assignment already exists
    const { data: existing } = await supabaseClient
      .from('employee_courses')
      .select('id')
      .eq('employee_id', employee_id)
      .eq('course_id', course_id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'Course already assigned to this employee' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const { data, error } = await supabaseClient
      .from('employee_courses')
      .insert({
        employee_id,
        course_id,
        company_id,
        assigned_by,
        status: 'Assigned',
        progress: 0
      })
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
