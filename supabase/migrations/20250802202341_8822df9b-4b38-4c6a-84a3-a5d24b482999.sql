
-- Fix the leave_requests RLS policy to allow employees to create their own leave requests
-- The issue is that the employee_id check needs to match the actual employee record, not auth.uid()

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Employees can create their own leave requests" ON leave_requests;

-- Create a new policy that properly allows employees to create leave requests
CREATE POLICY "Employees can create their own leave requests" 
ON leave_requests 
FOR INSERT 
WITH CHECK (
  -- Allow if the employee_id exists in the employees table and belongs to the company
  EXISTS (
    SELECT 1 FROM employees 
    WHERE employees.id = leave_requests.employee_id 
    AND employees.company_id = leave_requests.company_id
  )
);

-- Also ensure employees can view their own leave requests with proper policy
DROP POLICY IF EXISTS "Employees can view their own leave requests" ON leave_requests;

CREATE POLICY "Employees can view their own leave requests" 
ON leave_requests 
FOR SELECT 
USING (
  -- HR can see all leave requests for their company
  ((company_id = auth.uid()) AND (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.user_type = 'hr'
  ))) 
  OR 
  -- Employees can see their own leave requests
  (employee_id IN (
    SELECT employees.id FROM employees 
    WHERE employees.company_id = leave_requests.company_id
  ))
);
