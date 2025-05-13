// Test script to send notifications
const { createNotification } = require('./src/utils/notificationService');
const { supabase } = require('./src/integrations/supabase/client');

// Function to send test notifications
async function sendTestNotifications() {
  console.log('Sending test notifications to Yezreel Shirinda...');
  
  try {
    // First, get Yezreel's user ID from the profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .or('email.eq.yezreel@whitepaperconcepts.co.za,first_name.eq.Yezreel,last_name.eq.Shirinda')
      .limit(1);
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.error('Could not find Yezreel Shirinda in the profiles table');
      return;
    }
    
    const userId = profiles[0].id;
    console.log(`Found user ID: ${userId}`);
    
    // Send a task notification
    await createNotification({
      userId,
      type: 'task_created',
      content: 'Test notification: A new task "Quarterly Report" has been created',
      link: '/tasks'
    });
    console.log('Task notification sent');
    
    // Send a meeting notification
    await createNotification({
      userId,
      type: 'meeting_created',
      content: 'Test notification: New meeting "Project Review" scheduled for tomorrow',
      link: '/calendar'
    });
    console.log('Meeting notification sent');
    
    // Send a risk notification
    await createNotification({
      userId,
      type: 'risk_created',
      content: 'Test notification: New risk "Budget Overrun" has been identified',
      link: '/risks'
    });
    console.log('Risk notification sent');
    
    console.log('All test notifications sent successfully!');
  } catch (error) {
    console.error('Error sending test notifications:', error);
  }
}

// Execute the function
sendTestNotifications(); 