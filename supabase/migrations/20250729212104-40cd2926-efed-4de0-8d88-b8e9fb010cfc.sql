-- CRITICAL SECURITY FIXES - Step 2: Enable RLS and fix policies
-- Address the RLS disabled errors found by the linter

-- First, ensure RLS is enabled on all tables that need it
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Now drop the overly permissive policies that allow universal access
DROP POLICY IF EXISTS "Allow authenticated users to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view invitations" ON public.invitations;
DROP POLICY IF EXISTS "Allow all authenticated users to view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow authenticated users to insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow authenticated users to update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow authenticated users to delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow all authenticated users to view phases" ON public.phases;
DROP POLICY IF EXISTS "Allow authenticated users to insert phases" ON public.phases;
DROP POLICY IF EXISTS "Allow authenticated users to update phases" ON public.phases;
DROP POLICY IF EXISTS "Allow authenticated users to delete phases" ON public.phases;
DROP POLICY IF EXISTS "Allow authenticated users to delete contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to insert contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to update contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow authenticated users to delete folders" ON public.folders;
DROP POLICY IF EXISTS "Allow authenticated users to insert folders" ON public.folders;
DROP POLICY IF EXISTS "Allow authenticated users to update folders" ON public.folders;

-- Create secure role-based policies for profiles
-- Note: "Users can view their own profile" policy should already exist, but create if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view their own profile'
    ) THEN
        CREATE POLICY "Users can view their own profile"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (id = auth.uid());
    END IF;
END $$;

-- Create policy for superadmins to view all profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Superadmins can view all profiles'
    ) THEN
        CREATE POLICY "Superadmins can view all profiles"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (get_current_user_role() = 'superadmin');
    END IF;
END $$;

-- Create secure policies for invitations
CREATE POLICY "Admins can view invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Admins can manage invitations"
ON public.invitations
FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('admin', 'superadmin'));

-- Create proper role-based policies for tasks
CREATE POLICY "Special users can view tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('special', 'admin', 'superadmin'));

CREATE POLICY "Special users can manage tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (get_current_user_role() IN ('special', 'admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('special', 'admin', 'superadmin'));

-- Create proper role-based policies for phases
CREATE POLICY "Special users can view phases"
ON public.phases
FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('special', 'admin', 'superadmin'));

CREATE POLICY "Special users can manage phases"
ON public.phases
FOR ALL
TO authenticated
USING (get_current_user_role() IN ('special', 'admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('special', 'admin', 'superadmin'));

-- Create proper role-based policies for contacts
CREATE POLICY "Special users can view contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('special', 'admin', 'superadmin'));

CREATE POLICY "Special users can manage contacts"
ON public.contacts
FOR ALL
TO authenticated
USING (get_current_user_role() IN ('special', 'admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('special', 'admin', 'superadmin'));

-- Create proper role-based policies for folders
CREATE POLICY "Special users can view folders"
ON public.folders
FOR SELECT
TO authenticated
USING (get_current_user_role() IN ('special', 'admin', 'superadmin'));

CREATE POLICY "Special users can manage folders"
ON public.folders
FOR ALL
TO authenticated
USING (get_current_user_role() IN ('special', 'admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('special', 'admin', 'superadmin'));