
-- Add company_id to tables that need company isolation
ALTER TABLE notices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES profiles(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES profiles(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES profiles(id);

-- Update existing records to set company_id (this will set it to the creator's ID)
UPDATE notices SET company_id = created_by WHERE company_id IS NULL;
UPDATE events SET company_id = created_by WHERE company_id IS NULL;
UPDATE courses SET company_id = created_by WHERE company_id IS NULL;

-- Update RLS policies for company isolation

-- Notices policies
DROP POLICY IF EXISTS "Everyone can view active notices" ON notices;
CREATE POLICY "Employees can view notices from their company" ON notices
FOR SELECT USING (
  company_id IN (
    SELECT created_by FROM employees WHERE id = auth.uid()
  ) OR 
  company_id = auth.uid()
);

-- Events policies  
DROP POLICY IF EXISTS "HR users can manage events" ON events;
CREATE POLICY "HR users can manage their company events" ON events
FOR ALL USING (company_id = auth.uid() AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
));

CREATE POLICY "Employees can view their company events" ON events
FOR SELECT USING (
  company_id IN (
    SELECT created_by FROM employees WHERE id = auth.uid()
  )
);

-- Courses policies
DROP POLICY IF EXISTS "HR users can manage courses" ON courses;
CREATE POLICY "HR users can manage their company courses" ON courses
FOR ALL USING (company_id = auth.uid() AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
));

CREATE POLICY "Employees can view their company courses" ON courses
FOR SELECT USING (
  company_id IN (
    SELECT created_by FROM employees WHERE id = auth.uid()
  )
);

-- Fix leave requests to ensure HR receives them properly
-- The issue is that employee_id should reference the employees table, not be a UUID
-- Let's add a proper foreign key constraint
ALTER TABLE leave_requests 
ADD CONSTRAINT fk_leave_requests_employee 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE;

-- Update leave requests RLS to ensure proper company isolation
DROP POLICY IF EXISTS "HR can manage company leave requests" ON leave_requests;
CREATE POLICY "HR can manage company leave requests" ON leave_requests
FOR ALL USING (company_id = auth.uid() AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
));

-- Employee credentials should also have company isolation
ALTER TABLE employee_credentials ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES profiles(id);

-- Update employee_credentials with company_id from the employees table
UPDATE employee_credentials ec
SET company_id = e.created_by
FROM employees e
WHERE ec.employee_id = e.id AND ec.company_id IS NULL;

-- Update employee_credentials RLS
DROP POLICY IF EXISTS "HR users can manage employee credentials" ON employee_credentials;
CREATE POLICY "HR users can manage their company employee credentials" ON employee_credentials
FOR ALL USING (company_id = auth.uid() AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
));
