
-- Insert a new admin profile with hashed password
INSERT INTO admin_profiles (
  full_name,
  admin_id,
  email,
  password_hash,
  is_active
) VALUES (
  'System Administrator',
  'admin',
  'admin@workcurb.com',
  crypt('admin123', gen_salt('bf')),
  true
);
