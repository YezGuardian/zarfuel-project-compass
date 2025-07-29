-- CRITICAL SECURITY FIXES - Step by step approach
-- Step 1: Fix database functions security first

-- Update the get_current_user_role function to be more secure
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Secure all database functions with proper search_path
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