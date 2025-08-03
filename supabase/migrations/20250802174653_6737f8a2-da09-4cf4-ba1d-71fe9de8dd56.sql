
-- Drop all shift scheduling related tables and views
DROP VIEW IF EXISTS schedule_validation CASCADE;
DROP VIEW IF EXISTS schedule_overview CASCADE;
DROP VIEW IF EXISTS employee_scheduling_constraints CASCADE;

DROP TABLE IF EXISTS schedule_assignments CASCADE;
DROP TABLE IF EXISTS schedule_generation_logs CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS employee_shift_preferences CASCADE;

-- Drop any related functions
DROP FUNCTION IF EXISTS validate_shift_assignment() CASCADE;
DROP FUNCTION IF EXISTS validate_five_work_days() CASCADE;
DROP FUNCTION IF EXISTS validate_rest_time() CASCADE;
DROP FUNCTION IF EXISTS validate_one_shift_per_day() CASCADE;
DROP FUNCTION IF EXISTS verify_shift_scheduling_schema() CASCADE;
