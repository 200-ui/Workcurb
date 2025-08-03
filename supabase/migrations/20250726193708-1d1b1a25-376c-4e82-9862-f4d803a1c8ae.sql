
-- First, let's check and fix the employee_credentials table structure
-- Drop and recreate the function to ensure it returns company_id properly
DROP FUNCTION IF EXISTS public.authenticate_employee_login(text, text);

-- Recreate the function with explicit company_id return
CREATE OR REPLACE FUNCTION public.authenticate_employee_login(employee_email text, employee_password text)
RETURNS TABLE(
  employee_id uuid, 
  employee_info_id uuid, 
  employee_code text, 
  full_name text, 
  email text, 
  department text, 
  designation text, 
  company_id uuid
)
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
    AND e.is_active = true;
END;
$function$;

-- Ensure all employee_credentials have company_id populated
UPDATE employee_credentials 
SET company_id = e.created_by
FROM employees e
WHERE employee_credentials.employee_id = e.id 
AND (employee_credentials.company_id IS NULL OR employee_credentials.company_id != e.created_by);

-- Make company_id required for future records
ALTER TABLE employee_credentials 
ALTER COLUMN company_id SET NOT NULL;

-- Update the create_employee_credentials function to always require company_id
CREATE OR REPLACE FUNCTION public.create_employee_credentials(p_employee_id uuid, p_email text, p_password text, p_company_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  credential_id UUID;
BEGIN
  -- Delete any existing credentials for this employee
  DELETE FROM employee_credentials WHERE employee_id = p_employee_id;
  
  INSERT INTO employee_credentials (
    employee_id,
    email,
    password_hash,
    company_id,
    is_active
  ) VALUES (
    p_employee_id,
    p_email,
    crypt(p_password, gen_salt('bf')),
    p_company_id,
    true
  ) RETURNING id INTO credential_id;
  
  RETURN credential_id;
END;
$function$;
