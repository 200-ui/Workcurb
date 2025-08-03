
-- Fix the employee_clock_action function with better error handling
CREATE OR REPLACE FUNCTION employee_clock_action(
  p_employee_id UUID,
  p_action TEXT -- 'in' or 'out'
) RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  current_time TIME := CURRENT_TIME;
  existing_record RECORD;
BEGIN
  -- Get existing attendance record for today
  SELECT * INTO existing_record
  FROM employee_attendance
  WHERE employee_id = p_employee_id AND attendance_date = today_date;
  
  IF p_action = 'in' THEN
    IF existing_record IS NULL THEN
      -- Create new attendance record
      INSERT INTO employee_attendance (employee_id, attendance_date, check_in_time, status)
      VALUES (p_employee_id, today_date, current_time, 'Present');
      RETURN TRUE;
    ELSIF existing_record.check_in_time IS NULL THEN
      -- Update existing record with check-in time
      UPDATE employee_attendance
      SET check_in_time = current_time, status = 'Present', updated_at = now()
      WHERE id = existing_record.id;
      RETURN TRUE;
    ELSE
      -- Already clocked in today
      RETURN FALSE;
    END IF;
  ELSIF p_action = 'out' THEN
    -- Allow clock out if there's a record with check_in_time (regardless of existing check_out_time)
    IF existing_record IS NOT NULL AND existing_record.check_in_time IS NOT NULL THEN
      -- Calculate hours worked and update
      UPDATE employee_attendance
      SET 
        check_out_time = current_time,
        hours_worked = EXTRACT(EPOCH FROM (current_time - existing_record.check_in_time)) / 3600,
        updated_at = now()
      WHERE id = existing_record.id;
      RETURN TRUE;
    ELSE
      -- Cannot clock out (not clocked in)
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all tables have proper real-time replication
ALTER TABLE employee_attendance REPLICA IDENTITY FULL;
ALTER TABLE employee_tickets REPLICA IDENTITY FULL;
ALTER TABLE performance_ratings REPLICA IDENTITY FULL;
ALTER TABLE employee_announcements REPLICA IDENTITY FULL;
ALTER TABLE employees REPLICA IDENTITY FULL;

-- Add tables to realtime publication if not already added
ALTER PUBLICATION supabase_realtime ADD TABLE employee_attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE employee_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE performance_ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE employee_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE employees;

-- Ensure company_id is properly set for all existing records
UPDATE employee_tickets 
SET company_id = (
  SELECT created_by 
  FROM employees 
  WHERE employees.id = employee_tickets.employee_id
) 
WHERE company_id IS NULL;

UPDATE employee_attendance 
SET company_id = (
  SELECT created_by 
  FROM employees 
  WHERE employees.id = employee_attendance.employee_id
) 
WHERE company_id IS NULL;

-- Update RLS policies to ensure proper access control
DROP POLICY IF EXISTS "Employees can manage their own attendance" ON employee_attendance;
CREATE POLICY "Employees can manage their own attendance" ON employee_attendance
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Employees can view their own tickets" ON employee_tickets;
CREATE POLICY "Employees can view their own tickets" ON employee_tickets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Employees can create their own tickets" ON employee_tickets;
CREATE POLICY "Employees can create their own tickets" ON employee_tickets
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Employees can update their own tickets" ON employee_tickets;
CREATE POLICY "Employees can update their own tickets" ON employee_tickets
  FOR UPDATE USING (true);
