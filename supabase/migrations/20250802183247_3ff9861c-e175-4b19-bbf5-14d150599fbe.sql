
-- Drop existing functions if they exist to ensure clean recreation
DROP FUNCTION IF EXISTS public.generate_shift_schedule(UUID, TEXT, DATE);
DROP FUNCTION IF EXISTS public.assign_shift_schedule(UUID, UUID);

-- Recreate the generate_shift_schedule function with proper security and error handling
CREATE OR REPLACE FUNCTION public.generate_shift_schedule(
  p_company_id UUID,
  p_schedule_name TEXT,
  p_week_start_date DATE
) 
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  schedule_id UUID;
  emp_record RECORD;
  day_offset INTEGER;
  shift_types TEXT[] := ARRAY['morning', 'afternoon', 'evening'];
  current_date DATE;
  assigned_days INTEGER;
  week_end_date DATE;
  employee_count INTEGER;
BEGIN
  -- Log the start of function execution
  RAISE LOG 'Starting generate_shift_schedule for company % with schedule %', p_company_id, p_schedule_name;

  -- Calculate week end date
  week_end_date := p_week_start_date + INTERVAL '6 days';

  -- Check if there are active employees
  SELECT COUNT(*) INTO employee_count
  FROM employees 
  WHERE created_by = p_company_id AND is_active = true;
  
  IF employee_count = 0 THEN
    RAISE EXCEPTION 'No active employees found for company %', p_company_id;
  END IF;

  RAISE LOG 'Found % active employees', employee_count;

  -- Create the schedule
  INSERT INTO shift_schedules (
    company_id, 
    schedule_name, 
    week_start_date, 
    week_end_date, 
    created_by, 
    status
  ) VALUES (
    p_company_id, 
    p_schedule_name, 
    p_week_start_date, 
    week_end_date, 
    p_company_id, 
    'draft'
  ) RETURNING id INTO schedule_id;

  RAISE LOG 'Created schedule with ID %', schedule_id;

  -- Get all active employees for this company and assign shifts
  FOR emp_record IN (
    SELECT id, full_name 
    FROM employees 
    WHERE created_by = p_company_id AND is_active = true
  ) LOOP
    assigned_days := 0;

    -- Assign shifts for the week (skip weekends for simplicity)
    FOR day_offset IN 0..4 LOOP  -- Monday to Friday
      current_date := p_week_start_date + day_offset;

      -- Simple shift assignment: rotate through shift types
      INSERT INTO employee_shifts (
        schedule_id, 
        employee_id, 
        company_id, 
        shift_date, 
        shift_type,
        shift_start_time, 
        shift_end_time,
        status
      ) VALUES (
        schedule_id, 
        emp_record.id, 
        p_company_id, 
        current_date, 
        shift_types[1 + (day_offset % 3)],
        CASE 
          WHEN shift_types[1 + (day_offset % 3)] = 'morning' THEN '06:00'::TIME
          WHEN shift_types[1 + (day_offset % 3)] = 'afternoon' THEN '14:00'::TIME
          ELSE '18:00'::TIME
        END,
        CASE 
          WHEN shift_types[1 + (day_offset % 3)] = 'morning' THEN '14:00'::TIME
          WHEN shift_types[1 + (day_offset % 3)] = 'afternoon' THEN '22:00'::TIME
          ELSE '02:00'::TIME
        END,
        'scheduled'
      );

      assigned_days := assigned_days + 1;
    END LOOP;

    RAISE LOG 'Assigned % days to employee %', assigned_days, emp_record.full_name;
  END LOOP;

  RAISE LOG 'Successfully generated schedule with ID %', schedule_id;
  RETURN schedule_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in generate_shift_schedule: %', SQLERRM;
    RAISE;
END;
$$;

-- Recreate the assign_shift_schedule function
CREATE OR REPLACE FUNCTION public.assign_shift_schedule(
  p_schedule_id UUID,
  p_company_id UUID
) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  schedule_exists BOOLEAN;
BEGIN
  -- Log the start of function execution
  RAISE LOG 'Starting assign_shift_schedule for schedule % and company %', p_schedule_id, p_company_id;

  -- Check if schedule exists and belongs to the company
  SELECT EXISTS(
    SELECT 1 FROM shift_schedules 
    WHERE id = p_schedule_id AND company_id = p_company_id
  ) INTO schedule_exists;

  IF NOT schedule_exists THEN
    RAISE EXCEPTION 'Schedule % not found for company %', p_schedule_id, p_company_id;
  END IF;

  -- Update schedule status to assigned
  UPDATE shift_schedules 
  SET status = 'assigned', updated_at = NOW()
  WHERE id = p_schedule_id AND company_id = p_company_id;

  -- Update all shifts in this schedule to confirmed
  UPDATE employee_shifts 
  SET status = 'confirmed', updated_at = NOW()
  WHERE schedule_id = p_schedule_id AND company_id = p_company_id;

  RAISE LOG 'Successfully assigned schedule %', p_schedule_id;
  RETURN TRUE;

EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in assign_shift_schedule: %', SQLERRM;
    RAISE;
END;
$$;

-- Grant execute permissions to ensure the functions are accessible
GRANT EXECUTE ON FUNCTION public.generate_shift_schedule(UUID, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_shift_schedule(UUID, TEXT, DATE) TO service_role;

GRANT EXECUTE ON FUNCTION public.assign_shift_schedule(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_shift_schedule(UUID, UUID) TO service_role;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
