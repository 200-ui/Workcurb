
-- First, let's verify the tables exist and check their structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('shift_schedules', 'employee_shifts', 'shift_templates')
ORDER BY table_name, ordinal_position;

-- Also check if the functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('generate_shift_schedule', 'assign_shift_schedule');

-- If tables don't exist, let's recreate them with proper structure
DO $$ 
BEGIN
    -- Drop tables if they exist (in correct order due to foreign keys)
    DROP TABLE IF EXISTS public.employee_shifts CASCADE;
    DROP TABLE IF EXISTS public.shift_schedules CASCADE;
    DROP TABLE IF EXISTS public.shift_templates CASCADE;
    
    -- Recreate shift_schedules table
    CREATE TABLE public.shift_schedules (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID NOT NULL,
        schedule_name TEXT NOT NULL,
        week_start_date DATE NOT NULL,
        week_end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    );

    -- Recreate employee_shifts table
    CREATE TABLE public.employee_shifts (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        schedule_id UUID NOT NULL REFERENCES public.shift_schedules(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL,
        company_id UUID NOT NULL,
        shift_date DATE NOT NULL,
        shift_type TEXT NOT NULL,
        shift_start_time TIME NOT NULL,
        shift_end_time TIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        UNIQUE(employee_id, shift_date)
    );

    -- Enable RLS
    ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.employee_shifts ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies for shift_schedules
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

    -- Create RLS policies for employee_shifts  
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
            employee_id IN (
                SELECT id FROM employees 
                WHERE created_by = company_id
            )
        );

    -- Create indexes
    CREATE INDEX idx_employee_shifts_employee_date ON public.employee_shifts(employee_id, shift_date);
    CREATE INDEX idx_employee_shifts_schedule ON public.employee_shifts(schedule_id);
    CREATE INDEX idx_shift_schedules_company ON public.shift_schedules(company_id);

    -- Add triggers for updated_at
    CREATE TRIGGER update_shift_schedules_updated_at
        BEFORE UPDATE ON public.shift_schedules
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER update_employee_shifts_updated_at
        BEFORE UPDATE ON public.employee_shifts
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

END $$;
