-- Migration to fix relationships between meeting_minutes and profiles tables

-- Ensure meeting_minutes table has updated_at column
ALTER TABLE public.meeting_minutes 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to meeting_minutes
DROP TRIGGER IF EXISTS set_updated_at ON public.meeting_minutes;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Fix relationship between uploaded_by and profiles table
COMMENT ON COLUMN public.meeting_minutes.uploaded_by IS 'Reference to the user who uploaded the minutes (references auth.users.id and profiles.id)';

-- Update RLS policies to allow all authenticated users to add minutes
DROP POLICY IF EXISTS "Allow admins to add meeting minutes" ON public.meeting_minutes;
CREATE POLICY "Allow all users to add meeting minutes" 
ON public.meeting_minutes
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Ensure the profiles join works properly in queries
CREATE OR REPLACE VIEW view_meeting_minutes AS
SELECT 
  mm.*,
  p.first_name,
  p.last_name,
  p.email
FROM public.meeting_minutes mm
LEFT JOIN public.profiles p ON mm.uploaded_by = p.id;

-- Add comment for the view
COMMENT ON VIEW view_meeting_minutes IS 'View that joins meeting minutes with uploader profile information'; 