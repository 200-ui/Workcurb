
-- First, let's check the current state of employee_credentials table
-- and update it to ensure company_id is properly populated

-- Update employee_credentials to populate company_id from employees table where missing
UPDATE employee_credentials 
SET company_id = employees.created_by
FROM employees 
WHERE employee_credentials.employee_id = employees.id 
AND employee_credentials.company_id IS NULL;

-- Ensure company_id is not nullable going forward (after we've populated existing data)
ALTER TABLE employee_credentials 
ALTER COLUMN company_id SET NOT NULL;

-- Create an index for better performance on the join
CREATE INDEX IF NOT EXISTS idx_employee_credentials_company_id 
ON employee_credentials(company_id);

-- Also ensure the authenticate_employee_login function handles NULL company_id gracefully
CREATE OR REPLACE FUNCTION public.authenticate_employee_login(employee_email text, employee_password text)
 RETURNS TABLE(employee_id uuid, employee_info_id uuid, employee_code text, full_name text, email text, department text, designation text, company_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ec.employee_id,
    e.id as employee_info_id,
    e.employee_id as employee_code,
    e.full_name,
    ec.email,
    e.department,
    e.designation,
    COALESCE(ec.company_id, e.created_by) as company_id
  FROM employee_credentials ec
  JOIN employees e ON e.id = ec.employee_id
  WHERE ec.email = employee_email 
    AND ec.password_hash = crypt(employee_password, ec.password_hash)
    AND ec.is_active = true
    AND e.is_active = true
    AND (ec.company_id IS NOT NULL OR e.created_by IS NOT NULL);
END;
$function$
