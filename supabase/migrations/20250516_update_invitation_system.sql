-- Add comments to the default_password column in invitations table
COMMENT ON COLUMN public.invitations.default_password IS 'Default password set by admin when inviting a user. Users will be prompted to change this on first login.';

-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS invitations_email_idx ON public.invitations (email); 