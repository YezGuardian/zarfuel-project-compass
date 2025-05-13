/**
 * Email template generator functions for various email types
 */

interface InvitationEmailParams {
  invitationId: string;
  recipientEmail: string;
  role: string;
  organization?: string;
  position?: string;
  inviterName?: string;
  baseUrl: string;
}

interface ResetPasswordEmailParams {
  resetToken: string;
  recipientEmail: string;
  baseUrl: string;
}

/**
 * Generate an HTML email for user invitations
 */
export const generateInvitationEmail = ({
  invitationId,
  recipientEmail,
  role,
  organization,
  position,
  inviterName,
  baseUrl
}: InvitationEmailParams): {
  subject: string;
  html: string;
} => {
  const signupUrl = `${baseUrl}/auth/register?invitation_id=${invitationId}`;
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
  
  const subject = `You've been invited to join the ZARFUEL Committee Dashboard`;
  
  const html = `
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
          <p>You have been invited to join the ZARFUEL committee dashboard${inviterName ? ` by ${inviterName}` : ''}.</p>
          
          <p><strong>Details:</strong></p>
          <ul>
            <li><strong>Email:</strong> ${recipientEmail}</li>
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
  
  return { subject, html };
};

/**
 * Generate an HTML email for password reset
 */
export const generatePasswordResetEmail = ({
  resetToken,
  recipientEmail,
  baseUrl
}: ResetPasswordEmailParams): {
  subject: string;
  html: string;
} => {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(recipientEmail)}`;
  
  const subject = 'Reset Your ZARFUEL Dashboard Password';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
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
          <p>We received a request to reset your password for the ZARFUEL committee dashboard.</p>
          
          <p>Please click the button below to reset your password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>If you're unable to click the button, copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
          
          <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} ZARFUEL. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}; 