
-- Ensure employees table has the required fields for authentication
-- Add unique constraint on employee_id if it doesn't exist
DO $$ 
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'employees_employee_id_key' 
        AND table_name = 'employees'
    ) THEN
        ALTER TABLE employees ADD CONSTRAINT employees_employee_id_key UNIQUE (employee_id);
    END IF;
END $$;

-- Update the employees table to ensure employee_id is required
ALTER TABLE employees ALTER COLUMN employee_id SET NOT NULL;
ALTER TABLE employees ALTER COLUMN password_hash SET NOT NULL;

-- Add index for faster login queries
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
