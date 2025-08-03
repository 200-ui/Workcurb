
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

    const { employee_id, course_id, progress_increment } = await req.json()

    if (!employee_id || !course_id || !progress_increment) {
      throw new Error('Employee ID, Course ID, and progress increment are required')
    }

    // Get current progress
    const { data: currentCourse, error: fetchError } = await supabase
      .from('employee_courses')
      .select('progress, status')
      .eq('employee_id', employee_id)
      .eq('course_id', course_id)
      .single()

    if (fetchError) throw fetchError

    const newProgress = Math.min(100, (currentCourse.progress || 0) + progress_increment)
    const newStatus = newProgress >= 100 ? 'Completed' : 'In Progress'

    // Update progress
    const { data, error } = await supabase
      .from('employee_courses')
      .update({
        progress: newProgress,
        status: newStatus,
        completed_at: newStatus === 'Completed' ? new Date().toISOString() : null
      })
      .eq('employee_id', employee_id)
      .eq('course_id', course_id)
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      data: data[0],
      progress: newProgress,
      status: newStatus 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error updating course progress:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
