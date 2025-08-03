
-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'annual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID,
  reviewed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on leave_requests
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for leave_requests
CREATE POLICY "Employees can create their own leave requests" 
  ON public.leave_requests 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Employees can view their own leave requests" 
  ON public.leave_requests 
  FOR SELECT 
  USING (true);

CREATE POLICY "Employees can update their own leave requests" 
  ON public.leave_requests 
  FOR UPDATE 
  USING (status = 'pending');

CREATE POLICY "HR can manage company leave requests" 
  ON public.leave_requests 
  FOR ALL 
  USING ((company_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.user_type = 'hr'::text)))));

-- Add real-time support for leave_requests
ALTER TABLE public.leave_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
