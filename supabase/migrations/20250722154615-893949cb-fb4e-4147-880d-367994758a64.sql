
-- Add country and city columns to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Remove the location column if it still exists
ALTER TABLE public.employees DROP COLUMN IF EXISTS location;
