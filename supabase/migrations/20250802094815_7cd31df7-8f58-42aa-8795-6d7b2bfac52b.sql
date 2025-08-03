
-- Create a function to update admin password with proper hashing
CREATE OR REPLACE FUNCTION public.update_admin_password(
  p_admin_id uuid,
  p_old_password text,
  p_new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  password_valid BOOLEAN := FALSE;
BEGIN
  -- Check if old password is correct
  SELECT EXISTS(
    SELECT 1 FROM admin_profiles 
    WHERE id = p_admin_id 
    AND password_hash = crypt(p_old_password, password_hash)
    AND is_active = true
  ) INTO password_valid;
  
  IF password_valid THEN
    -- Update with new hashed password
    UPDATE admin_profiles 
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = p_admin_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Create a function to update admin profile without password
CREATE OR REPLACE FUNCTION public.update_admin_profile(
  p_admin_id uuid,
  p_full_name text,
  p_admin_username text,
  p_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE admin_profiles 
  SET full_name = p_full_name,
      admin_id = p_admin_username,
      email = p_email,
      updated_at = now()
  WHERE id = p_admin_id;
  
  RETURN TRUE;
END;
$$;
