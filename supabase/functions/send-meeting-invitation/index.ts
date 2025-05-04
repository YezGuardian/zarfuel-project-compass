
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EmailPayload = {
  eventId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const { eventId } = await req.json() as EmailPayload
    
    if (!eventId) {
      throw new Error('Event ID is required')
    }

    // Get the event details and participants
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
      
    if (eventError) throw eventError

    // Get participants
    const { data: participants, error: participantsError } = await supabaseClient
      .from('event_participants')
      .select(`
        user_id,
        profiles:user_id (
          email,
          first_name,
          last_name
        )
      `)
      .eq('event_id', eventId)
      
    if (participantsError) throw participantsError

    // Get creator profile
    const { data: creator, error: creatorError } = await supabaseClient
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', event.created_by)
      .single()
      
    if (creatorError) throw creatorError
    
    // Format dates for display
    const startDate = new Date(event.start_time).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const endDate = new Date(event.end_time).toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // TODO: In a real implementation, this would use an email service like SendGrid, Mailgun, etc.
    // For this implementation, we'll just log the emails that would be sent
    
    const emailsSent = []
    
    for (const participant of participants) {
      if (participant.profiles && participant.profiles.email) {
        // Build email content
        const emailSubject = `Invitation: ${event.title}`
        const emailHtml = `
          <h2>You've been invited to: ${event.title}</h2>
          <p><strong>When:</strong> ${startDate} - ${endDate}</p>
          <p><strong>Location:</strong> ${event.location || 'No location specified'}</p>
          <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
          <p><strong>Organized by:</strong> ${creator.first_name} ${creator.last_name}</p>
          <p>Please confirm your attendance by responding to this invitation.</p>
        `
        
        // In a real implementation, send the email here
        console.log(`Would send email to: ${participant.profiles.email}`)
        console.log(`Subject: ${emailSubject}`)
        console.log(`Content: ${emailHtml}`)
        
        emailsSent.push(participant.profiles.email)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        recipients: emailsSent
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  } catch (error) {
    console.error('Error sending invitations:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
})
