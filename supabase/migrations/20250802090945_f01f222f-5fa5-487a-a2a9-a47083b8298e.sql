
-- Insert the default admin back into admin_profiles table
INSERT INTO public.admin_profiles (admin_id, password_hash, full_name, email)
VALUES (
  'admin',
  crypt('admin123', gen_salt('bf')),
  'Workcurb Administrator',
  'admin@workcurb.com'
);
