
-- Update the create_employee_credentials function to include company_id parameter
CREATE OR REPLACE FUNCTION public.create_employee_credentials(
  p_employee_id uuid, 
  p_email text, 
  p_password text, 
  p_company_id uuid
)
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
$function$
