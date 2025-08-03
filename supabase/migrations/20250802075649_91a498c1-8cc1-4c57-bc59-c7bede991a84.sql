
-- Remove notices table and related data
DROP TABLE IF EXISTS public.notices CASCADE;

-- Remove any todo-related tables if they exist
DROP TABLE IF EXISTS public.todos CASCADE;
DROP TABLE IF EXISTS public.hr_todos CASCADE;

-- Clean up any functions related to notices or todos
DROP FUNCTION IF EXISTS public.handle_notice_changes() CASCADE;
DROP FUNCTION IF EXISTS public.handle_todo_changes() CASCADE;
