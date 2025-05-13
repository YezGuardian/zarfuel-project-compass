import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.3'
import sgMail from 'https://esm.sh/@sendgrid/mail@7.7.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EmailPayload = {
  eventId: string
}

// Interface for participants
interface InternalParticipant {
  id: string;
  user_id: string;
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
  is_external?: false;
}

interface ExternalParticipant {
  id: string;
  email: string;
  is_external: true;
}

type Participant = InternalParticipant | ExternalParticipant;

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

    // Get the event details
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()
      
    if (eventError) throw eventError

    // Get internal participants
    const { data: internalParticipants, error: participantsError } = await supabaseClient
      .from('event_participants')
      .select(`
        id,
        user_id,
        profiles:user_id (
          email,
          first_name,
          last_name
        )
      `)
      .eq('event_id', eventId)
      
    if (participantsError) throw participantsError

    // Get external participants
    const { data: externalParticipants, error: externalError } = await supabaseClient
      .from('external_participants')
      .select('id, email')
      .eq('event_id', eventId)
      
    if (externalError) throw externalError

    // Mark external participants
    const markedExternalParticipants = externalParticipants?.map(p => ({
      ...p,
      is_external: true as const
    })) || [];
    
    // Combine all participants
    const allParticipants: Participant[] = [
      ...(internalParticipants || []) as InternalParticipant[],
      ...markedExternalParticipants as ExternalParticipant[]
    ];

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

    // Set up SendGrid
    const apiKey = Deno.env.get('SENDGRID_API_KEY')
    const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'notifications@example.com'
    const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Meeting Notifications'
    
    // Initialize SendGrid if API key is available
    let useSendGrid = false
    if (apiKey) {
      sgMail.setApiKey(apiKey)
      useSendGrid = true
      console.log("Using SendGrid for email delivery")
    } else {
      console.log("SENDGRID_API_KEY not set, falling back to console logging")
    }
    
    const emailsSent = []
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'http://localhost:3000'
    
    for (const participant of allParticipants) {
      // Handle both internal and external participants
      const email = participant.is_external 
        ? participant.email 
        : participant.profiles?.email;
      
      const name = participant.is_external 
        ? email.split('@')[0] // Use part before @ as a name
        : `${participant.profiles.first_name} ${participant.profiles.last_name}`;
      
      if (email) {
        // Generate unique response URLs with tokens
        const acceptUrl = `${appBaseUrl}/api/meeting-response?participantId=${participant.id}&eventId=${eventId}&response=accepted&isExternal=${participant.is_external ? 'true' : 'false'}`
        const declineUrl = `${appBaseUrl}/api/meeting-response?participantId=${participant.id}&eventId=${eventId}&response=declined&isExternal=${participant.is_external ? 'true' : 'false'}`
        
        // Build responsive email with buttons
        const emailSubject = `Invitation: ${event.title}`
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You've been invited to: ${event.title}</h2>
            <div style="background-color: #f8f9fa; border-left: 4px solid #4285f4; padding: 15px; margin: 15px 0;">
              <p><strong>When:</strong> ${startDate} - ${endDate}</p>
              <p><strong>Location:</strong> ${event.location || 'No location specified'}</p>
              <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
              <p><strong>Organized by:</strong> ${creator.first_name} ${creator.last_name}</p>
            </div>
            <div style="margin: 25px 0;">
              <p>${participant.is_external ? 'Hello,' : `Hello ${name},`}</p>
              <p>Will you attend this meeting?</p>
              <div style="display: flex; gap: 10px;">
                <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">Accept</a>
                <a href="${declineUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Decline</a>
              </div>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              This invitation was sent to ${email}. If you have questions, please contact the organizer directly.
            </p>
          </div>
        `
        
        if (useSendGrid) {
          // Send email via SendGrid
          const msg = {
            to: email,
            from: {
              email: fromEmail,
              name: fromName,
            },
            subject: emailSubject,
            html: emailHtml,
            trackingSettings: {
              clickTracking: {
                enable: true
              },
              openTracking: {
                enable: true
              }
            }
          }
          
          try {
            await sgMail.send(msg)
            console.log(`Email sent to ${email}`)
            emailsSent.push(email)
          } catch (emailError) {
            console.error(`Error sending email to ${email}:`, emailError)
          }
        } else {
          // Fall back to console logging
          console.log(`Would send email to: ${email}`)
          console.log(`Subject: ${emailSubject}`)
          console.log(`Content: ${emailHtml}`)
          emailsSent.push(email)
        }
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

          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You've been invited to: ${event.title}</h2>
            <div style="background-color: #f8f9fa; border-left: 4px solid #4285f4; padding: 15px; margin: 15px 0;">
              <p><strong>When:</strong> ${startDate} - ${endDate}</p>
              <p><strong>Location:</strong> ${event.location || 'No location specified'}</p>
              <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
              <p><strong>Organized by:</strong> ${creator.first_name} ${creator.last_name}</p>
            </div>
            <div style="margin: 25px 0;">
              <p>${participant.is_external ? 'Hello,' : `Hello ${name},`}</p>
              <p>Will you attend this meeting?</p>
              <div style="display: flex; gap: 10px;">
                <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">Accept</a>
                <a href="${declineUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Decline</a>
              </div>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              This invitation was sent to ${email}. If you have questions, please contact the organizer directly.
            </p>
          </div>
        `
        
        if (useSendGrid) {
          // Send email via SendGrid
          const msg = {
            to: email,
            from: {
              email: fromEmail,
              name: fromName,
            },
            subject: emailSubject,
            html: emailHtml,
            trackingSettings: {
              clickTracking: {
                enable: true
              },
              openTracking: {
                enable: true
              }
            }
          }
          
          try {
            await sgMail.send(msg)
            console.log(`Email sent to ${email}`)
            emailsSent.push(email)
          } catch (emailError) {
            console.error(`Error sending email to ${email}:`, emailError)
          }
        } else {
          // Fall back to console logging
          console.log(`Would send email to: ${email}`)
          console.log(`Subject: ${emailSubject}`)
          console.log(`Content: ${emailHtml}`)
          emailsSent.push(email)
        }
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

          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You've been invited to: ${event.title}</h2>
            <div style="background-color: #f8f9fa; border-left: 4px solid #4285f4; padding: 15px; margin: 15px 0;">
              <p><strong>When:</strong> ${startDate} - ${endDate}</p>
              <p><strong>Location:</strong> ${event.location || 'No location specified'}</p>
              <p><strong>Description:</strong> ${event.description || 'No description provided'}</p>
              <p><strong>Organized by:</strong> ${creator.first_name} ${creator.last_name}</p>
            </div>
            <div style="margin: 25px 0;">
              <p>${participant.is_external ? 'Hello,' : `Hello ${name},`}</p>
              <p>Will you attend this meeting?</p>
              <div style="display: flex; gap: 10px;">
                <a href="${acceptUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">Accept</a>
                <a href="${declineUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Decline</a>
              </div>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              This invitation was sent to ${email}. If you have questions, please contact the organizer directly.
            </p>
          </div>
        `
        
        if (useSendGrid) {
          // Send email via SendGrid
          const msg = {
            to: email,
            from: {
              email: fromEmail,
              name: fromName,
            },
            subject: emailSubject,
            html: emailHtml,
            trackingSettings: {
              clickTracking: {
                enable: true
              },
              openTracking: {
                enable: true
              }
            }
          }
          
          try {
            await sgMail.send(msg)
            console.log(`Email sent to ${email}`)
            emailsSent.push(email)
          } catch (emailError) {
            console.error(`Error sending email to ${email}:`, emailError)
          }
        } else {
          // Fall back to console logging
          console.log(`Would send email to: ${email}`)
          console.log(`Subject: ${emailSubject}`)
          console.log(`Content: ${emailHtml}`)
          emailsSent.push(email)
        }
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
