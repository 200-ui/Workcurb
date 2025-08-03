
-- Create employee_attendance_sessions table for multiple clock in/out sessions per day
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

-- Enable Row Level Security
ALTER TABLE public.employee_attendance_sessions ENABLE ROW LEVEL SECURITY;

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

-- Enable realtime
ALTER TABLE public.employee_attendance_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_attendance_sessions;

-- Add constraint to limit sessions per day to 5
ALTER TABLE public.employee_attendance_sessions 
ADD CONSTRAINT check_max_sessions_per_day 
CHECK (session_number >= 1 AND session_number <= 5);
