-- SQL Script to create/fix the events and event_participants tables

-- Check if events table exists and create it if not
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_meeting BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check if event_participants table exists and create it if not
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  response TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to tables for clarity
COMMENT ON TABLE public.events IS 'Stores all calendar events and meetings';
COMMENT ON TABLE public.event_participants IS 'Stores participants for events marked as meetings';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_created_by_idx ON public.events(created_by);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON public.events(start_time);
CREATE INDEX IF NOT EXISTS event_participants_event_id_idx ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS event_participants_user_id_idx ON public.event_participants(user_id);

-- Add instruction for the user
SELECT 'This script will fix your events and event_participants tables. Run this in the Supabase SQL Editor.' as message;
