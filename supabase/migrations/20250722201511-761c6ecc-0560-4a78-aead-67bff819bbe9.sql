
-- Fix the employee_clock_action function to handle clock out properly
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
    IF existing_record IS NOT NULL AND existing_record.check_in_time IS NOT NULL AND existing_record.check_out_time IS NULL THEN
      -- Calculate hours worked and update
      UPDATE employee_attendance
      SET 
        check_out_time = current_time,
        hours_worked = EXTRACT(EPOCH FROM (current_time - existing_record.check_in_time)) / 3600,
        updated_at = now()
      WHERE id = existing_record.id;
      RETURN TRUE;
    ELSE
      -- Cannot clock out (not clocked in or already clocked out)
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add company_id to relevant tables for proper isolation
ALTER TABLE employee_tickets ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES auth.users(id);
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES auth.users(id);
ALTER TABLE performance_ratings ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES auth.users(id);

-- Update existing records to have company_id (set it to the employee's created_by)
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

UPDATE performance_ratings 
SET company_id = rated_by 
WHERE company_id IS NULL;

-- Update RLS policies for better company isolation
DROP POLICY IF EXISTS "HR can manage employee tickets" ON employee_tickets;
CREATE POLICY "HR can manage employee tickets" ON employee_tickets
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

DROP POLICY IF EXISTS "HR can manage employee attendance" ON employee_attendance;
CREATE POLICY "HR can manage employee attendance" ON employee_attendance
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

DROP POLICY IF EXISTS "HR users can manage their employees' performance ratings" ON performance_ratings;
CREATE POLICY "HR can manage performance ratings" ON performance_ratings
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );
