-- Create forum_posts table
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  likes JSONB DEFAULT '[]',
  mentioned_users JSONB DEFAULT '[]'
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
  likes JSONB DEFAULT '[]',
  mentioned_users JSONB DEFAULT '[]'
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

-- Enable RLS for all tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for forum_posts

-- All authenticated users can view posts
CREATE POLICY "Allow view access to forum posts"
ON public.forum_posts
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create posts
CREATE POLICY "Allow insert to forum posts"
ON public.forum_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Allow update own posts"
ON public.forum_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Allow delete own posts"
ON public.forum_posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Create RLS policies for forum_comments

-- All authenticated users can view comments
CREATE POLICY "Allow view access to forum comments"
ON public.forum_comments
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can create comments
CREATE POLICY "Allow insert to forum comments"
ON public.forum_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own comments
CREATE POLICY "Allow update own comments"
ON public.forum_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Authors can delete their own comments
CREATE POLICY "Allow delete own comments"
ON public.forum_comments
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Create RLS policies for forum_notifications

-- Users can only view their own notifications
CREATE POLICY "Allow view own notifications"
ON public.forum_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Any authenticated user can create notifications
CREATE POLICY "Allow insert to forum notifications"
ON public.forum_notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can update only their own notifications (e.g., mark as read)
CREATE POLICY "Allow update own notifications"
ON public.forum_notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own notifications
CREATE POLICY "Allow delete own notifications"
ON public.forum_notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create functions for triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.is_edited = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_forum_posts_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at
BEFORE UPDATE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments need indexes for post_id
CREATE INDEX forum_comments_post_id_idx ON public.forum_comments(post_id);

-- Notifications need indexes for user_id
CREATE INDEX forum_notifications_user_id_idx ON public.forum_notifications(user_id);

-- Add is_read column to all notifications if not already exists
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE; 