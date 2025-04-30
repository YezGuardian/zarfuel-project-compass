
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
      .select("role")
      .eq("id", inviterUserId)
      .single();

    if (profileError || !inviterProfile || inviterProfile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only admins can send invitations" }),
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

    // Generate signup link with invitation ID
    const signupLink = `${req.headers.get("origin") || SUPABASE_URL}/auth/register?invitation_id=${invitation.id}`;

    // Send invitation email through Supabase Auth API
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: signupLink,
      data: {
        invitation_id: invitation.id,
        role,
      }
    });

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
