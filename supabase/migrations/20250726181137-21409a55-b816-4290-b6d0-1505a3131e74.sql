
-- Update employee_credentials table to include company_id if not already present
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employee_credentials' AND column_name = 'company_id') THEN
        ALTER TABLE employee_credentials ADD COLUMN company_id uuid;
    END IF;
END $$;

-- Update existing employee_credentials records to have company_id from their associated employee
UPDATE employee_credentials 
SET company_id = employees.created_by 
FROM employees 
WHERE employee_credentials.employee_id = employees.id 
AND employee_credentials.company_id IS NULL;

-- Make company_id not nullable for future records
ALTER TABLE employee_credentials ALTER COLUMN company_id SET NOT NULL;

-- Update the create_employee_credentials function to include company_id
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

-- Update authenticate_employee_login function to return company_id
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
    ec.company_id
  FROM employee_credentials ec
  JOIN employees e ON e.id = ec.employee_id
  WHERE ec.email = employee_email 
    AND ec.password_hash = crypt(employee_password, ec.password_hash)
    AND ec.is_active = true
    AND e.is_active = true;
END;
$function$;

-- Function to generate secure random password
CREATE OR REPLACE FUNCTION public.generate_employee_password()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$function$;
