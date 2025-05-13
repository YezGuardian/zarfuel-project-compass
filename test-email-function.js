const fetch = require('node-fetch');

// Test invoking the email function
async function testEmailFunction() {
  try {
    // Replace this with your Supabase project URL
    const SUPABASE_URL = 'http://localhost:54321'; // for local testing
    // const SUPABASE_URL = 'https://your-project-id.supabase.co'; // for production
    
    // You should get a real event ID from your database
    const eventId = 'YOUR_EVENT_ID'; 
    
    console.log('Testing send-meeting-invitation function...');
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-meeting-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers if needed
        // 'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify({
        eventId
      })
    });
    
    const result = await response.json();
    console.log('Function response:', result);
    
    if (result.success) {
      console.log(`Successfully sent emails to ${result.emailsSent} recipients`);
      console.log('Recipients:', result.recipients);
    } else {
      console.error('Failed to send emails:', result.error);
    }
  } catch (error) {
    console.error('Error testing function:', error);
  }
}

// Run the test
testEmailFunction(); 