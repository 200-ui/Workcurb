
-- Create the missing database function for generating shift schedules
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
  week_end_date DATE;
BEGIN
  -- Calculate week end date
  week_end_date := p_week_start_date + INTERVAL '6 days';

  -- Create the schedule
  INSERT INTO public.shift_schedules (
    company_id, schedule_name, week_start_date, week_end_date, created_by, status
  ) VALUES (
    p_company_id, p_schedule_name, p_week_start_date, week_end_date, p_company_id, 'draft'
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

      -- Skip weekends for some employees (simple rest day logic)
      IF day_offset >= 5 AND assigned_days = 5 THEN
        CONTINUE;
      END IF;

      -- Select shift type with simple rotation
      selected_shift_type := shift_types[1 + (day_offset % 4)];

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

      -- Break if we have 5 days assigned
      IF assigned_days = 5 THEN
        EXIT;
      END IF;
    END LOOP;
  END LOOP;

  RETURN schedule_id;
END;
$$;

-- Also create the assign schedule function
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
