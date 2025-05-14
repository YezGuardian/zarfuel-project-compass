# Fixing Permission Issues in Supabase

The application is currently experiencing permission errors when trying to:
1. View invitations in the InvitationsList component
2. Create new users in the InviteUserForm component

## Root Cause

These issues occur because Row Level Security (RLS) policies are not properly configured for the `invitations` and `profiles` tables in your Supabase database.

## Solution 1: Configure RLS Policies (Recommended for Production)

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Navigate to your project
3. Go to the SQL Editor
4. Create a new query and paste the contents of the `supabase/sql/fix_permissions.sql` file
5. Run the SQL query to apply the permissions

The SQL script will:
1. Enable Row Level Security (RLS) for the `invitations` and `profiles` tables
2. Create policies that allow:
   - Authenticated users to view invitations and profiles
   - Admin users to create, update, and delete invitations
   - Users to update their own profiles
   - Admin users to create profiles for new users
3. Try to grant execute permissions on the admin.createUser function

## Solution 2: Disable RLS (Easier for Development)

For development environments, you can simply disable RLS:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Create a new query and paste the contents of the `supabase/sql/disable_rls.sql` file
4. Run the SQL query

This will:
1. Disable Row Level Security for the relevant tables
2. Grant all permissions to authenticated users
3. Try to grant execute permissions on the admin.createUser function

## Solution 3: Use Service Role Client (Implemented)

We've updated the `InviteUserForm.tsx` component to use a service role client for admin operations. This approach:

1. Creates a special Supabase client with service role permissions
2. Uses this client to bypass RLS when creating users and profiles
3. Requires the `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` environment variable to be set

To set up the service role key:
1. Go to your Supabase project settings
2. Navigate to API section
3. Copy the "service_role key" (NOT the anon key)
4. Add it to your environment variables as `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

> **IMPORTANT**: The service role key has full access to your database, bypassing all RLS policies. In production, you should never expose this key to the client. Instead, use a server-side API endpoint to perform these operations.

## Verifying the Fix

After applying one of the solutions:
1. Refresh your application
2. Try viewing the invitations list
3. Try inviting a new user

The errors should no longer appear, and the functionality should work as expected.

## Additional Information

For more information on Supabase Row Level Security, see:
https://supabase.com/docs/guides/auth/row-level-security 