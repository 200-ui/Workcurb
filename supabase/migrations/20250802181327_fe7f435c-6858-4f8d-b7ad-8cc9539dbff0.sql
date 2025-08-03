
-- Create shift_schedules table to store generated schedules
CREATE TABLE public.shift_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  schedule_name TEXT NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, assigned, completed
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_shifts table to store individual shift assignments
CREATE TABLE public.employee_shifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.shift_schedules(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  shift_date DATE NOT NULL,
  shift_type TEXT NOT NULL, -- morning, afternoon, evening, night
  shift_start_time TIME NOT NULL,
  shift_end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, shift_date) -- Ensure one shift per day per employee
);

-- Create shift_templates table for predefined shift times
CREATE TABLE public.shift_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  shift_type TEXT NOT NULL,
  shift_name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on all tables
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for shift_schedules
CREATE POLICY "HR can manage their company shift schedules"
  ON public.shift_schedules
  FOR ALL
  USING (
    company_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "Employees can view their company shift schedules"
  ON public.shift_schedules
  FOR SELECT
  USING (
    company_id IN (
      SELECT created_by FROM employees 
      WHERE id = auth.uid()
    )
  );

-- RLS policies for employee_shifts
CREATE POLICY "HR can manage their company employee shifts"
  ON public.employee_shifts
  FOR ALL
  USING (
    company_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "Employees can view their own shifts"
  ON public.employee_shifts
  FOR SELECT
  USING (
    company_id IN (
      SELECT created_by FROM employees 
      WHERE id = auth.uid()
    ) OR
    employee_id IN (
      SELECT id FROM employees 
      WHERE created_by = company_id
    )
  );

-- RLS policies for shift_templates
CREATE POLICY "HR can manage their company shift templates"
  ON public.shift_templates
  FOR ALL
  USING (
    company_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

-- Create function to generate automatic shift schedule
CREATE OR REPLACE FUNCTION public.generate_shift_schedule(
  p_company_id UUID,
  p_schedule_name TEXT,
  p_week_start_date DATE
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  schedule_id UUID;
  emp_record RECORD;
  day_offset INTEGER;
  shift_types TEXT[] := ARRAY['morning', 'afternoon', 'evening', 'night'];
  shift_times JSONB := '{
    "morning": {"start": "06:00", "end": "14:00"},
    "afternoon": {"start": "14:00", "end": "22:00"},
    "evening": {"start": "16:00", "end": "00:00"},
    "night": {"start": "22:00", "end": "06:00"}
  }';
  current_date DATE;
  assigned_days INTEGER;
  last_shift_type TEXT;
  selected_shift_type TEXT;
  employee_shift_count INTEGER;
BEGIN
  -- Create the schedule
  INSERT INTO public.shift_schedules (
    company_id, schedule_name, week_start_date, week_end_date, created_by, status
  ) VALUES (
    p_company_id, p_schedule_name, p_week_start_date, p_week_start_date + INTERVAL '6 days', p_company_id, 'draft'
  ) RETURNING id INTO schedule_id;

  -- Get all active employees for this company
  FOR emp_record IN (
    SELECT id, full_name FROM employees 
    WHERE created_by = p_company_id AND is_active = true
  ) LOOP
    assigned_days := 0;
    last_shift_type := '';
    
    -- Assign exactly 5 working days per employee
    FOR day_offset IN 0..6 LOOP
      current_date := p_week_start_date + day_offset;
      
      -- Skip if already assigned 5 days
      IF assigned_days >= 5 THEN
        CONTINUE;
      END IF;
      
      -- Simple fair distribution logic
      -- Skip 2 days randomly for rest days
      IF (day_offset = 5 OR day_offset = 6) AND assigned_days = 5 THEN
        CONTINUE;
      END IF;
      
      -- Select shift type with constraints
      selected_shift_type := shift_types[1 + (day_offset % 4)]; -- Simple rotation
      
      -- Avoid consecutive night shifts
      IF last_shift_type = 'night' AND selected_shift_type = 'night' THEN
        selected_shift_type := 'morning';
      END IF;
      
      -- Avoid night followed by morning (minimum rest time)
      IF last_shift_type = 'night' AND selected_shift_type = 'morning' THEN
        selected_shift_type := 'afternoon';
      END IF;
      
      -- Insert the shift
      INSERT INTO public.employee_shifts (
        schedule_id, employee_id, company_id, shift_date, shift_type,
        shift_start_time, shift_end_time
      ) VALUES (
        schedule_id, emp_record.id, p_company_id, current_date, selected_shift_type,
        (shift_times->selected_shift_type->>'start')::TIME,
        (shift_times->selected_shift_type->>'end')::TIME
      );
      
      assigned_days := assigned_days + 1;
      last_shift_type := selected_shift_type;
      
      -- Ensure exactly 5 days, break if we have them
      IF assigned_days = 5 THEN
        EXIT;
      END IF;
    END LOOP;
  END LOOP;

  RETURN schedule_id;
END;
$$;

-- Create function to assign schedule to employees
CREATE OR REPLACE FUNCTION public.assign_shift_schedule(
  p_schedule_id UUID,
  p_company_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update schedule status to assigned
  UPDATE public.shift_schedules 
  SET status = 'assigned', updated_at = now()
  WHERE id = p_schedule_id AND company_id = p_company_id;
  
  -- Update all shifts in this schedule to confirmed
  UPDATE public.employee_shifts 
  SET status = 'confirmed', updated_at = now()
  WHERE schedule_id = p_schedule_id AND company_id = p_company_id;
  
  RETURN true;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_employee_shifts_employee_date ON public.employee_shifts(employee_id, shift_date);
CREATE INDEX idx_employee_shifts_schedule ON public.employee_shifts(schedule_id);
CREATE INDEX idx_shift_schedules_company ON public.shift_schedules(company_id);

-- Add updated_at trigger
CREATE TRIGGER update_shift_schedules_updated_at
  BEFORE UPDATE ON public.shift_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_shifts_updated_at
  BEFORE UPDATE ON public.employee_shifts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
