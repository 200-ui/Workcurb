
-- Fix the events table RLS policy to allow HR to insert events
DROP POLICY IF EXISTS "HR users can manage their company events" ON events;
CREATE POLICY "HR users can manage their company events" ON events
FOR ALL USING (
  (company_id = auth.uid() OR created_by = auth.uid()) AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
);

-- Ensure attendance sessions have proper company isolation
ALTER TABLE employee_attendance_sessions ADD COLUMN IF NOT EXISTS company_id UUID;

-- Update existing attendance records with company_id
UPDATE employee_attendance_sessions eas
SET company_id = e.created_by
FROM employees e
WHERE eas.employee_id = e.id AND eas.company_id IS NULL;

-- Update attendance RLS policies
DROP POLICY IF EXISTS "HR can manage employee attendance sessions" ON employee_attendance_sessions;
CREATE POLICY "HR can manage employee attendance sessions" ON employee_attendance_sessions
FOR ALL USING (
  company_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
);

-- Add performance ratings company isolation
ALTER TABLE performance_ratings ADD COLUMN IF NOT EXISTS company_id UUID;

-- Update existing performance ratings with company_id
UPDATE performance_ratings pr
SET company_id = e.created_by
FROM employees e
WHERE pr.employee_id = e.id AND pr.company_id IS NULL;

-- Update performance ratings RLS
DROP POLICY IF EXISTS "HR can manage company performance ratings" ON performance_ratings;
CREATE POLICY "HR can manage company performance ratings" ON performance_ratings
FOR ALL USING (
  company_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
);

-- Ensure employee_courses has proper company isolation
ALTER TABLE employee_courses ADD COLUMN IF NOT EXISTS company_id UUID;

-- Update existing employee_courses with company_id
UPDATE employee_courses ec
SET company_id = e.created_by
FROM employees e
WHERE ec.employee_id = e.id AND ec.company_id IS NULL;

-- Update employee_courses RLS
DROP POLICY IF EXISTS "HR can manage employee course assignments" ON employee_courses;
CREATE POLICY "HR can manage employee course assignments" ON employee_courses
FOR ALL USING (
  (assigned_by = auth.uid() OR company_id = auth.uid()) AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
);

-- Fix notices to ensure proper company isolation
DROP POLICY IF EXISTS "HR can manage notices" ON notices;
CREATE POLICY "HR can manage notices" ON notices
FOR ALL USING (
  (created_by = auth.uid() OR company_id = auth.uid()) AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr')
);
