-- SQL script to fix forum tables
-- Run this in Supabase Studio SQL Editor

-- Drop existing tables (be careful in production!)
DROP TABLE IF EXISTS public.forum_notifications CASCADE;
DROP TABLE IF EXISTS public.forum_comments CASCADE;
DROP TABLE IF EXISTS public.forum_posts CASCADE;

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  likes JSONB DEFAULT '[]'::JSONB
);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS public.forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  likes JSONB DEFAULT '[]'::JSONB,
  parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE
);

-- Create forum_notifications table
CREATE TABLE IF NOT EXISTS public.forum_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  source_id UUID NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for forum_posts
DROP POLICY IF EXISTS "Allow view access to forum posts" ON public.forum_posts;
CREATE POLICY "Allow view access to forum posts"
ON public.forum_posts
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow insert to forum posts" ON public.forum_posts;
CREATE POLICY "Allow insert to forum posts"
ON public.forum_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Allow update own posts" ON public.forum_posts;
CREATE POLICY "Allow update own posts"
ON public.forum_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR likes::text LIKE '%' || auth.uid()::text || '%')
WITH CHECK (auth.uid() = author_id OR likes::text LIKE '%' || auth.uid()::text || '%');

DROP POLICY IF EXISTS "Allow delete own posts" ON public.forum_posts;
CREATE POLICY "Allow delete own posts"
ON public.forum_posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Create RLS policies for forum_comments
DROP POLICY IF EXISTS "Allow view access to forum comments" ON public.forum_comments;
CREATE POLICY "Allow view access to forum comments"
ON public.forum_comments
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow insert to forum comments" ON public.forum_comments;
CREATE POLICY "Allow insert to forum comments"
ON public.forum_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Allow update own comments" ON public.forum_comments;
CREATE POLICY "Allow update own comments"
ON public.forum_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR likes::text LIKE '%' || auth.uid()::text || '%')
WITH CHECK (auth.uid() = author_id OR likes::text LIKE '%' || auth.uid()::text || '%');

DROP POLICY IF EXISTS "Allow delete own comments" ON public.forum_comments;
CREATE POLICY "Allow delete own comments"
ON public.forum_comments
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Create RLS policies for forum_notifications
DROP POLICY IF EXISTS "Allow view own notifications" ON public.forum_notifications;
CREATE POLICY "Allow view own notifications"
ON public.forum_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow insert to forum notifications" ON public.forum_notifications;
CREATE POLICY "Allow insert to forum notifications"
ON public.forum_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update own notifications" ON public.forum_notifications;
CREATE POLICY "Allow update own notifications"
ON public.forum_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow delete own notifications" ON public.forum_notifications;
CREATE POLICY "Allow delete own notifications"
ON public.forum_notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON public.forum_comments(post_id);
CREATE INDEX IF NOT EXISTS forum_notifications_user_id_idx ON public.forum_notifications(user_id);
CREATE INDEX IF NOT EXISTS forum_comments_parent_id_idx ON public.forum_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS forum_posts_author_id_idx ON public.forum_posts(author_id);
CREATE INDEX IF NOT EXISTS forum_comments_author_id_idx ON public.forum_comments(author_id);

-- Create functions to help with operations
CREATE OR REPLACE FUNCTION refresh_schema_cache() RETURNS VOID AS $$
BEGIN
  -- This function doesn't do anything directly,
  -- but calling it forces Postgres to refresh schema information
  -- which can help resolve "column not found" issues
  PERFORM 1;
END;
$$ LANGUAGE plpgsql;

-- Fix any existing data with invalid likes format
UPDATE public.forum_posts 
SET likes = '[]'::JSONB 
WHERE likes IS NULL OR likes::text = '';

UPDATE public.forum_comments 
SET likes = '[]'::JSONB 
WHERE likes IS NULL OR likes::text = '';

-- Run the schema refresh function
SELECT refresh_schema_cache(); 