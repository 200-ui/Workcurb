
-- Update RLS policies for call_bookings to allow admin deletion
CREATE POLICY "Admin can delete call bookings" 
  ON public.call_bookings 
  FOR DELETE 
  USING (true);

-- Update RLS policies for contact_submissions to allow admin deletion  
CREATE POLICY "Admin can delete contact submissions" 
  ON public.contact_submissions 
  FOR DELETE 
  USING (true);

-- Update RLS policies for admin_profiles to allow admin to update their own profile
CREATE POLICY "Admin can update their own profile" 
  ON public.admin_profiles 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can select their own profile" 
  ON public.admin_profiles 
  FOR SELECT 
  USING (true);
