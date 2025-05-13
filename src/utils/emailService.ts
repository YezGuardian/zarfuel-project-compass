import { supabase } from '@/integrations/supabase/client';
import { generateInvitationEmail, generatePasswordResetEmail } from './emailTemplates';

/**
 * Email service for sending emails through the Resend Edge Function
 */

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded content
  }>;
}

/**
 * Send an email using the Resend Edge Function
 */
export const sendEmail = async (params: SendEmailParams): Promise<{success: boolean, error?: string}> => {
  try {
    const { data, error } = await supabase.functions.invoke('resend-email', {
      body: params
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    if (data?.error) {
      console.error('Resend API error:', data.error);
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error sending email:', error);
    return { success: false, error: error.message || 'Unexpected error sending email' };
  }
};

/**
 * Send an invitation email
 */
export const sendInvitationEmail = async ({
  invitationId,
  email,
  role,
  organization,
  position,
  inviterName
}: {
  invitationId: string,
  email: string,
  role: string,
  organization?: string,
  position?: string,
  inviterName?: string
}): Promise<{success: boolean, error?: string}> => {
  try {
    // Get the base URL from the browser or environment variable
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://zarfuel.vercel.app';

    // Generate the email content
    const { subject, html } = generateInvitationEmail({
      invitationId,
      recipientEmail: email,
      role,
      organization,
      position,
      inviterName,
      baseUrl
    });

    // Send the email
    return await sendEmail({
      to: email,
      subject,
      html
    });
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    return { success: false, error: error.message || 'Failed to send invitation email' };
  }
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async ({
  resetToken,
  email
}: {
  resetToken: string,
  email: string
}): Promise<{success: boolean, error?: string}> => {
  try {
    // Get the base URL from the browser or environment variable
    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://zarfuel.vercel.app';

    // Generate the email content
    const { subject, html } = generatePasswordResetEmail({
      resetToken,
      recipientEmail: email,
      baseUrl
    });

    // Send the email
    return await sendEmail({
      to: email,
      subject,
      html
    });
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message || 'Failed to send password reset email' };
  }
}; 