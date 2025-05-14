-- Check forum_posts table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'forum_posts' 
ORDER BY 
  ordinal_position;

-- Check forum_comments table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'forum_comments' 
ORDER BY 
  ordinal_position;

-- Check forum_notifications table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM 
  information_schema.columns 
WHERE 
  table_schema = 'public' 
  AND table_name = 'forum_notifications' 
ORDER BY 
  ordinal_position;

-- Verify RLS policies
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check 
FROM 
  pg_policies 
WHERE 
  tablename IN ('forum_posts', 'forum_comments', 'forum_notifications') 
ORDER BY 
  tablename, 
  policyname; 