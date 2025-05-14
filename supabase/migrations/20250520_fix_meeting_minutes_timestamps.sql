-- Ensure meeting_minutes table has proper timestamps
-- This migration addresses the "Could not find the 'updated_at' column" error

-- First, ensure the table exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'meeting_minutes'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.meeting_minutes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
      file_path TEXT,
      file_name TEXT,
      content TEXT,
      source_type TEXT CHECK (source_type IN ('file', 'text', 'both')),
      uploaded_by UUID REFERENCES auth.users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Now ensure the columns exist and have correct settings
DO $$
BEGIN
  -- Check if updated_at column exists and create it if not
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'meeting_minutes' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.meeting_minutes ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  ELSE
    -- Ensure the column has the correct type
    ALTER TABLE public.meeting_minutes ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at::TIMESTAMPTZ;
    ALTER TABLE public.meeting_minutes ALTER COLUMN updated_at SET DEFAULT NOW();
    ALTER TABLE public.meeting_minutes ALTER COLUMN updated_at SET NOT NULL;
  END IF;

  -- Check if created_at column exists and create it if not
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'meeting_minutes' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.meeting_minutes ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  ELSE
    -- Ensure the column has the correct type
    ALTER TABLE public.meeting_minutes ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at::TIMESTAMPTZ;
    ALTER TABLE public.meeting_minutes ALTER COLUMN created_at SET DEFAULT NOW();
    ALTER TABLE public.meeting_minutes ALTER COLUMN created_at SET NOT NULL;
  END IF;
END
$$;

-- Set updated_at to NOW() if it's NULL
UPDATE public.meeting_minutes
SET updated_at = NOW()
WHERE updated_at IS NULL;

-- Set created_at to NOW() if it's NULL
UPDATE public.meeting_minutes
SET created_at = NOW()
WHERE created_at IS NULL;

-- Set appropriate type for source_type if needed
DO $$
BEGIN
  -- Update source_type for records where it might be NULL or invalid
  UPDATE public.meeting_minutes
  SET source_type = 
    CASE 
      WHEN content IS NOT NULL AND content != '' AND (file_path IS NOT NULL AND file_path != '') THEN 'both'
      WHEN content IS NOT NULL AND content != '' THEN 'text'
      WHEN file_path IS NOT NULL AND file_path != '' THEN 'file'
      ELSE 'text' -- Default to text
    END
  WHERE source_type IS NULL OR source_type NOT IN ('file', 'text', 'both');
END
$$;

-- Create or replace the trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS set_meeting_minutes_updated_at ON public.meeting_minutes;
CREATE TRIGGER set_meeting_minutes_updated_at
BEFORE UPDATE ON public.meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_column();

-- Recreate RLS policies
-- First drop existing policies
DROP POLICY IF EXISTS "Allow insert minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow select minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow update own minutes" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow delete own minutes" ON public.meeting_minutes;

-- Create new policies
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

-- Create appropriate indexes
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_event_id ON public.meeting_minutes(event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_uploaded_by ON public.meeting_minutes(uploaded_by); 