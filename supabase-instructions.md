# Supabase SQL Instructions

To fix the permissions issues with your Supabase database, you need to run the SQL script that disables Row Level Security (RLS) for development purposes.

## Steps to Run the SQL Script

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Navigate to your project (auswnhnpeetphmlqtecs)
3. Go to the SQL Editor (left sidebar)
4. Create a new query
5. Copy and paste the following SQL:

```sql
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
```

6. Click the "Run" button to execute the SQL
7. If you see any errors about the function not existing, you can ignore them - the key part is disabling RLS

## What This Does

This SQL script:
1. Disables Row Level Security for the `invitations` and `profiles` tables
2. Grants all permissions on these tables to authenticated users
3. Attempts to grant execute permission on the admin.createUser function

## After Running the SQL

After running the SQL script and with the environment variables set up:
1. Your development server should be running with the new environment variables
2. The permissions issues should be resolved
3. You should be able to invite users and view invitations without permission errors

## Security Warning

This approach is only suitable for development. For production, you should implement proper Row Level Security policies or use a server-side API for admin operations. 