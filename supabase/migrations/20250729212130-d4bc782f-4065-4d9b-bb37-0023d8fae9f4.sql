-- CRITICAL SECURITY FIXES - Step 3: Drop existing conflicting policies first
-- Handle existing policies that are blocking our security fixes

-- Drop the conflicting invitation policy
DROP POLICY IF EXISTS "Admins can manage invitations" ON public.invitations;

-- Now create the corrected policies for invitations
CREATE POLICY "Admins can manage invitations" 
ON public.invitations
FOR ALL
TO authenticated
USING (get_current_user_role() IN ('admin', 'superadmin'))
WITH CHECK (get_current_user_role() IN ('admin', 'superadmin'));