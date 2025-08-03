
-- Drop the shifts table and all related data
DROP TABLE IF EXISTS public.shifts CASCADE;

-- Remove any references or dependencies that might exist
-- (The CASCADE will handle foreign key constraints if any exist)
