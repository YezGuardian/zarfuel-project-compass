-- Fix meeting_minutes table to ensure proper structure and relationships

-- Ensure meeting_minutes table exists
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  file_path TEXT,
  file_name TEXT,
  content TEXT,
  source_type TEXT CHECK (source_type IN ('file', 'text', 'both')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for clarity
COMMENT ON TABLE public.meeting_minutes IS 'Stores meeting minutes, both as text and file uploads';
COMMENT ON COLUMN public.meeting_minutes.event_id IS 'Reference to the meeting event';
COMMENT ON COLUMN public.meeting_minutes.file_path IS 'Path to the uploaded file (if any)';
COMMENT ON COLUMN public.meeting_minutes.file_name IS 'Name of the uploaded file (if any)';
COMMENT ON COLUMN public.meeting_minutes.content IS 'Text content of the meeting minutes (if any)';
COMMENT ON COLUMN public.meeting_minutes.source_type IS 'Type of minutes: file, text, or both';
COMMENT ON COLUMN public.meeting_minutes.uploaded_by IS 'User who created the minutes';

-- Fix any existing records that have null source_type
UPDATE public.meeting_minutes
SET source_type = 
  CASE 
    WHEN content IS NOT NULL AND (file_path IS NOT NULL AND file_path != '') THEN 'both'
    WHEN content IS NOT NULL THEN 'text'
    ELSE 'file'
  END
WHERE source_type IS NULL;

-- Fix any records with NULL created_at or updated_at
UPDATE public.meeting_minutes
SET created_at = NOW()
WHERE created_at IS NULL;

UPDATE public.meeting_minutes
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- Create trigger for automatic updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_meeting_minutes_updated_at ON public.meeting_minutes;
CREATE TRIGGER set_meeting_minutes_updated_at
BEFORE UPDATE ON public.meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow insert minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow select minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow update own minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow delete own minutes" ON public.meeting_minutes;

-- Create RLS policies
CREATE POLICY "Allow insert minutes"
ON public.meeting_minutes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow select minutes"
ON public.meeting_minutes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow update own minutes"
ON public.meeting_minutes
FOR UPDATE
TO authenticated
USING (auth.uid() = uploaded_by);

CREATE POLICY "Allow delete own minutes"
ON public.meeting_minutes
FOR DELETE
TO authenticated
USING (auth.uid() = uploaded_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_event_id ON public.meeting_minutes(event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_uploaded_by ON public.meeting_minutes(uploaded_by); 