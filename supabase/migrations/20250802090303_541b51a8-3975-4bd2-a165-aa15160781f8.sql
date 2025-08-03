
-- Create admin_profiles table for Workcurb admin authentication
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for admin authentication (service role access for login function)
CREATE POLICY "Service role can access admin profiles" 
  ON public.admin_profiles 
  FOR ALL 
  USING (true);

-- Create function for admin authentication
CREATE OR REPLACE FUNCTION public.authenticate_admin(p_admin_id TEXT, p_password TEXT)
RETURNS TABLE(
  id UUID,
  admin_id TEXT,
  full_name TEXT,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id,
    ap.admin_id,
    ap.full_name,
    ap.email
  FROM admin_profiles ap
  WHERE ap.admin_id = p_admin_id 
    AND ap.password_hash = crypt(p_password, ap.password_hash)
    AND ap.is_active = true;
END;
$$;

-- Insert a default admin (admin_id: 'admin', password: 'admin123')
INSERT INTO public.admin_profiles (admin_id, password_hash, full_name, email)
VALUES (
  'admin',
  crypt('admin123', gen_salt('bf')),
  'Workcurb Administrator',
  'admin@workcurb.com'
);
