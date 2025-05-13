// Fix script for notification permissions
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key for admin access
const supabaseUrl = 'https://auswnhncethgmlgtecs.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Function to fix notification permissions
async function fixNotificationPermissions() {
  console.log('Starting notification permissions fix...');
  
  try {
    // Run SQL to fix the permissions
    const sql = `
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
    `;
    
    console.log('Executing SQL fix...');
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL fix:', error);
      return;
    }
    
    console.log('SQL fix executed successfully');
    
    // Verify the policies
    console.log('Verifying notification policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'notifications' });
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
      return;
    }
    
    console.log('Current notification policies:');
    console.log(policies);
    
    console.log('Notification permissions fix completed successfully');
  } catch (error) {
    console.error('Unexpected error during notification fix:', error);
  }
}

// Execute the function
fixNotificationPermissions().catch(console.error); 