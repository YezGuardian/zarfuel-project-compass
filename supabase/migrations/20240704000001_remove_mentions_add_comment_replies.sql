-- Remove mentioned_users column from forum_posts
ALTER TABLE public.forum_posts
DROP COLUMN IF EXISTS mentioned_users;

-- Remove mentioned_users column from forum_comments
ALTER TABLE public.forum_comments
DROP COLUMN IF EXISTS mentioned_users;

-- Add parent_comment_id column to forum_comments if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'forum_comments' 
    AND column_name = 'parent_comment_id'
  ) THEN
    ALTER TABLE public.forum_comments 
    ADD COLUMN parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE;
  END IF;
END $$; 