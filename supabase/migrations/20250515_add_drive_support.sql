-- Add Google Drive support fields to meeting_minutes table
ALTER TABLE meeting_minutes 
  ADD COLUMN IF NOT EXISTS drive_file_id TEXT,
  ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

-- Add index for drive_file_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_meeting_minutes_drive_file_id 
ON meeting_minutes(drive_file_id);

-- Update any RLS policies to ensure viewing access
DROP POLICY IF EXISTS "Anyone can view published meeting minutes" ON meeting_minutes;
CREATE POLICY "Anyone can view published meeting minutes"
ON meeting_minutes FOR SELECT
USING (
  is_published = TRUE
);

-- Everyone can insert meeting minutes with drive IDs
DROP POLICY IF EXISTS "Anyone can insert meeting minutes" ON meeting_minutes;
CREATE POLICY "Anyone can insert meeting minutes"
ON meeting_minutes FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  drive_file_id IS NOT NULL
);

-- Comment for added columns
COMMENT ON COLUMN meeting_minutes.drive_file_id IS 'Google Drive file ID for direct access';
COMMENT ON COLUMN meeting_minutes.drive_folder_id IS 'Google Drive folder ID where the file is stored'; 