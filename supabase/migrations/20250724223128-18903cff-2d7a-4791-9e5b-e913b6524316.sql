
-- Create shifts table for shift scheduling
CREATE TABLE public.shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create policies for shifts
CREATE POLICY "HR can manage company shifts" 
  ON public.shifts 
  FOR ALL 
  USING (
    (company_id = auth.uid()) AND 
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'hr'))
  );

CREATE POLICY "Employees can view their own shifts" 
  ON public.shifts 
  FOR SELECT 
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE created_by = company_id
    )
  );

-- Remove hr_todos table completely
DROP TABLE IF EXISTS public.hr_todos CASCADE;

-- Add realtime for shifts
ALTER TABLE public.shifts REPLICA IDENTITY FULL;
