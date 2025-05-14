// Script to fix the forum schema in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Create Supabase client
const supabase = createClient(
  "https://auswnhnpeetphmlqtecs.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMTY2MzgsImV4cCI6MjA2MTU5MjYzOH0.tJXZNrK9LaGtVzy-_UuNOgj1kW6zC-FXDxTiIwevFcc"
);

async function fixForumSchema() {
  console.log('Starting forum schema fix...');

  try {
    // Drop existing forum tables and recreate them
    console.log('Dropping and recreating forum tables...');
    
    const sql = `
      -- Drop existing tables
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
        likes JSONB DEFAULT '[]'
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
      CREATE POLICY "Allow view access to forum posts"
      ON public.forum_posts
      FOR SELECT
      TO authenticated
      USING (true);
      
      CREATE POLICY "Allow insert to forum posts"
      ON public.forum_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = author_id);
      
      CREATE POLICY "Allow update own posts"
      ON public.forum_posts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = author_id)
      WITH CHECK (auth.uid() = author_id);
      
      CREATE POLICY "Allow delete own posts"
      ON public.forum_posts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = author_id);
      
      -- Create RLS policies for forum_comments
      CREATE POLICY "Allow view access to forum comments"
      ON public.forum_comments
      FOR SELECT
      TO authenticated
      USING (true);
      
      CREATE POLICY "Allow insert to forum comments"
      ON public.forum_comments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = author_id);
      
      CREATE POLICY "Allow update own comments"
      ON public.forum_comments
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = author_id)
      WITH CHECK (auth.uid() = author_id);
      
      CREATE POLICY "Allow delete own comments"
      ON public.forum_comments
      FOR DELETE
      TO authenticated
      USING (auth.uid() = author_id);
      
      -- Create RLS policies for forum_notifications
      CREATE POLICY "Allow view own notifications"
      ON public.forum_notifications
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
      
      CREATE POLICY "Allow insert to forum notifications"
      ON public.forum_notifications
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
      
      CREATE POLICY "Allow update own notifications"
      ON public.forum_notifications
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Allow delete own notifications"
      ON public.forum_notifications
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON public.forum_comments(post_id);
      CREATE INDEX IF NOT EXISTS forum_notifications_user_id_idx ON public.forum_notifications(user_id);
    `;
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }
    
    console.log('Forum schema successfully fixed!');
    console.log('You can now restart your application and the forum should work correctly.');
    
  } catch (error) {
    console.error('Error fixing forum schema:', error);
  }
}

// Run the function
fixForumSchema().catch(console.error); 