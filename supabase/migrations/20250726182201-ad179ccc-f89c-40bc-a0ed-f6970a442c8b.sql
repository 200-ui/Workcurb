
-- Remove the generate_employee_password function since we're now generating passwords in the frontend
DROP FUNCTION IF EXISTS public.generate_employee_password();
