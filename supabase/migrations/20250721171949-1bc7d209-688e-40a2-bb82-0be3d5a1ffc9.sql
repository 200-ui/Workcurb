
-- Create notices table for HR notice board functionality
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  department TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hr_todos table for HR task management
CREATE TABLE public.hr_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_todos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notices
CREATE POLICY "HR users can view all notices" ON public.notices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "HR users can create notices" ON public.notices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "HR users can update their own notices" ON public.notices
  FOR UPDATE USING (
    created_by = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "HR users can delete their own notices" ON public.notices
  FOR DELETE USING (
    created_by = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

-- Create RLS policies for hr_todos
CREATE POLICY "HR users can view their own todos" ON public.hr_todos
  FOR SELECT USING (
    created_by = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "HR users can create their own todos" ON public.hr_todos
  FOR INSERT WITH CHECK (
    created_by = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "HR users can update their own todos" ON public.hr_todos
  FOR UPDATE USING (
    created_by = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );

CREATE POLICY "HR users can delete their own todos" ON public.hr_todos
  FOR DELETE USING (
    created_by = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'hr'
    )
  );
