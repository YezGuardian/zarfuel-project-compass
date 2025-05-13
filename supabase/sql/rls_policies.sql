-- Row Level Security policies for events table
-- These policies need to be applied in the Supabase dashboard or using migrations

-- First, enable RLS on the events table if it's not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view any event
CREATE POLICY "Allow users to view any event" 
ON public.events
FOR SELECT 
USING (true);

-- Create policy to allow authenticated users to insert events
CREATE POLICY "Allow authenticated users to insert events" 
ON public.events
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Create policy to allow event creators to update their own events
CREATE POLICY "Allow event creators to update their own events" 
ON public.events
FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Create policy to allow event creators to delete their own events
CREATE POLICY "Allow event creators to delete their own events" 
ON public.events
FOR DELETE 
USING (auth.uid() = created_by);

-- Also enable RLS for event_participants table
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view participants
CREATE POLICY "Allow users to view event participants" 
ON public.event_participants
FOR SELECT 
USING (true);

-- Create policy to allow event creators to add participants
CREATE POLICY "Allow event creators to add participants" 
ON public.event_participants
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND created_by = auth.uid()
  )
);

-- Create policy to allow users to update their own responses
CREATE POLICY "Allow users to update their own responses" 
ON public.event_participants
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create policy to allow event creators to delete participants
CREATE POLICY "Allow event creators to delete participants" 
ON public.event_participants
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND created_by = auth.uid()
  )
); 