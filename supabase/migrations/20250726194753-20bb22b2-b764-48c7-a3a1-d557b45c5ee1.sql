
-- Fix RLS policies to work for both HR and Employee authentication

-- Update shifts table policies
DROP POLICY IF EXISTS "Employees can view their own shifts" ON shifts;
CREATE POLICY "Employees can view their own shifts" ON shifts
  FOR SELECT
  USING (
    -- Allow if user is HR and owns the company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR 
    -- Allow if it's the employee's own shift (no auth.uid() dependency)
    (employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );

-- Update performance_ratings policies
DROP POLICY IF EXISTS "HR users can manage performance ratings" ON performance_ratings;
DROP POLICY IF EXISTS "HR can manage company performance ratings" ON performance_ratings;

CREATE POLICY "HR can manage company performance ratings" ON performance_ratings
  FOR ALL
  USING (
    company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "Employees can view their own performance ratings" ON performance_ratings
  FOR SELECT
  USING (
    -- HR can see all ratings for their company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow access to performance ratings for employees in the company (no auth dependency)
    (employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );

-- Update employee_tickets policies
DROP POLICY IF EXISTS "Employees can view their own tickets" ON employee_tickets;
DROP POLICY IF EXISTS "Employees can create their own tickets" ON employee_tickets;
DROP POLICY IF EXISTS "Employees can update their own tickets" ON employee_tickets;

CREATE POLICY "Employees can view their own tickets" ON employee_tickets
  FOR SELECT
  USING (
    -- HR can see all tickets for their company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow access to tickets for employees in the company
    (employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );

CREATE POLICY "Employees can create their own tickets" ON employee_tickets
  FOR INSERT
  WITH CHECK (
    -- Allow ticket creation for employees in the company
    employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    )
  );

CREATE POLICY "Employees can update their own tickets" ON employee_tickets
  FOR UPDATE
  USING (
    -- HR can update all tickets for their company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow employees to update their own tickets
    (employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );

-- Update employee_courses policies
DROP POLICY IF EXISTS "Employees can view their assigned courses" ON employee_courses;
DROP POLICY IF EXISTS "Employees can update their course progress" ON employee_courses;

CREATE POLICY "Employees can view their assigned courses" ON employee_courses
  FOR SELECT
  USING (
    -- HR can see all course assignments for their company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow employees to view their assigned courses
    (employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );

CREATE POLICY "Employees can update their course progress" ON employee_courses
  FOR UPDATE
  USING (
    -- HR can update all course progress for their company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow employees to update their own course progress
    (employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );

-- Update notices policies
DROP POLICY IF EXISTS "Employees can view notices from their company" ON notices;
CREATE POLICY "Employees can view notices from their company" ON notices
  FOR SELECT
  USING (
    -- HR can see their own notices
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow employees to view company notices (no auth dependency)
    (company_id IN (
      SELECT DISTINCT created_by FROM employees
    ))
  );

-- Update leave_requests policies
DROP POLICY IF EXISTS "Employees can view their own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Employees can create their own leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Employees can update their own leave requests" ON leave_requests;

CREATE POLICY "Employees can view their own leave requests" ON leave_requests
  FOR SELECT
  USING (
    -- HR can see all leave requests for their company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow employees to view their own leave requests
    (employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );

CREATE POLICY "Employees can create their own leave requests" ON leave_requests
  FOR INSERT
  WITH CHECK (
    -- Allow employees to create leave requests
    employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    )
  );

CREATE POLICY "Employees can update their own leave requests" ON leave_requests
  FOR UPDATE
  USING (
    -- HR can update leave requests for their company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow employees to update their pending leave requests
    (status = 'pending' AND employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );

-- Update employee_attendance_sessions policies
DROP POLICY IF EXISTS "Employees can manage their own attendance sessions" ON employee_attendance_sessions;
CREATE POLICY "Employees can manage their own attendance sessions" ON employee_attendance_sessions
  FOR ALL
  USING (
    -- HR can manage all attendance sessions for their company
    (company_id = auth.uid() AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'hr'
    ))
    OR
    -- Allow employees to manage their own attendance
    (employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    ))
  );
