# Forum Functionality Fix Installation Guide

## Quick Installation

For a quick fix of the forum issues, follow these steps:

1. **Run the SQL Fix**:
   - Copy the contents of `supabase/simple-forum-fix.sql`
   - Paste into Supabase Studio SQL Editor
   - Execute the SQL statements

2. **Run the SQL Functions**:
   - Copy the contents of `supabase/functions.sql`
   - Paste into Supabase Studio SQL Editor
   - Execute the SQL statements

3. **Restart Your Application**:
   ```bash
   npm run dev
   ```

4. **Clear Browser Data**:
   - Clear cache, cookies, and local storage for your application

## Issue Details

This installation addresses the following issues:

- **Comment likes disappearing after refresh**
- **Schema cache errors** when trying to like comments or reply
- Error messages about missing columns in the schema cache

## Verification Steps

After installation, verify the fix by:

1. Liking a comment, then refreshing the page
2. Adding a reply to a comment
3. Checking that notifications work for these actions

## Troubleshooting

If issues persist:

1. Run `await window.refreshSchema()` in browser console
2. Check for detailed error messages in console
3. Try the advanced fix by running `supabase/fix-forum-tables.sql` 