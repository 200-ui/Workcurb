
-- Add country and city fields to employees table and update department options
ALTER TABLE public.employees DROP COLUMN IF EXISTS location;
ALTER TABLE public.employees ADD COLUMN country TEXT;
ALTER TABLE public.employees ADD COLUMN city TEXT;

-- Update department field to match new requirements (IT, Marketing, Sales, HR, Finance, Operations)
-- Note: This will update existing data, you may want to review existing department values first

-- Create notices table for HR-specific notice board
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create HR todos table for today's tasks
CREATE TABLE public.hr_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for notices
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can view all notices" ON public.notices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can create notices" ON public.notices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can update their own notices" ON public.notices
  FOR UPDATE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can delete their own notices" ON public.notices
  FOR DELETE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Add RLS policies for hr_todos
ALTER TABLE public.hr_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can view their own todos" ON public.hr_todos
  FOR SELECT USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can create their own todos" ON public.hr_todos
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can update their own todos" ON public.hr_todos
  FOR UPDATE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can delete their own todos" ON public.hr_todos
  FOR DELETE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Enable realtime for new tables
ALTER TABLE public.notices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;

ALTER TABLE public.hr_todos REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.hr_todos;

-- Update RLS policies to ensure HR data isolation (each HR sees only their own data)
-- Update employees policies to be HR-specific
DROP POLICY IF EXISTS "HR users can view employees in their organization" ON public.employees;
DROP POLICY IF EXISTS "HR users can create employees" ON public.employees;
DROP POLICY IF EXISTS "HR users can update employees" ON public.employees;
DROP POLICY IF EXISTS "HR users can delete employees" ON public.employees;

CREATE POLICY "HR users can view their own employees" ON public.employees
  FOR SELECT USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can create their own employees" ON public.employees
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can update their own employees" ON public.employees
  FOR UPDATE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "HR users can delete their own employees" ON public.employees
  FOR DELETE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Update other table policies for HR data isolation
DROP POLICY IF EXISTS "HR users can manage events" ON public.events;
CREATE POLICY "HR users can manage their own events" ON public.events
  FOR ALL USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

DROP POLICY IF EXISTS "HR users can manage courses" ON public.courses;
CREATE POLICY "HR users can manage their own courses" ON public.courses
  FOR ALL USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

DROP POLICY IF EXISTS "HR users can manage performance ratings" ON public.performance_ratings;
CREATE POLICY "HR users can manage their employees' performance ratings" ON public.performance_ratings
  FOR ALL USING (
    rated_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

DROP POLICY IF EXISTS "HR users can manage attendance" ON public.attendance;
CREATE POLICY "HR users can manage their employees' attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE employees.id = attendance.employee_id 
      AND employees.created_by = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );
