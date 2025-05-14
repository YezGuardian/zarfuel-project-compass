-- Add duration column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS duration TEXT;

-- Add comment explaining what this column is for
COMMENT ON COLUMN public.tasks.duration IS 'Text description of task duration (e.g., "2 weeks")';

-- Display completion message
SELECT 'Duration column added to tasks table' as result; 