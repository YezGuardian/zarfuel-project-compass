# ZARFUEL Email System Documentation

This document explains how to set up and use the email system in the ZARFUEL project management application.

## Overview

The ZARFUEL email system uses [Resend](https://resend.com) as the email delivery service and Supabase Edge Functions to send emails. This setup provides a reliable way to send transactional emails, such as:

- User invitations
- Password reset emails
- Notifications
- Meeting invitations

## Setup Instructions

### 1. Set up a Resend Account

1. Sign up for an account at [Resend](https://resend.com)
2. Verify your domain
3. Generate an API key

### 2. Configure Supabase Environment Variables

Add the following environment variables to your Supabase project:

```bash
# In Supabase dashboard, go to Settings > API > Edge Functions
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@yourdomain.com  # Must be a verified domain in Resend
```

### 3. Deploy the Edge Function

The `resend-email` edge function is already set up in the project. To deploy it:

```bash
supabase functions deploy resend-email --no-verify-jwt
```

## How to Use the Email Service

The project includes an email service utility (`src/utils/emailService.ts`) that makes it easy to send emails:

### Basic Email Sending

```typescript
import { sendEmail } from '@/utils/emailService';

// Send a basic email
await sendEmail({
  to: 'recipient@example.com',
  subject: 'Hello from ZARFUEL',
  html: '<p>This is a test email</p>'
});
```

### Invitation Emails

```typescript
import { sendInvitationEmail } from '@/utils/emailService';

// Send an invitation email
await sendInvitationEmail({
  invitationId: 'invitation-uuid',
  email: 'newuser@example.com',
  role: 'viewer',
  organization: 'ACME Corp',
  position: 'Project Manager',
  inviterName: 'John Doe'
});
```

### Password Reset Emails

```typescript
import { sendPasswordResetEmail } from '@/utils/emailService';

// Send a password reset email
await sendPasswordResetEmail({
  resetToken: 'reset-token-uuid',
  email: 'user@example.com'
});
```

## Email Templates

Email templates are defined in `src/utils/emailTemplates.ts`. You can modify these templates to change the appearance and content of emails.

Each template function returns an object with `subject` and `html` properties:

```typescript
{
  subject: 'Email Subject',
  html: '<!DOCTYPE html>...'
}
```

## Customizing Templates

To create a new email template:

1. Add a new template function in `src/utils/emailTemplates.ts`
2. Export the function
3. Use the template in your code

## Troubleshooting

### Emails Not Being Sent

1. Check the Supabase Edge Function logs
2. Verify that the RESEND_API_KEY is correctly set
3. Ensure the sender email is from a verified domain in Resend
4. Check that the user has authorization to call the Edge Function

### Error Handling

The email service includes error handling that returns a structured response:

```typescript
{
  success: boolean,
  error?: string
}
```

Always check the `success` value and handle errors appropriately.

## User Management Workflow

1. Admin/SuperAdmin invites a user via email
2. User receives invitation email with a registration link
3. User clicks the link and creates an account
4. After registration, user is prompted to complete their profile
5. Once profile is complete, user can access the system with their assigned role

## Role-Based Permissions

The system has four roles with different permissions:

- **Super Admin**: Can invite special users, delete any user, change user status
- **Admin**: Can manage most aspects of the system
- **Special User**: Can edit specific pages (Phases & Tasks, Calendar, Meetings, Budget, Risk Management, Document Repository, Contact Directory)
- **Viewer**: Read-only access to specific pages (Overview, Phases & Tasks, Calendar, Meetings, Budget, Risk Management)

## How to Check Permissions

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { canViewPage, canEditPage } = useAuth();
  
  // Check if user can view the tasks page
  if (canViewPage('tasks')) {
    // Show tasks content
  }
  
  // Check if user can edit the budget page
  if (canEditPage('budget')) {
    // Show budget editing controls
  }
}
``` 