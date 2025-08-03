
-- Create RPC functions for attendance sessions

-- Function to get employee attendance sessions
CREATE OR REPLACE FUNCTION get_employee_attendance_sessions(p_employee_id UUID)
RETURNS TABLE(
  id UUID,
  employee_id UUID,
  company_id UUID,
  attendance_date DATE,
  session_number INTEGER,
  check_in_time TIME,
  check_out_time TIME,
  hours_worked NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eas.id,
    eas.employee_id,
    eas.company_id,
    eas.attendance_date,
    eas.session_number,
    eas.check_in_time,
    eas.check_out_time,
    eas.hours_worked,
    eas.status,
    eas.created_at,
    eas.updated_at
  FROM employee_attendance_sessions eas
  WHERE eas.employee_id = p_employee_id
  ORDER BY eas.attendance_date DESC, eas.session_number DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's attendance sessions for an employee
CREATE OR REPLACE FUNCTION get_today_attendance_sessions(p_employee_id UUID, p_date DATE)
RETURNS TABLE(
  id UUID,
  employee_id UUID,
  company_id UUID,
  attendance_date DATE,
  session_number INTEGER,
  check_in_time TIME,
  check_out_time TIME,
  hours_worked NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eas.id,
    eas.employee_id,
    eas.company_id,
    eas.attendance_date,
    eas.session_number,
    eas.check_in_time,
    eas.check_out_time,
    eas.hours_worked,
    eas.status,
    eas.created_at,
    eas.updated_at
  FROM employee_attendance_sessions eas
  WHERE eas.employee_id = p_employee_id 
    AND eas.attendance_date = p_date
  ORDER BY eas.session_number ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a new attendance session
CREATE OR REPLACE FUNCTION create_attendance_session(
  p_employee_id UUID,
  p_company_id UUID,
  p_attendance_date DATE,
  p_session_number INTEGER,
  p_check_in_time TIME
) RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  INSERT INTO employee_attendance_sessions (
    employee_id,
    company_id,
    attendance_date,
    session_number,
    check_in_time,
    status
  ) VALUES (
    p_employee_id,
    p_company_id,
    p_attendance_date,
    p_session_number,
    p_check_in_time,
    'Present'
  ) RETURNING id INTO session_id;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update attendance session with check out time
CREATE OR REPLACE FUNCTION update_attendance_session(
  p_session_id UUID,
  p_check_out_time TIME,
  p_hours_worked NUMERIC
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE employee_attendance_sessions
  SET 
    check_out_time = p_check_out_time,
    hours_worked = p_hours_worked,
    updated_at = now()
  WHERE id = p_session_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get HR attendance sessions with employee details
CREATE OR REPLACE FUNCTION get_hr_attendance_sessions(p_company_id UUID, p_date DATE)
RETURNS TABLE(
  id UUID,
  employee_id UUID,
  company_id UUID,
  attendance_date DATE,
  session_number INTEGER,
  check_in_time TIME,
  check_out_time TIME,
  hours_worked NUMERIC,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  employees JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eas.id,
    eas.employee_id,
    eas.company_id,
    eas.attendance_date,
    eas.session_number,
    eas.check_in_time,
    eas.check_out_time,
    eas.hours_worked,
    eas.status,
    eas.created_at,
    eas.updated_at,
    json_build_object(
      'id', e.id,
      'full_name', e.full_name,
      'department', e.department,
      'employee_id', e.employee_id
    ) as employees
  FROM employee_attendance_sessions eas
  JOIN employees e ON e.id = eas.employee_id
  WHERE eas.company_id = p_company_id 
    AND eas.attendance_date = p_date
  ORDER BY eas.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
