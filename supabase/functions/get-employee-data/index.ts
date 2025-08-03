
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

    const { employee_id, company_id } = await req.json()

    if (!employee_id || !company_id) {
      throw new Error('Employee ID and Company ID are required')
    }

    // Get employee data with service role permissions (bypasses RLS)
    const [
      employeeResult,
      shiftsResult,
      attendanceResult,
      ticketsResult,
      leaveRequestsResult,
      performanceResult,
      coursesResult,
      eventsResult
    ] = await Promise.all([
      // Employee info
      supabase
        .from('employees')
        .select('*')
        .eq('id', employee_id)
        .eq('created_by', company_id)
        .single(),
      
      // Employee shifts
      supabase
        .from('employee_shifts')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('company_id', company_id)
        .order('shift_date', { ascending: true }),
      
      // Attendance sessions
      supabase
        .from('employee_attendance_sessions')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('company_id', company_id)
        .order('attendance_date', { ascending: false })
        .limit(30),
      
      // Tickets
      supabase
        .from('employee_tickets')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('company_id', company_id)
        .order('created_at', { ascending: false }),
      
      // Leave requests
      supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('company_id', company_id)
        .order('created_at', { ascending: false }),
      
      // Performance ratings
      supabase
        .from('performance_ratings')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('company_id', company_id)
        .order('created_at', { ascending: false }),
      
      // Employee courses
      supabase
        .from('employee_courses')
        .select(`
          *,
          courses(*)
        `)
        .eq('employee_id', employee_id)
        .eq('company_id', company_id)
        .order('assigned_at', { ascending: false }),
      
      // Company events
      supabase
        .from('events')
        .select('*')
        .eq('company_id', company_id)
        .order('event_date', { ascending: false })
    ])

    // Check for errors
    if (employeeResult.error) throw employeeResult.error
    if (shiftsResult.error) throw shiftsResult.error
    if (attendanceResult.error) throw attendanceResult.error
    if (ticketsResult.error) throw ticketsResult.error
    if (leaveRequestsResult.error) throw leaveRequestsResult.error
    if (performanceResult.error) throw performanceResult.error
    if (coursesResult.error) throw coursesResult.error
    if (eventsResult.error) throw eventsResult.error

    const shifts = shiftsResult.data || [];

    const data = {
      employee: employeeResult.data,
      shifts: shifts,
      allShifts: shifts, // For overview component
      totalShifts: shifts.length, // For stats
      attendance: attendanceResult.data || [],
      tickets: ticketsResult.data || [],
      leaveRequests: leaveRequestsResult.data || [],
      performance: performanceResult.data || [],
      courses: coursesResult.data || [],
      events: eventsResult.data || []
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching employee data:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
