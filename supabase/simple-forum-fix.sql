-- Simple SQL script to fix forum table issues
-- Run this in Supabase Studio SQL Editor

-- 1. Ensure proper JSONB format for likes columns
ALTER TABLE IF EXISTS public.forum_posts 
  ALTER COLUMN likes SET DATA TYPE JSONB USING COALESCE(likes, '[]'::JSONB);

ALTER TABLE IF EXISTS public.forum_comments
  ALTER COLUMN likes SET DATA TYPE JSONB USING COALESCE(likes, '[]'::JSONB);

-- 2. Update any NULL values to empty arrays
UPDATE public.forum_posts SET likes = '[]'::JSONB WHERE likes IS NULL;
UPDATE public.forum_comments SET likes = '[]'::JSONB WHERE likes IS NULL;

-- 3. Make sure all columns exist with correct types
DO $$
BEGIN
  -- Add any missing columns to forum_comments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'forum_comments' 
                AND column_name = 'likes') THEN
    ALTER TABLE public.forum_comments ADD COLUMN likes JSONB DEFAULT '[]'::JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'forum_comments' 
                AND column_name = 'is_edited') THEN
    ALTER TABLE public.forum_comments ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'forum_comments' 
                AND column_name = 'parent_comment_id') THEN
    ALTER TABLE public.forum_comments ADD COLUMN parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE;
  END IF;
  
  -- Add any missing columns to forum_posts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'forum_posts' 
                AND column_name = 'likes') THEN
    ALTER TABLE public.forum_posts ADD COLUMN likes JSONB DEFAULT '[]'::JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'forum_posts' 
                AND column_name = 'is_edited') THEN
    ALTER TABLE public.forum_posts ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 4. Create a function to refresh the schema cache
CREATE OR REPLACE FUNCTION refresh_schema_cache() RETURNS VOID AS $$
BEGIN
  -- Access tables to force Postgres to refresh schema cache
  PERFORM * FROM public.forum_posts LIMIT 0;
  PERFORM * FROM public.forum_comments LIMIT 0;
  PERFORM * FROM public.forum_notifications LIMIT 0;
END;
$$ LANGUAGE plpgsql;

-- 5. Update policy to ensure users can like/dislike comments they don't own
DROP POLICY IF EXISTS "Allow update own comments" ON public.forum_comments;
CREATE POLICY "Allow update own comments"
ON public.forum_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id OR likes::text LIKE '%' || auth.uid()::text || '%')
WITH CHECK (auth.uid() = author_id OR likes::text LIKE '%' || auth.uid()::text || '%');

-- 6. Add missing indexes
CREATE INDEX IF NOT EXISTS forum_comments_parent_id_idx ON public.forum_comments(parent_comment_id);

-- 7. Execute the refresh function
SELECT refresh_schema_cache();

-- 8. Output table structure for verification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'forum_comments' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'forum_posts' 
ORDER BY ordinal_position; 