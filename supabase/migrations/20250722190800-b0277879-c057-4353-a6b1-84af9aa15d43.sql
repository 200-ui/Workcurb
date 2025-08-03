
-- Create a separate table for employee login credentials
CREATE TABLE public.employee_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employee_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies for employee credentials
CREATE POLICY "HR users can manage employee credentials" 
  ON public.employee_credentials 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Add indexes for faster login queries
CREATE INDEX IF NOT EXISTS idx_employee_credentials_email ON employee_credentials(email);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_employee_id ON employee_credentials(employee_id);

-- Function to create employee credentials
CREATE OR REPLACE FUNCTION create_employee_credentials(
  p_employee_id UUID,
  p_email TEXT,
  p_password TEXT
) RETURNS UUID AS $$
DECLARE
  credential_id UUID;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_employee_credentials TO authenticated;

-- Updated function to authenticate employee using the credentials table
CREATE OR REPLACE FUNCTION authenticate_employee_login(employee_email TEXT, employee_password TEXT)
RETURNS TABLE (
  employee_id UUID,
  employee_info_id UUID,
  employee_code TEXT,
  full_name TEXT,
  email TEXT,
  department TEXT,
  designation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ec.employee_id,
    e.id as employee_info_id,
    e.employee_id as employee_code,
    e.full_name,
    ec.email,
    e.department,
    e.designation
  FROM employee_credentials ec
  JOIN employees e ON e.id = ec.employee_id
  WHERE ec.email = employee_email 
    AND ec.password_hash = crypt(employee_password, ec.password_hash)
    AND ec.is_active = true
    AND e.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION authenticate_employee_login(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION authenticate_employee_login(TEXT, TEXT) TO anon;

-- Function to update employee password
CREATE OR REPLACE FUNCTION update_employee_login_password(
  p_email TEXT,
  p_old_password TEXT,
  p_new_password TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  password_valid BOOLEAN := FALSE;
BEGIN
  -- Check if old password is correct
  SELECT EXISTS(
    SELECT 1 FROM employee_credentials 
    WHERE email = p_email 
    AND password_hash = crypt(p_old_password, password_hash)
    AND is_active = true
  ) INTO password_valid;
  
  IF password_valid THEN
    -- Update with new password
    UPDATE employee_credentials 
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = now()
    WHERE email = p_email;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_employee_login_password TO authenticated;
GRANT EXECUTE ON FUNCTION update_employee_login_password TO anon;

-- Enable realtime for employee_credentials table
ALTER TABLE public.employee_credentials REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_credentials;
