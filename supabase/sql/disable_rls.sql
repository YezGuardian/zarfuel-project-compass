-- WARNING: This file disables Row Level Security for development purposes only.
-- DO NOT use this in production as it will make your data accessible to all users.

-- Disable RLS for invitations table
ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;

-- Disable RLS for profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Ensure the tables are accessible to authenticated users
GRANT ALL ON public.invitations TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Grant admin users ability to create users
-- This requires superuser privileges
DO $$
BEGIN
  -- Try to grant admin users the ability to create users
  EXECUTE format('
    GRANT EXECUTE ON FUNCTION auth.admin_create_user TO authenticated;
  ');
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not grant execute permission on auth.admin_create_user: %', SQLERRM;
END $$; 