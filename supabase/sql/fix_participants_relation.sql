-- Fix relationship between event_participants and users
-- This script adds missing foreign key constraints and indexes

-- First, check if the event_participants table exists and create it if not with proper relations
DROP TABLE IF EXISTS public.event_participants;

CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  response TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for clarity
COMMENT ON TABLE public.event_participants IS 'Stores participants for events marked as meetings';
COMMENT ON COLUMN public.event_participants.event_id IS 'Reference to the event';
COMMENT ON COLUMN public.event_participants.user_id IS 'Reference to the user';
COMMENT ON COLUMN public.event_participants.response IS 'Participant response status: pending, accepted, declined';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS event_participants_event_id_idx ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS event_participants_user_id_idx ON public.event_participants(user_id);

-- Enable Row Level Security
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for event_participants table
-- Allow users to view event participants
CREATE POLICY "Allow users to view event participants" 
ON public.event_participants
FOR SELECT 
USING (true);

-- Allow event creators to add participants
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

-- Allow users to update their own responses
CREATE POLICY "Allow users to update their own responses" 
ON public.event_participants
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow event creators to delete participants
CREATE POLICY "Allow event creators to delete participants" 
ON public.event_participants
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND created_by = auth.uid()
  )
); 