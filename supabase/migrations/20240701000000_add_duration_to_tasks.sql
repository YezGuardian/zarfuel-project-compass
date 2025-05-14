-- Migration to add duration column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS duration TEXT;

-- Update the comment on the table
COMMENT ON COLUMN public.tasks.duration IS 'Text description of task duration (e.g., "2 weeks")';

-- Ensure the RLS policies are maintained
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY; 