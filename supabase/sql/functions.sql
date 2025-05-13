-- This is a SQL function that allows inserting events with admin privileges
-- This function bypasses RLS policies

-- Function to insert an event
CREATE OR REPLACE FUNCTION public.insert_event(event_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the creator (usually admin)
AS $$
DECLARE
  new_id uuid;
  result jsonb;
BEGIN
  -- Insert the event
  INSERT INTO public.events (
    title,
    description,
    start_time,
    end_time,
    location,
    is_meeting,
    created_by,
    created_at,
    updated_at
  )
  VALUES (
    event_data->>'title',
    event_data->>'description',
    (event_data->>'start_time')::timestamptz,
    (event_data->>'end_time')::timestamptz,
    event_data->>'location',
    (event_data->>'is_meeting')::boolean,
    (event_data->>'created_by')::uuid,
    (event_data->>'created_at')::timestamptz,
    (event_data->>'updated_at')::timestamptz
  )
  RETURNING id INTO new_id;
  
  -- Get the inserted row
  SELECT jsonb_build_object(
    'id', id,
    'title', title,
    'description', description,
    'start_time', start_time,
    'end_time', end_time,
    'location', location,
    'is_meeting', is_meeting,
    'created_by', created_by,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result
  FROM public.events
  WHERE id = new_id;
  
  RETURN result;
END;
$$; 