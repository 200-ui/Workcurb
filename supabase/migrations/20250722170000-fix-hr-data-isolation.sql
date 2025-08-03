
-- Fix employees table RLS policies to ensure HR users only see their own employees
DROP POLICY IF EXISTS "HR users can view employees in their organization" ON public.employees;
DROP POLICY IF EXISTS "HR users can create employees" ON public.employees;
DROP POLICY IF EXISTS "HR users can update employees" ON public.employees;
DROP POLICY IF EXISTS "HR users can delete employees" ON public.employees;

-- Create new policies that strictly isolate data by HR user
CREATE POLICY "HR users can view their own employees" 
  ON public.employees 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "HR users can create their own employees" 
  ON public.employees 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "HR users can update their own employees" 
  ON public.employees 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "HR users can delete their own employees" 
  ON public.employees 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND created_by = auth.uid()
  );

-- Fix attendance table RLS policies
DROP POLICY IF EXISTS "HR users can manage attendance" ON public.attendance;

CREATE POLICY "HR users can manage their employees attendance" 
  ON public.attendance 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = attendance.employee_id 
      AND employees.created_by = auth.uid()
    )
  );

-- Fix performance_ratings table RLS policies
DROP POLICY IF EXISTS "HR users can manage performance ratings" ON public.performance_ratings;

CREATE POLICY "HR users can manage their employees performance ratings" 
  ON public.performance_ratings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND (
      rated_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM employees 
        WHERE employees.id = performance_ratings.employee_id 
        AND employees.created_by = auth.uid()
      )
    )
  );

-- Fix courses table RLS policies
DROP POLICY IF EXISTS "HR users can manage courses" ON public.courses;

CREATE POLICY "HR users can manage their own courses" 
  ON public.courses 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND created_by = auth.uid()
  );

-- Fix events table RLS policies
DROP POLICY IF EXISTS "HR users can manage events" ON public.events;

CREATE POLICY "HR users can manage their own events" 
  ON public.events 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND created_by = auth.uid()
  );

-- Fix tickets table RLS policies for HR users
DROP POLICY IF EXISTS "HR users can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "HR users can update tickets" ON public.tickets;

CREATE POLICY "HR users can view tickets for their employees" 
  ON public.tickets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND (
      assigned_to = auth.uid()
      OR EXISTS (
        SELECT 1 FROM employees 
        WHERE employees.id = tickets.raised_by 
        AND employees.created_by = auth.uid()
      )
    )
  );

CREATE POLICY "HR users can update tickets for their employees" 
  ON public.tickets 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
    AND (
      assigned_to = auth.uid()
      OR EXISTS (
        SELECT 1 FROM employees 
        WHERE employees.id = tickets.raised_by 
        AND employees.created_by = auth.uid()
      )
    )
  );
