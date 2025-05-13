-- Create the external_participants table
CREATE TABLE external_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_external BOOLEAN NOT NULL DEFAULT TRUE,
  response TEXT NOT NULL DEFAULT 'pending', -- can be 'pending', 'accepted', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on event_id for faster lookups
CREATE INDEX external_participants_event_id_idx ON external_participants(event_id);

-- Create an index on email for faster lookups
CREATE INDEX external_participants_email_idx ON external_participants(email);

-- Add a trigger to update the updated_at timestamp
CREATE TRIGGER set_external_participants_timestamp
BEFORE UPDATE ON external_participants
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 