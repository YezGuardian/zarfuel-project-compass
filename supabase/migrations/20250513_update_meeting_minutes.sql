-- Create meeting_minutes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.meeting_minutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_minutes' AND column_name = 'file_type') THEN
        ALTER TABLE public.meeting_minutes ADD COLUMN file_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_minutes' AND column_name = 'file_size') THEN
        ALTER TABLE public.meeting_minutes ADD COLUMN file_size BIGINT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_minutes' AND column_name = 'is_published') THEN
        ALTER TABLE public.meeting_minutes ADD COLUMN is_published BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'meeting_minutes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.meeting_minutes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_event_id ON public.meeting_minutes(event_id);

-- Enable RLS
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow select access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow insert access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow update access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow delete access" ON public.meeting_minutes;

-- Create simplified RLS policies
-- Anyone can view published minutes
CREATE POLICY "Allow select access" 
ON public.meeting_minutes
FOR SELECT 
USING (is_published = TRUE);

-- Users can insert their own meeting minutes
CREATE POLICY "Allow insert access" 
ON public.meeting_minutes
FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own meeting minutes or if they created the meeting
CREATE POLICY "Allow update access" 
ON public.meeting_minutes
FOR UPDATE
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = meeting_minutes.event_id 
        AND events.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Users can delete their own meeting minutes or if they created the meeting
CREATE POLICY "Allow delete access" 
ON public.meeting_minutes
FOR DELETE
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = meeting_minutes.event_id 
        AND events.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Add a comment to the file_path column
COMMENT ON COLUMN meeting_minutes.file_path IS 'Public URL to access the document';

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_meeting_minutes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meeting_minutes_timestamp ON meeting_minutes;
CREATE TRIGGER update_meeting_minutes_timestamp
BEFORE UPDATE ON meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION trigger_update_meeting_minutes_timestamp(); 
DROP POLICY IF EXISTS "Allow select access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow insert access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow update access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow delete access" ON public.meeting_minutes;

-- Create simplified RLS policies
-- Anyone can view published minutes
CREATE POLICY "Allow select access" 
ON public.meeting_minutes
FOR SELECT 
USING (is_published = TRUE);

-- Users can insert their own meeting minutes
CREATE POLICY "Allow insert access" 
ON public.meeting_minutes
FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own meeting minutes or if they created the meeting
CREATE POLICY "Allow update access" 
ON public.meeting_minutes
FOR UPDATE
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = meeting_minutes.event_id 
        AND events.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Users can delete their own meeting minutes or if they created the meeting
CREATE POLICY "Allow delete access" 
ON public.meeting_minutes
FOR DELETE
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = meeting_minutes.event_id 
        AND events.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Add a comment to the file_path column
COMMENT ON COLUMN meeting_minutes.file_path IS 'Public URL to access the document';

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_meeting_minutes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meeting_minutes_timestamp ON meeting_minutes;
CREATE TRIGGER update_meeting_minutes_timestamp
BEFORE UPDATE ON meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION trigger_update_meeting_minutes_timestamp(); 
DROP POLICY IF EXISTS "Allow select access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow insert access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow update access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow delete access" ON public.meeting_minutes;

-- Create simplified RLS policies
-- Anyone can view published minutes
CREATE POLICY "Allow select access" 
ON public.meeting_minutes
FOR SELECT 
USING (is_published = TRUE);

-- Users can insert their own meeting minutes
CREATE POLICY "Allow insert access" 
ON public.meeting_minutes
FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own meeting minutes or if they created the meeting
CREATE POLICY "Allow update access" 
ON public.meeting_minutes
FOR UPDATE
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = meeting_minutes.event_id 
        AND events.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Users can delete their own meeting minutes or if they created the meeting
CREATE POLICY "Allow delete access" 
ON public.meeting_minutes
FOR DELETE
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = meeting_minutes.event_id 
        AND events.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Add a comment to the file_path column
COMMENT ON COLUMN meeting_minutes.file_path IS 'Public URL to access the document';

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_meeting_minutes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meeting_minutes_timestamp ON meeting_minutes;
CREATE TRIGGER update_meeting_minutes_timestamp
BEFORE UPDATE ON meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION trigger_update_meeting_minutes_timestamp(); 
DROP POLICY IF EXISTS "Allow select access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow insert access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow update access" ON public.meeting_minutes;
DROP POLICY IF EXISTS "Allow delete access" ON public.meeting_minutes;

-- Create simplified RLS policies
-- Anyone can view published minutes
CREATE POLICY "Allow select access" 
ON public.meeting_minutes
FOR SELECT 
USING (is_published = TRUE);

-- Users can insert their own meeting minutes
CREATE POLICY "Allow insert access" 
ON public.meeting_minutes
FOR INSERT 
WITH CHECK (auth.uid() = uploaded_by);

-- Users can update their own meeting minutes or if they created the meeting
CREATE POLICY "Allow update access" 
ON public.meeting_minutes
FOR UPDATE
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = meeting_minutes.event_id 
        AND events.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Users can delete their own meeting minutes or if they created the meeting
CREATE POLICY "Allow delete access" 
ON public.meeting_minutes
FOR DELETE
USING (
    auth.uid() = uploaded_by OR
    EXISTS (
        SELECT 1 FROM public.events 
        WHERE events.id = meeting_minutes.event_id 
        AND events.created_by = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.is_admin = TRUE
    )
);

-- Add a comment to the file_path column
COMMENT ON COLUMN meeting_minutes.file_path IS 'Public URL to access the document';

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_meeting_minutes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meeting_minutes_timestamp ON meeting_minutes;
CREATE TRIGGER update_meeting_minutes_timestamp
BEFORE UPDATE ON meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION trigger_update_meeting_minutes_timestamp(); 
CREATE TABLE IF NOT EXISTS meeting_minutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type VARCHAR(10) DEFAULT 'pdf',
  file_size BIGINT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Ensure the meeting_minutes table has the right structure
ALTER TABLE IF EXISTS meeting_minutes 
  ADD COLUMN IF NOT EXISTS file_type VARCHAR(10) DEFAULT 'pdf',
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add a comment to the file_path column
COMMENT ON COLUMN meeting_minutes.file_path IS 'Public URL to access the document';

-- Create an index on event_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_event_id ON meeting_minutes(event_id);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_meeting_minutes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meeting_minutes_timestamp ON meeting_minutes;
CREATE TRIGGER update_meeting_minutes_timestamp
BEFORE UPDATE ON meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION trigger_update_meeting_minutes_timestamp(); 