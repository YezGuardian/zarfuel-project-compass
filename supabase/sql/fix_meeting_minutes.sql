-- Fix relationship between meeting_minutes and profiles

-- First, ensure the meeting_minutes table exists with proper relations
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for clarity
COMMENT ON TABLE public.meeting_minutes IS 'Stores uploaded meeting minutes files';
COMMENT ON COLUMN public.meeting_minutes.event_id IS 'Reference to the event/meeting';
COMMENT ON COLUMN public.meeting_minutes.uploaded_by IS 'Reference to the user who uploaded the file';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS meeting_minutes_event_id_idx ON public.meeting_minutes(event_id);
CREATE INDEX IF NOT EXISTS meeting_minutes_uploaded_by_idx ON public.meeting_minutes(uploaded_by);

-- Enable Row Level Security
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for meeting_minutes table
-- Allow users to view meeting minutes
CREATE POLICY "Allow users to view meeting minutes" 
ON public.meeting_minutes
FOR SELECT 
USING (true);

-- Allow admins to add meeting minutes
CREATE POLICY "Allow admins to add meeting minutes" 
ON public.meeting_minutes
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    JOIN public.profiles ON auth.users.id = public.profiles.id
    WHERE auth.users.id = auth.uid() 
    AND (public.profiles.role = 'admin' OR public.profiles.role = 'superadmin')
  )
);

-- Allow uploaders to update their own uploads
CREATE POLICY "Allow uploaders to update their own minutes" 
ON public.meeting_minutes
FOR UPDATE 
USING (uploaded_by = auth.uid());

-- Allow uploaders to delete their own uploads
CREATE POLICY "Allow uploaders to delete their own minutes" 
ON public.meeting_minutes
FOR DELETE 
USING (uploaded_by = auth.uid()); 