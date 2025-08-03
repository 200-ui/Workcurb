
-- Create a table for contact form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for call booking submissions
CREATE TABLE public.call_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anyone to insert data (public forms)
CREATE POLICY "Anyone can submit contact form" 
  ON public.contact_submissions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can book a call" 
  ON public.call_bookings 
  FOR INSERT 
  WITH CHECK (true);

-- Create policies for admin access (you'll need these later for viewing submissions)
CREATE POLICY "Admin can view contact submissions" 
  ON public.contact_submissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can view call bookings" 
  ON public.call_bookings 
  FOR SELECT 
  USING (true);
