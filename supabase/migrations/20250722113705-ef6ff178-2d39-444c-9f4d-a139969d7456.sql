
-- Create events table for calendar functionality
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT,
  event_type TEXT DEFAULT 'meeting',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance_ratings table for employee performance tracking
CREATE TABLE public.performance_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  productivity INTEGER CHECK (productivity >= 0 AND productivity <= 10),
  quality INTEGER CHECK (quality >= 0 AND quality <= 10),
  teamwork INTEGER CHECK (teamwork >= 0 AND teamwork <= 10),
  punctuality INTEGER CHECK (punctuality >= 0 AND punctuality <= 10),
  overall_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN productivity IS NOT NULL AND quality IS NOT NULL AND teamwork IS NOT NULL AND punctuality IS NOT NULL
      THEN ((productivity + quality + teamwork + punctuality) * 100.0 / 40.0)
      ELSE NULL
    END
  ) STORED,
  rated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id)
);

-- Create courses table for learning management
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  duration TEXT,
  course_url TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'Beginner',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table for issue tracking
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  category TEXT,
  raised_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attendance table for attendance tracking
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status TEXT DEFAULT 'Present',
  hours_worked DECIMAL(4,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

-- Add RLS policies for events table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Add RLS policies for performance_ratings table
ALTER TABLE public.performance_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can manage performance ratings" ON public.performance_ratings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Add RLS policies for courses table
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can manage courses" ON public.courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Add RLS policies for tickets table
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can view all tickets" ON public.tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (raised_by = auth.uid());

CREATE POLICY "HR users can update tickets" ON public.tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Add RLS policies for attendance table
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR users can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'hr'
    )
  );

-- Enable realtime for all new tables
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

ALTER TABLE public.performance_ratings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_ratings;

ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.courses;

ALTER TABLE public.tickets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;

ALTER TABLE public.attendance REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;

-- Add employee credentials for login (extend employees table)
ALTER TABLE public.employees ADD COLUMN employee_id TEXT UNIQUE;
ALTER TABLE public.employees ADD COLUMN password_hash TEXT;
ALTER TABLE public.employees ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update employees table with position/designation field
ALTER TABLE public.employees ADD COLUMN designation TEXT;
ALTER TABLE public.employees ADD COLUMN join_date DATE DEFAULT CURRENT_DATE;
