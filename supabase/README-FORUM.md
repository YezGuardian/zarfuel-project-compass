# Forum System Setup for ZARFUEL Project Compass

This document provides instructions for setting up the forum functionality in the Supabase database.

## Migrations to Apply

To set up the forum system, you need to apply the following migration files:

1. `20240703000000_fix_meeting_minutes_rls.sql` - Fixes row-level security for meeting minutes
2. `20240703000001_create_forum_tables.sql` - Creates forum tables and policies

## Apply Migrations in Supabase Dashboard

Since there might be issues with local migrations, here's how to apply them directly in the Supabase Dashboard:

1. Log in to the [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor**
4. Create a **New Query**
5. Copy the contents of each migration file and execute them one by one

### Meeting Minutes Fix

First, apply the fix for meeting minutes RLS:

```sql
-- Fix the row-level security policy for meeting_minutes table
-- First, drop existing policies
DROP POLICY IF EXISTS "Allow insert access" ON public.meeting_minutes;

-- Create a new insert policy that allows any authenticated user to insert minutes
CREATE POLICY "Allow insert minutes for any authenticated user" 
ON public.meeting_minutes
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create a policy for authenticated users to select meeting minutes
CREATE POLICY "Allow authenticated users to view meeting minutes"
ON public.meeting_minutes
FOR SELECT
TO authenticated
USING (true);

-- Add content column if it doesn't exist
ALTER TABLE public.meeting_minutes ADD COLUMN IF NOT EXISTS content TEXT;

-- Grant access to content field (in case it's missing from the schema)
COMMENT ON COLUMN public.meeting_minutes.content IS 'Text content for meeting minutes';
```

### Forum Tables Creation

Then, apply the forum tables creation:

```sql
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

-- Enable RLS on both tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for forum_posts

-- Everyone can read posts
CREATE POLICY "Allow all users to read posts"
  ON public.forum_posts
  FOR SELECT
  USING (true);

-- Only authenticated users can create posts
CREATE POLICY "Allow auth users to create posts"
  ON public.forum_posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only authors and admins can update their own posts
CREATE POLICY "Allow authors and admins to update posts"
  ON public.forum_posts
  FOR UPDATE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Only authors and admins can delete posts
CREATE POLICY "Allow authors and admins to delete posts"
  ON public.forum_posts
  FOR DELETE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Add RLS policies for forum_comments

-- Everyone can read comments
CREATE POLICY "Allow all users to read comments"
  ON public.forum_comments
  FOR SELECT
  USING (true);

-- Only authenticated users can create comments
CREATE POLICY "Allow auth users to create comments"
  ON public.forum_comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only authors and admins can update their own comments
CREATE POLICY "Allow authors and admins to update comments"
  ON public.forum_comments
  FOR UPDATE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- Only authors and admins can delete comments
CREATE POLICY "Allow authors and admins to delete comments"
  ON public.forum_comments
  FOR DELETE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

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

-- Create notification tables for mentioned users
CREATE TABLE IF NOT EXISTS public.forum_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'post_created', 'comment_created', 'mention', 'post_edited', 'post_deleted', etc.
  content TEXT NOT NULL,
  source_id UUID NOT NULL, -- The post_id or comment_id
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notifications table
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can only see their own notifications"
  ON public.forum_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow any authenticated user to mark their notifications as read
CREATE POLICY "Users can update their own notifications"
  ON public.forum_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow authenticated users to create notifications for any user
CREATE POLICY "Allow authenticated users to insert notifications"
  ON public.forum_notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Comments need indexes for post_id
CREATE INDEX forum_comments_post_id_idx ON public.forum_comments(post_id);

-- Notifications need indexes for user_id
CREATE INDEX forum_notifications_user_id_idx ON public.forum_notifications(user_id);

-- Add is_read column to all notifications if not already exists
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
```

## Verifying the Setup

After applying these migrations, you should be able to:

1. Create, update, and delete forum posts
2. Comment on posts
3. Like or dislike posts
4. Tag users with @mentions
5. Receive notifications when you're mentioned, when new posts are created, or when someone comments on your post

## Troubleshooting

If you encounter any issues:

1. Make sure all SQL commands executed successfully
2. Check the Supabase logs for any errors
3. Verify that the tables were created with the correct structure
4. Test the RLS policies by trying to create posts and comments

If RLS policies are causing issues, you may need to use the service role client for certain operations during testing. 