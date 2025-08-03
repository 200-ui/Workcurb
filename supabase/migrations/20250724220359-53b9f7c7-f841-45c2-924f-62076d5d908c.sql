
-- Remove leave_requests table completely
DROP TABLE IF EXISTS leave_requests CASCADE;

-- Create shifts table for shift scheduling
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('Morning', 'Afternoon', 'Night')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'completed', 'cancelled')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, shift_date)
);

-- Enable Row Level Security
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for shifts table
CREATE POLICY "HR can manage company shifts" 
  ON public.shifts 
  FOR ALL 
  USING (
    company_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "Employees can view their own shifts" 
  ON public.shifts 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM employees 
      WHERE created_by = company_id
    )
  );

-- Create generated_schedules table to track schedule generation
CREATE TABLE public.generated_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  schedule_data JSONB NOT NULL,
  is_assigned BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for generated_schedules table
CREATE POLICY "HR can manage company generated schedules" 
  ON public.generated_schedules 
  FOR ALL 
  USING (
    company_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

-- Update employee_attendance_sessions to support single session per day
ALTER TABLE public.employee_attendance_sessions 
DROP COLUMN IF EXISTS session_number;

-- Add unique constraint to ensure one session per day per employee
ALTER TABLE public.employee_attendance_sessions 
ADD CONSTRAINT unique_employee_attendance_date 
UNIQUE (employee_id, attendance_date);
