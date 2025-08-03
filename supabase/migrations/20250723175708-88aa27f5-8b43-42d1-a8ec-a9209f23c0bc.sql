
-- Drop the notices table and all related data
DROP TABLE IF EXISTS public.notices CASCADE;

-- Drop the attendance table and all related data
DROP TABLE IF EXISTS public.attendance CASCADE;

-- Drop the employee_attendance table and all related data
DROP TABLE IF EXISTS public.employee_attendance CASCADE;

-- Drop the employee_attendance_sessions table and all related data
DROP TABLE IF EXISTS public.employee_attendance_sessions CASCADE;

-- Drop the employee_announcements table and all related data
DROP TABLE IF EXISTS public.employee_announcements CASCADE;

-- Drop any attendance-related functions
DROP FUNCTION IF EXISTS public.employee_clock_action(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.get_employee_attendance_sessions(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_today_attendance_sessions(uuid, date) CASCADE;
DROP FUNCTION IF EXISTS public.create_attendance_session(uuid, uuid, date, integer, time) CASCADE;
DROP FUNCTION IF EXISTS public.update_attendance_session(uuid, time, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.get_hr_attendance_sessions(uuid, date) CASCADE;
