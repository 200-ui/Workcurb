
-- Update the authenticate_employee_login function to include company_id
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
$function$
