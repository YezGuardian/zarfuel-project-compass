// Debug script for notifications
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

// Function to send test notifications
async function debugNotifications() {
  console.log('Starting notification debugging...');
  
  try {
    // 1. Check if the notifications table exists
    console.log('Checking notifications table...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('notifications')
      .select('count(*)')
      .limit(1);
    
    if (tableError) {
      console.error('Error accessing notifications table:', tableError);
      return;
    }
    
    console.log('Notifications table exists and is accessible');
    
    // 2. Find a test user
    console.log('Finding test user...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('Error finding test user:', usersError || 'No users found');
      return;
    }
    
    const testUser = users[0];
    console.log(`Found test user: ${testUser.email} (${testUser.id})`);
    
    // 3. Create a test notification
    console.log('Creating test notification...');
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: testUser.id,
        type: 'test_notification',
        content: 'This is a test notification from the debug script',
        is_read: false
      })
      .select()
      .single();
    
    if (notificationError) {
      console.error('Error creating test notification:', notificationError);
      
      // Check RLS policies
      console.log('Checking RLS policies...');
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_policies_for_table', { table_name: 'notifications' });
      
      if (policiesError) {
        console.error('Error checking policies:', policiesError);
      } else {
        console.log('RLS Policies for notifications table:', policies);
      }
      
      return;
    }
    
    console.log('Test notification created successfully:', notification);
    
    // 4. Check user's notifications
    console.log(`Checking notifications for user ${testUser.id}...`);
    const { data: userNotifications, error: userNotificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (userNotificationsError) {
      console.error('Error fetching user notifications:', userNotificationsError);
      return;
    }
    
    console.log(`Found ${userNotifications.length} notifications for user:`);
    console.log(userNotifications);
    
    console.log('Notification debugging completed successfully');
  } catch (error) {
    console.error('Unexpected error during notification debugging:', error);
  }
}

// Execute the function
debugNotifications().catch(console.error); 