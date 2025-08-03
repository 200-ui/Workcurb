

-- Create RPC function for employee authentication
CREATE OR REPLACE FUNCTION authenticate_employee(employee_email TEXT, employee_password TEXT)
RETURNS TABLE (
  id UUID,
  employee_id TEXT,
  full_name TEXT,
  email TEXT,
  department TEXT,
  designation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.employee_id,
    e.full_name,
    e.email,
    e.department,
    e.designation
  FROM employees e
  WHERE e.email = employee_email 
    AND e.password_hash = crypt(employee_password, e.password_hash)
    AND e.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION authenticate_employee(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_employee(TEXT, TEXT) TO anon;

