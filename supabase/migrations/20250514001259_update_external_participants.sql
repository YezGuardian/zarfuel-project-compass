-- Drop the existing external_participants table if it exists
DROP TABLE IF EXISTS public.external_participants;

-- Create the updated external_participants table
CREATE TABLE public.external_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_external BOOLEAN NOT NULL DEFAULT TRUE,
  response TEXT NOT NULL DEFAULT 'pending', -- can be 'pending', 'accepted', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on event_id for faster lookups
CREATE INDEX external_participants_event_id_idx ON external_participants(event_id);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_external_participants_timestamp
BEFORE UPDATE ON external_participants
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security
ALTER TABLE public.external_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for external_participants table
-- Allow users to view external participants
CREATE POLICY "Allow users to view external participants" 
ON public.external_participants
FOR SELECT 
USING (true);

-- Allow event creators to add external participants
CREATE POLICY "Allow event creators to add external participants" 
ON public.external_participants
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND created_by = auth.uid()
  )
);

-- Allow event creators to update external participants
CREATE POLICY "Allow event creators to update external participants" 
ON public.external_participants
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND created_by = auth.uid()
  )
);

-- Allow event creators to delete external participants
CREATE POLICY "Allow event creators to delete external participants" 
ON public.external_participants
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND created_by = auth.uid()
  )
);
