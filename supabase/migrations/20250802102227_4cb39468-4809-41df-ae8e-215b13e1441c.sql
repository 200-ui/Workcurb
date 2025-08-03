
-- Update RLS policies to allow admin access to orders
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders" ON public.orders
  FOR SELECT 
  USING (true);

-- Update RLS policies to allow admin access to user profiles  
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT 
  USING (true);

-- Also ensure admin can update orders if needed
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders" ON public.orders
  FOR UPDATE 
  USING (true);
