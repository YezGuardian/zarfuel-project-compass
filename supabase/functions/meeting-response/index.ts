import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the URL and extract query parameters
    const url = new URL(req.url);
    const participantId = url.searchParams.get('participantId');
    const eventId = url.searchParams.get('eventId');
    const response = url.searchParams.get('response');
    const isExternal = url.searchParams.get('isExternal') === 'true'; // Check if it's an external participant
    
    // Validate required parameters
    if (!participantId || !eventId || !response) {
      throw new Error('Missing required parameters: participantId, eventId, and response are required');
    }
    
    // Validate response value
    if (response !== 'accepted' && response !== 'declined') {
      throw new Error('Invalid response value. Must be "accepted" or "declined"');
    }
    
    // Get the supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Get event details for notification
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('title, created_by')
      .eq('id', eventId)
      .single();
      
    if (eventError) {
      throw new Error('Event not found');
    }
    
    let participantName = 'A participant';
    
    if (isExternal) {
      // Verify the external participant exists
      const { data: externalParticipant, error: externalParticipantError } = await supabaseClient
        .from('external_participants')
        .select('id, email')
        .eq('id', participantId)
        .eq('event_id', eventId)
        .single();
        
      if (externalParticipantError) {
        throw new Error('Invalid external participant or event');
      }
      
      // Update the external participant response
      const { error: updateError } = await supabaseClient
        .from('external_participants')
        .update({ response })
        .eq('id', participantId);
        
      if (updateError) {
        throw new Error(`Failed to update response: ${updateError.message}`);
      }
      
      // Use email as the name for notifications
      participantName = externalParticipant.email;
    } else {
      // Verify the internal participant exists
      const { data: participant, error: participantError } = await supabaseClient
        .from('event_participants')
        .select(`
          id,
          user_id,
          event_id
        `)
        .eq('id', participantId)
        .eq('event_id', eventId)
        .single();
        
      if (participantError) {
        throw new Error('Invalid participant or event');
      }
      
      // Update the participant response
      const { error: updateError } = await supabaseClient
        .from('event_participants')
        .update({ response })
        .eq('id', participantId);
        
      if (updateError) {
        throw new Error(`Failed to update response: ${updateError.message}`);
      }
      
      // Get the participant's information to include in the notification
      const { data: participantProfile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', participant.user_id)
        .single();
        
      if (!profileError && participantProfile) {
        participantName = `${participantProfile.first_name} ${participantProfile.last_name}`;
      }
    }

    // Update the notification content string
    const notificationContent = `${participantName} ${response === 'accepted' ? 'accepted' : 'declined'} your meeting: ${event.title}`;

    // Create a notification for the event creator
    await supabaseClient
      .from('notifications')
      .insert([{
        user_id: event.created_by,
        type: 'meeting_response',
        content: notificationContent,
        link: '/meetings',
        is_read: false
      }]);

    // Redirect to the application with a success message
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000';
    const responseText = response === 'accepted' ? 'accepted' : 'declined';
    
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="5;url=${appBaseUrl}/meetings">
        <title>Meeting Response</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            text-align: center;
            background-color: #f9f9f9;
          }
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
          }
          h1 {
            color: #333;
          }
          p {
            color: #555;
            line-height: 1.5;
          }
          .success {
            color: #4CAF50;
          }
          .link {
            margin-top: 20px;
          }
          a {
            color: #2196F3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Response Recorded</h1>
          <p>You have <span class="success">${responseText}</span> the meeting invitation.</p>
          <p>You will be redirected to the meetings page in 5 seconds.</p>
          <p class="link">
            <a href="${appBaseUrl}/meetings">Click here if you're not redirected automatically</a>
          </p>
        </div>
      </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Error processing meeting response:', error);
    
    // Return a user-friendly error page
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000';
    
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta http-equiv="refresh" content="5;url=${appBaseUrl}/meetings">
        <title>Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            text-align: center;
            background-color: #f9f9f9;
          }
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
          }
          h1 {
            color: #333;
          }
          p {
            color: #555;
            line-height: 1.5;
          }
          .error {
            color: #f44336;
          }
          .link {
            margin-top: 20px;
          }
          a {
            color: #2196F3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Error</h1>
          <p class="error">${error.message || 'An unexpected error occurred.'}</p>
          <p>You will be redirected to the meetings page in 5 seconds.</p>
          <p class="link">
            <a href="${appBaseUrl}/meetings">Click here if you're not redirected automatically</a>
          </p>
        </div>
      </body>
      </html>
    `, {
      status: 400,
      headers: {
        'Content-Type': 'text/html',
        ...corsHeaders
      }
    });
  }
}) 