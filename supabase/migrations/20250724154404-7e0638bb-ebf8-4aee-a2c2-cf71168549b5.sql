
-- Add unique constraint for employee_id per company (created_by represents the company/HR)
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_employee_id_key;
ALTER TABLE employees ADD CONSTRAINT employees_employee_id_created_by_unique UNIQUE (employee_id, created_by);

-- Add unique constraint for email per company to allow same email across different companies
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE employees ADD CONSTRAINT employees_email_created_by_unique UNIQUE (email, created_by);

-- Update employee_credentials table to also be company-specific
ALTER TABLE employee_credentials DROP CONSTRAINT IF EXISTS employee_credentials_email_key;
ALTER TABLE employee_credentials ADD CONSTRAINT employee_credentials_email_company_unique UNIQUE (email, employee_id);

-- Update the create_employee_credentials function to handle company-specific credentials
CREATE OR REPLACE FUNCTION public.create_employee_credentials(p_employee_id uuid, p_email text, p_password text)
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
    is_active
  ) VALUES (
    p_employee_id,
    p_email,
    crypt(p_password, gen_salt('bf')),
    true
  ) RETURNING id INTO credential_id;
  
  RETURN credential_id;
END;
$function$;
