
-- First, let's ensure the notices table has proper structure for HR-to-Employee flow
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES auth.users(id);

-- Update notices RLS policies to allow proper data flow
DROP POLICY IF EXISTS "HR users can view company notices" ON public.notices;
DROP POLICY IF EXISTS "Employees can view company notices" ON public.notices;

-- HR can manage their own notices
CREATE POLICY "HR users can manage their own notices" ON public.notices
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Employees can view notices from their company
CREATE POLICY "Employees can view notices from their company" ON public.notices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = auth.uid() AND e.created_by = notices.company_id
    )
  );

-- Update employee_announcements to use company_id properly
ALTER TABLE public.employee_announcements ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES auth.users(id);

-- Update employee_announcements RLS policies
DROP POLICY IF EXISTS "HR can manage announcements" ON public.employee_announcements;
DROP POLICY IF EXISTS "Everyone can view active announcements" ON public.employee_announcements;

CREATE POLICY "HR can manage their company announcements" ON public.employee_announcements
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "Employees can view active announcements from their company" ON public.employee_announcements
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = auth.uid() AND e.created_by = employee_announcements.company_id
    )
  );

-- Ensure performance_ratings has proper company_id structure
ALTER TABLE public.performance_ratings ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES auth.users(id);

-- Update performance_ratings RLS policies for proper data flow
DROP POLICY IF EXISTS "HR can manage company performance ratings" ON public.performance_ratings;
DROP POLICY IF EXISTS "Employees can view their own performance ratings" ON public.performance_ratings;

CREATE POLICY "HR can manage their company performance ratings" ON public.performance_ratings
  FOR ALL USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "Employees can view their own performance ratings" ON public.performance_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = employee_id AND e.id = auth.uid()
    )
  );

-- Enable realtime for all tables that need synchronization
ALTER TABLE public.notices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;

ALTER TABLE public.employee_announcements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_announcements;

ALTER TABLE public.performance_ratings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_ratings;

-- employee_tickets and employee_attendance_sessions should already be enabled for realtime
