
-- Create notices table for company announcements
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_attendance_sessions table (restored)
CREATE TABLE public.employee_attendance_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES auth.users(id),
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_number INTEGER NOT NULL,
  check_in_time TIME NOT NULL,
  check_out_time TIME,
  hours_worked NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Present',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, attendance_date, session_number)
);

-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES auth.users(id),
  leave_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_courses table to track course assignments
CREATE TABLE public.employee_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Assigned',
  UNIQUE(employee_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notices
CREATE POLICY "HR can manage notices" ON notices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "Everyone can view active notices" ON notices
  FOR SELECT USING (is_active = true);

-- RLS Policies for employee_attendance_sessions
CREATE POLICY "Employees can manage their own attendance sessions"
  ON employee_attendance_sessions FOR ALL
  USING (true);

CREATE POLICY "HR can manage employee attendance sessions"
  ON employee_attendance_sessions FOR ALL
  USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- RLS Policies for leave_requests
CREATE POLICY "Employees can create leave requests"
  ON leave_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Employees can view their own leave requests"
  ON leave_requests FOR SELECT
  USING (true);

CREATE POLICY "HR can manage company leave requests"
  ON leave_requests FOR ALL
  USING (
    company_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- RLS Policies for employee_courses
CREATE POLICY "Employees can view their assigned courses"
  ON employee_courses FOR SELECT
  USING (true);

CREATE POLICY "Employees can update their course progress"
  ON employee_courses FOR UPDATE
  USING (true);

CREATE POLICY "HR can manage employee course assignments"
  ON employee_courses FOR ALL
  USING (
    assigned_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Enable realtime
ALTER TABLE public.notices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;

ALTER TABLE public.employee_attendance_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_attendance_sessions;

ALTER TABLE public.leave_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;

ALTER TABLE public.employee_courses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_courses;

-- Add constraint to limit sessions per day to 5
ALTER TABLE public.employee_attendance_sessions 
ADD CONSTRAINT check_max_sessions_per_day 
CHECK (session_number >= 1 AND session_number <= 5);
