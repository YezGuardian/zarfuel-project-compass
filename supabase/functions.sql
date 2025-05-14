-- Create helpful SQL functions for the forum functionality

-- This function helps update comment likes when type errors occur
CREATE OR REPLACE FUNCTION update_comment_likes(comment_id UUID, likes_json TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.forum_comments
  SET likes = likes_json::JSONB
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This function helps update post likes when type errors occur
CREATE OR REPLACE FUNCTION update_post_likes(post_id UUID, likes_json TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.forum_posts
  SET likes = likes_json::JSONB
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This function helps add a comment with proper data types
CREATE OR REPLACE FUNCTION add_forum_comment(
  p_post_id UUID,
  p_content TEXT,
  p_author_id UUID,
  p_parent_comment_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This function helps refresh the schema cache
CREATE OR REPLACE FUNCTION refresh_schema_cache()
RETURNS VOID AS $$
BEGIN
  -- Force the schema cache to refresh by accessing the tables
  PERFORM * FROM public.forum_posts LIMIT 0;
  PERFORM * FROM public.forum_comments LIMIT 0;
  PERFORM * FROM public.forum_notifications LIMIT 0;
END;
$$ LANGUAGE plpgsql; 