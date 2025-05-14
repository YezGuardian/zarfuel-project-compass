-- Enable Row Level Security for invitations table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view invitations
CREATE POLICY "Allow authenticated users to view invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to insert invitations
CREATE POLICY "Allow admins to insert invitations"
ON public.invitations
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  )
);

-- Allow admins to update invitations
CREATE POLICY "Allow admins to update invitations"
ON public.invitations
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  )
);

-- Allow admins to delete invitations
CREATE POLICY "Allow admins to delete invitations"
ON public.invitations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  )
);

-- Enable Row Level Security for profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view profiles
CREATE POLICY "Allow authenticated users to view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow admins to insert profiles (for user creation)
CREATE POLICY "Allow admins to insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  ) OR
  auth.uid() = id -- Allow users to create their own profile
);

-- Allow service role to bypass RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Grant admin users access to create users
-- This needs to be run by a superuser or someone with appropriate privileges
DO $$
BEGIN
  -- Grant admin users the ability to create users
  EXECUTE format('
    GRANT EXECUTE ON FUNCTION auth.admin_create_user TO authenticated;
  ');
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not grant execute permission on auth.admin_create_user: %', SQLERRM;
END $$;

-- Alternative approach: Disable RLS for development purposes only
-- Uncomment these lines for development environment only
-- ALTER TABLE public.invitations DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY; 