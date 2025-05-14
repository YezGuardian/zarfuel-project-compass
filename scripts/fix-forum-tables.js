// Debug script for forum tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  "https://auswnhnpeetphmlqtecs.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMTY2MzgsImV4cCI6MjA2MTU5MjYzOH0.tJXZNrK9LaGtVzy-_UuNOgj1kW6zC-FXDxTiIwevFcc",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// List of expected tables
const forumTables = [
  'forum_posts',
  'forum_comments',
  'forum_notifications'
];

// Check and fix forum tables
async function fixForumTables() {
  console.log('Starting forum tables verification...');
  
  // First, check if tables exist
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables_in_schema', { schema_name: 'public' });
  
  if (tablesError) {
    console.error('Error getting tables:', tablesError);
    return;
  }
  
  console.log('Tables in public schema:', tables);
  
  // Check if forum tables exist
  const missingTables = forumTables.filter(table => !tables.includes(table));
  
  if (missingTables.length > 0) {
    console.log(`Missing tables: ${missingTables.join(', ')}`);
    console.log('Running SQL to create missing tables...');
    
    // Build SQL to create missing tables
    let sql = '';
    
    if (missingTables.includes('forum_posts')) {
      sql += `
        CREATE TABLE IF NOT EXISTS public.forum_posts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          author_id UUID NOT NULL REFERENCES auth.users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          is_edited BOOLEAN DEFAULT FALSE,
          likes JSONB DEFAULT '[]'
        );
        
        ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
        
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
      `;
    }
    
    if (missingTables.includes('forum_comments')) {
      sql += `
        CREATE TABLE IF NOT EXISTS public.forum_comments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          author_id UUID NOT NULL REFERENCES auth.users(id),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          is_edited BOOLEAN DEFAULT FALSE,
          likes JSONB DEFAULT '[]',
          parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE
        );
        
        ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
        
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
        
        CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON public.forum_comments(post_id);
      `;
    }
    
    if (missingTables.includes('forum_notifications')) {
      sql += `
        CREATE TABLE IF NOT EXISTS public.forum_notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          type TEXT NOT NULL,
          content TEXT NOT NULL,
          source_id UUID NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;
        
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
        
        CREATE INDEX IF NOT EXISTS forum_notifications_user_id_idx ON public.forum_notifications(user_id);
      `;
    }
    
    if (sql) {
      // Execute SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql });
      
      if (sqlError) {
        console.error('Error executing SQL:', sqlError);
      } else {
        console.log('Missing tables created successfully');
      }
    }
  } else {
    console.log('All forum tables exist');
  }
  
  // Check columns in existing tables
  for (const table of forumTables) {
    if (!tables.includes(table)) continue;
    
    console.log(`Checking columns in ${table}...`);
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', table);
    
    if (columnsError) {
      console.error(`Error getting columns for ${table}:`, columnsError);
      continue;
    }
    
    const columnNames = columns.map(col => col.column_name);
    console.log(`Columns in ${table}:`, columnNames);
    
    // Check for mentioned_users column
    if (columnNames.includes('mentioned_users')) {
      console.log(`Dropping 'mentioned_users' column from ${table}...`);
      
      const sql = `ALTER TABLE public.${table} DROP COLUMN mentioned_users;`;
      const { error: dropError } = await supabase.rpc('exec_sql', { sql });
      
      if (dropError) {
        console.error(`Error dropping mentioned_users from ${table}:`, dropError);
      } else {
        console.log(`Dropped mentioned_users from ${table} successfully`);
      }
    }
    
    // Add parent_comment_id to forum_comments if needed
    if (table === 'forum_comments' && !columnNames.includes('parent_comment_id')) {
      console.log(`Adding 'parent_comment_id' column to forum_comments...`);
      
      const sql = `
        ALTER TABLE public.forum_comments 
        ADD COLUMN parent_comment_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE;
      `;
      
      const { error: addError } = await supabase.rpc('exec_sql', { sql });
      
      if (addError) {
        console.error('Error adding parent_comment_id to forum_comments:', addError);
      } else {
        console.log('Added parent_comment_id to forum_comments successfully');
      }
    }
  }
  
  console.log('Forum tables verification completed');
}

// Run the fix function
fixForumTables()
  .catch(console.error)
  .finally(() => process.exit(0)); 