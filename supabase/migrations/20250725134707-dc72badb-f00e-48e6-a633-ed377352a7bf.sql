-- CRITICAL SECURITY FIXES

-- 1. Enable RLS on tables missing it
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

-- 2. Create secure RLS policies for budget_categories
CREATE POLICY "Allow authenticated users to view budget categories" 
ON public.budget_categories
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow admins to manage budget categories" 
ON public.budget_categories
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 3. Create secure RLS policies for risks
CREATE POLICY "Allow authenticated users to view risks" 
ON public.risks
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow admins to manage risks" 
ON public.risks
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- 4. Secure existing database functions with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (NEW.id, NEW.email, 'viewer', '', '');
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_post_likes(post_id uuid, likes_json text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.forum_posts
  SET likes = likes_json::JSONB
  WHERE id = post_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_forum_comment(p_post_id uuid, p_content text, p_author_id uuid, p_parent_comment_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_content text, p_link text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, content, link)
  VALUES (p_user_id, p_type, p_content, p_link)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_comment_likes(comment_id uuid, likes_json text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.forum_comments
  SET likes = likes_json::JSONB
  WHERE id = comment_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Access tables to force Postgres to refresh schema cache
  PERFORM * FROM public.forum_posts LIMIT 0;
  PERFORM * FROM public.forum_comments LIMIT 0;
  PERFORM * FROM public.forum_notifications LIMIT 0;
END;
$function$;

-- 5. Create secure role checking function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 6. Update profile RLS policies to use secure function
DROP POLICY IF EXISTS "Allow admins to insert profiles" ON public.profiles;
CREATE POLICY "Allow admins to insert profiles" 
ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (
  (public.get_current_user_role() IN ('admin', 'superadmin')) OR 
  (auth.uid() = id)
);