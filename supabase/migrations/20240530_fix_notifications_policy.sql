-- Drop the existing insert policy that might be causing issues
DROP POLICY IF EXISTS "Service roles can insert notifications" ON public.notifications;

-- Create a more permissive insert policy that allows authenticated users to create notifications for any user
CREATE POLICY "Allow authenticated users to create notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- Create a policy that allows users to insert notifications for themselves
CREATE POLICY "Users can create their own notifications" 
    ON public.notifications 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Make sure the table has RLS enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY; 