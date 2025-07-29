-- CRITICAL SECURITY FIXES
-- Step 1: Enable RLS on critical tables and fix policies

-- First, drop all overly permissive policies
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

-- Ensure RLS is enabled on all critical tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Fix database functions to be more secure
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create secure role-based policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Superadmins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (get_current_user_role() = 'superadmin');

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Superadmins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (get_current_user_role() = 'superadmin');

-- Prevent role escalation - only superadmin can change roles
CREATE POLICY "Only superadmin can change roles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  CASE 
    WHEN OLD.role != NEW.role THEN get_current_user_role() = 'superadmin'
    ELSE true
  END
);

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

-- Update other database functions to be more secure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (NEW.id, NEW.email, 'viewer', '', '');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_forum_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_post_likes(post_id uuid, likes_json text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.forum_posts
  SET likes = likes_json::JSONB
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_forum_comment(p_post_id uuid, p_content text, p_author_id uuid, p_parent_comment_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_comment_id UUID;
BEGIN
  INSERT INTO public.forum_comments (
    post_id,
    content,
    author_id,
    created_at,
    updated_at,
    is_edited,
    likes,
    parent_comment_id
  ) VALUES (
    p_post_id,
    p_content,
    p_author_id,
    NOW(),
    NOW(),
    FALSE,
    '[]'::JSONB,
    p_parent_comment_id
  ) RETURNING id INTO new_comment_id;
  
  RETURN new_comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_content text, p_link text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, content, link)
  VALUES (p_user_id, p_type, p_content, p_link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_comment_likes(comment_id uuid, likes_json text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.forum_comments
  SET likes = likes_json::JSONB
  WHERE id = comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Access tables to force Postgres to refresh schema cache
  PERFORM * FROM public.forum_posts LIMIT 0;
  PERFORM * FROM public.forum_comments LIMIT 0;
  PERFORM * FROM public.forum_notifications LIMIT 0;
END;
$$;