-- Migration to update meeting_minutes table to support text content
-- Add content column for storing raw text minutes
ALTER TABLE public.meeting_minutes
ADD COLUMN IF NOT EXISTS content TEXT;

-- Make file_path and file_name optional (NULL) since we'll now support text content
ALTER TABLE public.meeting_minutes
ALTER COLUMN file_path DROP NOT NULL;

ALTER TABLE public.meeting_minutes
ALTER COLUMN file_name DROP NOT NULL;

-- Add a column to track the source type of the minutes
ALTER TABLE public.meeting_minutes
ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('file', 'text', 'both')) DEFAULT 'file';

-- Update comment to reflect the new column
COMMENT ON COLUMN public.meeting_minutes.content IS 'Text content of meeting minutes';
COMMENT ON COLUMN public.meeting_minutes.source_type IS 'Source type of meeting minutes: file, text, or both';

-- Update any existing records to have source_type='file'
UPDATE public.meeting_minutes 
SET source_type = 'file' 
WHERE source_type IS NULL; 