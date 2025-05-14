-- Fix the row-level security policy for meeting_minutes table

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow insert access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow select access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow update access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow delete access" ON public.meeting_minutes;

-- Ensure RLS is enabled
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Allow insert for any authenticated user
CREATE POLICY "Allow insert minutes for authenticated users" 
ON public.meeting_minutes
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Allow select access to all authenticated users
CREATE POLICY "Allow select minutes for authenticated users" 
ON public.meeting_minutes
FOR SELECT
TO authenticated
USING (true);

-- Allow update only to the user who created the minute
CREATE POLICY "Allow update own minutes only" 
ON public.meeting_minutes
FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by)
WITH CHECK (auth.uid() = uploaded_by);

-- Allow delete only to the user who created the minute
CREATE POLICY "Allow delete own minutes only" 
ON public.meeting_minutes
FOR DELETE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Add content column if it doesn't exist
ALTER TABLE public.meeting_minutes ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.meeting_minutes ADD COLUMN IF NOT EXISTS source_type TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.meeting_minutes.content IS 'Text content for meeting minutes';
COMMENT ON COLUMN public.meeting_minutes.source_type IS 'Source type of minutes (file, text, or both)'; 