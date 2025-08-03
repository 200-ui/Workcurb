
-- Remove the unused tickets table since HR no longer creates their own tickets
-- Only employee_tickets table is now used for employee-to-HR support tickets
DROP TABLE IF EXISTS public.tickets;
