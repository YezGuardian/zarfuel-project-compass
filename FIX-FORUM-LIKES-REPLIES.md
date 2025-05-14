# How to Fix Forum Likes and Reply Issues

## Problem Description

There are specific issues with the forum functionality:

1. **Comment likes disappear after refresh**: When a user likes a comment, it works initially but the like disappears after refreshing the page.

2. **Schema cache errors**: When trying to like a post or reply to a comment, errors like these appear:
   - "Failed to update comment like: Could not find the 'likes' column of 'forum_comments' in the schema cache"
   - "Failed to add comment: Could not find the 'is_edited' column of 'forum_comments' in the schema cache"

## Step-by-Step Solution

Follow these steps in order:

### Step 1: Run the Simple SQL Fix Script

1. Log in to your Supabase project at https://app.supabase.com
2. Open the SQL Editor
3. Copy the contents of the `supabase/simple-forum-fix.sql` file and paste it into the SQL Editor
4. Run the SQL script
5. This targeted fix addresses the specific columns missing from the schema cache (likes, is_edited, parent_comment_id)

### Step 2: Clear Your Browser Data

1. Open your browser settings
2. Clear browser cache, cookies, and local storage related to your site
3. You can also try using the application in an incognito/private browsing window

### Step 3: Refresh the Schema on App Load

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Open your application
3. Open the browser console and run the schema refresh function:
   ```javascript
   await window.refreshSchema()
   ```

### Step 4: Verify the Fix

1. Try liking a comment and then refresh the page - the like should persist
2. Try replying to a comment - it should work without schema cache errors
3. Verify that notifications are being sent for these actions

## What This Fix Does

The fix targets three specific issues:

1. **JSONB Format for Likes**: Ensures the `likes` column is properly stored as JSONB with a default empty array

2. **Column Existence**: Adds any missing columns (`likes`, `is_edited`, `parent_comment_id`) to the forum tables if they don't exist

3. **Access Policy**: Updates the RLS policy to ensure users can like/dislike comments they don't own

4. **Schema Cache**: Explicitly refreshes the schema cache for these problematic columns

## If Issues Persist

If you continue to see these issues:

1. Run the more comprehensive fix script `supabase/fix-forum-tables.sql` which recreates the tables entirely

2. Look for specific error messages in the browser console and note:
   - The exact error text
   - The function where the error occurs
   - The line number in the code

3. Try manually adding a like entry in the database:
   ```sql
   UPDATE public.forum_comments
   SET likes = '[{"userId":"YOUR_USER_ID","isLike":true,"userName":"Your Name"}]'::JSONB
   WHERE id = 'COMMENT_ID';
   ```

4. If all else fails, you may need to recreate the entire forum functionality from scratch. 