import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = "https://auswnhnpeetphmlqtecs.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

interface InvitationRequest {
  email: string;
  role?: string;
  organization?: string;
  position?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get the session from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the session
    const token = authHeader.replace("Bearer ", "");
    const { data: sessionData, error: sessionError } = await supabase.auth.getUser(token);

    if (sessionError || !sessionData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const inviterUserId = sessionData.user.id;

    // Verify if the inviter is an admin
    const { data: inviterProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email, first_name, last_name")
      .eq("id", inviterUserId)
      .single();

    if (profileError || !inviterProfile) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch inviter profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if inviter is a superadmin (by role or if it's Yezreel Shirinda)
    const isSuperAdmin = 
      inviterProfile.role === "superadmin" || 
      inviterProfile.email?.toLowerCase() === "yezreel@whitepaperconcepts.co.za" || 
      (inviterProfile.first_name === "Yezreel" && inviterProfile.last_name === "Shirinda");

    // Regular users cannot invite others
    if (inviterProfile.role !== "admin" && !isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: "Only admins and super admins can send invitations" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get invitation details from request
    const { email, role = "viewer", organization = "", position = "" } = await req.json() as InvitationRequest;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only superadmins can invite new superadmins or special users
    if ((role === "superadmin" || role === "special") && !isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: `Only super admins can invite ${role} users` }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save invitation to the database
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .insert([
        { 
          email,
          invited_by: inviterUserId,
          role,
          organization,
          position
        }
      ])
      .select()
      .single();

    if (invitationError) {
      console.error("Error creating invitation:", invitationError);
      return new Response(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate invitation email with HTML template
    const inviterName = `${inviterProfile.first_name} ${inviterProfile.last_name}`;
    const baseUrl = req.headers.get("origin") || SUPABASE_URL;
    const signupUrl = `${baseUrl}/auth/register?invitation_id=${invitation.id}`;
    
    // Generate email HTML
    const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>ZARFUEL Invitation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .container {
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 4px 4px 0 0;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            font-size: 12px;
            color: #666;
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ZARFUEL Committee Dashboard</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have been invited to join the ZARFUEL committee dashboard by ${inviterName}.</p>
            
            <p><strong>Details:</strong></p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Role:</strong> ${roleDisplay}</li>
              ${organization ? `<li><strong>Organization:</strong> ${organization}</li>` : ''}
              ${position ? `<li><strong>Position:</strong> ${position}</li>` : ''}
            </ul>
            
            <p>Please click the button below to complete your registration:</p>
            
            <a href="${signupUrl}" class="button">Complete Registration</a>
            
            <p>If you're unable to click the button, copy and paste this URL into your browser:</p>
            <p>${signupUrl}</p>
            
            <p>This invitation link will expire in 7 days.</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} ZARFUEL. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send invitation email using resend-email function
    const { error: emailError } = await supabase.functions.invoke('resend-email', {
      body: {
        to: email,
        subject: `You've been invited to join the ZARFUEL Committee Dashboard`,
        html: emailHtml,
        from: "Zarfuel Committee <noreply@zarfuel.com>"
      }
    });

    // If email sending fails, clean up the invitation
    if (emailError) {
      console.error("Error sending invitation email:", emailError);
      // Clean up the invitation if email fails
      await supabase.from("invitations").delete().eq("id", invitation.id);
      
      return new Response(
        JSON.stringify({ error: "Failed to send invitation email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully",
        invitation
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
