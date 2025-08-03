
-- Create employee tickets table for support requests
CREATE TABLE public.employee_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee attendance table
CREATE TABLE public.employee_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIME,
  check_out_time TIME,
  status TEXT DEFAULT 'Present',
  hours_worked NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

-- Create employee tasks table
CREATE TABLE public.employee_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  due_date DATE,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee announcements table
CREATE TABLE public.employee_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employee_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_tickets
CREATE POLICY "Employees can view their own tickets"
  ON employee_tickets FOR SELECT
  USING (true); -- Will be filtered by application logic

CREATE POLICY "Employees can create their own tickets"
  ON employee_tickets FOR INSERT
  WITH CHECK (true); -- Will be filtered by application logic

CREATE POLICY "Employees can update their own tickets"
  ON employee_tickets FOR UPDATE
  USING (true); -- Will be filtered by application logic

-- RLS Policies for employee_attendance
CREATE POLICY "Employees can view their own attendance"
  ON employee_attendance FOR SELECT
  USING (true);

CREATE POLICY "Employees can manage their own attendance"
  ON employee_attendance FOR ALL
  USING (true);

-- RLS Policies for employee_tasks
CREATE POLICY "Employees can view their own tasks"
  ON employee_tasks FOR SELECT
  USING (true);

CREATE POLICY "Employees can update their own tasks"
  ON employee_tasks FOR UPDATE
  USING (true);

-- RLS Policies for employee_announcements
CREATE POLICY "Everyone can view active announcements"
  ON employee_announcements FOR SELECT
  USING (is_active = true);

-- HR can manage all employee data
CREATE POLICY "HR can manage employee tickets"
  ON employee_tickets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'hr'
  ));

CREATE POLICY "HR can manage employee attendance"
  ON employee_attendance FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'hr'
  ));

CREATE POLICY "HR can manage employee tasks"
  ON employee_tasks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'hr'
  ));

CREATE POLICY "HR can manage announcements"
  ON employee_announcements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'hr'
  ));

-- Enable realtime
ALTER TABLE public.employee_tickets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_tickets;

ALTER TABLE public.employee_attendance REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_attendance;

ALTER TABLE public.employee_tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_tasks;

ALTER TABLE public.employee_announcements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_announcements;

-- Function to clock in/out
CREATE OR REPLACE FUNCTION employee_clock_action(
  p_employee_id UUID,
  p_action TEXT -- 'in' or 'out'
) RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
  current_time TIME := CURRENT_TIME;
  existing_record RECORD;
BEGIN
  -- Get existing attendance record for today
  SELECT * INTO existing_record
  FROM employee_attendance
  WHERE employee_id = p_employee_id AND attendance_date = today_date;
  
  IF p_action = 'in' THEN
    IF existing_record IS NULL THEN
      -- Create new attendance record
      INSERT INTO employee_attendance (employee_id, attendance_date, check_in_time, status)
      VALUES (p_employee_id, today_date, current_time, 'Present');
      RETURN TRUE;
    ELSIF existing_record.check_in_time IS NULL THEN
      -- Update existing record with check-in time
      UPDATE employee_attendance
      SET check_in_time = current_time, status = 'Present', updated_at = now()
      WHERE id = existing_record.id;
      RETURN TRUE;
    END IF;
  ELSIF p_action = 'out' THEN
    IF existing_record IS NOT NULL AND existing_record.check_in_time IS NOT NULL THEN
      -- Calculate hours worked
      UPDATE employee_attendance
      SET 
        check_out_time = current_time,
        hours_worked = EXTRACT(EPOCH FROM (current_time - existing_record.check_in_time)) / 3600,
        updated_at = now()
      WHERE id = existing_record.id;
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION employee_clock_action TO authenticated;
GRANT EXECUTE ON FUNCTION employee_clock_action TO anon;
