
-- Update employee_attendance_sessions to ensure company_id is properly set
UPDATE employee_attendance_sessions 
SET company_id = (
  SELECT e.created_by 
  FROM employees e 
  WHERE e.id = employee_attendance_sessions.employee_id
)
WHERE company_id IS NULL;

-- Make company_id not nullable to ensure proper data integrity
ALTER TABLE employee_attendance_sessions 
ALTER COLUMN company_id SET NOT NULL;

-- Update performance_ratings to ensure company_id is properly set
UPDATE performance_ratings 
SET company_id = (
  SELECT e.created_by 
  FROM employees e 
  WHERE e.id = performance_ratings.employee_id
)
WHERE company_id IS NULL;

-- Make company_id not nullable for performance_ratings
ALTER TABLE performance_ratings 
ALTER COLUMN company_id SET NOT NULL;

-- Update employee_tickets to ensure company_id is properly set
UPDATE employee_tickets 
SET company_id = (
  SELECT e.created_by 
  FROM employees e 
  WHERE e.id = employee_tickets.employee_id
)
WHERE company_id IS NULL;

-- Make company_id not nullable for employee_tickets
ALTER TABLE employee_tickets 
ALTER COLUMN company_id SET NOT NULL;

-- Update notices to ensure they have company_id for proper scoping
ALTER TABLE notices ADD COLUMN company_id UUID REFERENCES auth.users(id);

-- Update existing notices with company_id
UPDATE notices 
SET company_id = created_by 
WHERE company_id IS NULL;

-- Make company_id not nullable for notices
ALTER TABLE notices 
ALTER COLUMN company_id SET NOT NULL;

-- Update RLS policies for notices to be company-scoped
DROP POLICY IF EXISTS "HR users can view all notices" ON notices;
CREATE POLICY "HR users can view company notices" ON notices
  FOR SELECT USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'hr'
    )
  );

-- Update RLS policies for employee_tickets to ensure proper scoping
DROP POLICY IF EXISTS "HR can manage employee tickets" ON employee_tickets;
CREATE POLICY "HR can manage company employee tickets" ON employee_tickets
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'hr'
    )
  );

-- Update RLS policies for performance_ratings to ensure proper scoping
DROP POLICY IF EXISTS "HR can manage performance ratings" ON performance_ratings;
CREATE POLICY "HR can manage company performance ratings" ON performance_ratings
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'hr'
    )
  );

-- Update RLS policies for employee_attendance_sessions to ensure proper scoping
DROP POLICY IF EXISTS "HR can manage employee attendance sessions" ON employee_attendance_sessions;
CREATE POLICY "HR can manage company attendance sessions" ON employee_attendance_sessions
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.user_type = 'hr'
    )
  );
