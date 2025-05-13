-- Fix for notification permissions
-- Run this in the Supabase dashboard SQL editor

-- Drop the existing insert policy that might be causing issues
DROP POLICY IF EXISTS "Service roles can insert notifications" ON public.notifications;

-- Create a more permissive insert policy that allows authenticated users to create notifications for any user
CREATE POLICY "Allow authenticated users to create notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (true);

-- List all current policies for the notifications table
SELECT * 
FROM pg_policies 
WHERE tablename = 'notifications'; 