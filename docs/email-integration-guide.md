# Email Service Integration Guide

This guide provides detailed instructions for integrating popular email service providers with the meeting invitation system in this application.

> **Note**: The Supabase Edge Functions are written for the Deno runtime environment, which may cause linter errors in traditional TypeScript IDEs. These errors can be safely ignored as the code will still function correctly when deployed to Supabase's Edge Functions platform.

## Table of Contents

1. [SendGrid Integration](#sendgrid-integration)
2. [Mailgun Integration](#mailgun-integration)
3. [AWS SES Integration](#aws-ses-integration)
4. [Postmark Integration](#postmark-integration)
5. [Troubleshooting](#troubleshooting)

## SendGrid Integration

[SendGrid](https://sendgrid.com/) is a popular email service provider with a robust API that's easy to integrate with Supabase Edge Functions.

### Setup Steps

1. **Create a SendGrid Account**
   - Sign up at [SendGrid](https://sendgrid.com/) and create an account
   - Verify your account and complete the setup process

2. **Authenticate Your Domain**
   - Navigate to Settings > Sender Authentication
   - Follow the instructions to add DNS records to your domain
   - This improves deliverability and prevents emails from being marked as spam

3. **Create an API Key**
   - Go to Settings > API Keys
   - Click "Create API Key" and select "Full Access" or "Restricted Access" with "Mail Send" permissions
   - Copy and save your API key securely

4. **Add Environment Variables to Supabase**
   ```bash
   supabase secrets set SENDGRID_API_KEY="your-api-key" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref your-project-id
   ```

5. **Update the Edge Function**

   Edit `supabase/functions/send-meeting-invitation/index.ts`:

   ```typescript
   // Add at the top of your file
   import sgMail from 'https://esm.sh/@sendgrid/mail@7.7.0';

   // Replace the email sending code with:
   // Set up SendGrid
   const apiKey = Deno.env.get('SENDGRID_API_KEY');
   if (!apiKey) {
     throw new Error('SENDGRID_API_KEY is not set');
   }
   sgMail.setApiKey(apiKey);

   const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'notifications@example.com';
   const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Meeting Notifications';

   // Loop through participants
   for (const participant of participants) {
     if (participant.profiles && participant.profiles.email) {
       // Generate response URLs and email HTML as before...
       
       // Send email via SendGrid
       const msg = {
         to: participant.profiles.email,
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
       };
       
       try {
         await sgMail.send(msg);
         console.log(`Email sent to ${participant.profiles.email}`);
         emailsSent.push(participant.profiles.email);
       } catch (emailError) {
         console.error(`Error sending email to ${participant.profiles.email}:`, emailError);
       }
     }
   }
   ```

6. **Deploy the Updated Function**
   ```bash
   supabase functions deploy send-meeting-invitation --project-ref your-project-id
   ```

### Advanced Configuration

- **Email Templates**: Use SendGrid's [Dynamic Templates](https://sendgrid.com/docs/ui/sending-email/how-to-send-an-email-with-dynamic-templates/) for more sophisticated emails
- **Event Webhooks**: Set up [Event Webhooks](https://sendgrid.com/docs/for-developers/tracking-events/getting-started-event-webhook/) to track email deliveries, opens, and clicks
- **API Rate Limits**: Be aware of [SendGrid's rate limits](https://sendgrid.com/docs/API_Reference/Web_API_v3/How_To_Use_The_Web_API_v3/rate_limits.html) for your plan

## Mailgun Integration

[Mailgun](https://www.mailgun.com/) offers a developer-friendly email API with excellent analytics and a generous free tier.

### Setup Steps

1. **Create a Mailgun Account**
   - Sign up at [Mailgun](https://www.mailgun.com/) and create an account
   - Verify your account with payment information (required even for free tier)

2. **Add and Verify a Domain**
   - Navigate to Sending > Domains
   - Click "Add New Domain" and follow the verification instructions
   - Add the required DNS records to your domain

3. **Get Your API Key and Domain**
   - Go to Settings > API Keys
   - Copy your Private API Key
   - Note your Mailgun domain (e.g., mg.yourdomain.com)

4. **Add Environment Variables to Supabase**
   ```bash
   supabase secrets set MAILGUN_API_KEY="your-api-key" --project-ref your-project-id
   supabase secrets set MAILGUN_DOMAIN="mg.yourdomain.com" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_ADDRESS="meetings@mg.yourdomain.com" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref your-project-id
   ```

5. **Update the Edge Function**

   Edit `supabase/functions/send-meeting-invitation/index.ts`:

   ```typescript
   // Replace the email sending code with:
   const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY');
   const MAILGUN_DOMAIN = Deno.env.get('MAILGUN_DOMAIN');
   const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'notifications@example.com';
   const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Meeting Notifications';

   if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
     throw new Error('Mailgun credentials not configured');
   }

   // Loop through participants
   for (const participant of participants) {
     if (participant.profiles && participant.profiles.email) {
       // Generate response URLs and email HTML as before...
       
       // Send email via Mailgun REST API
       const formData = new FormData();
       formData.append('from', `${fromName} <${fromEmail}>`);
       formData.append('to', participant.profiles.email);
       formData.append('subject', emailSubject);
       formData.append('html', emailHtml);
       formData.append('o:tracking', 'yes');
       formData.append('o:tracking-clicks', 'yes');
       formData.append('o:tracking-opens', 'yes');
       
       try {
         const response = await fetch(
           `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`,
           {
             method: 'POST',
             headers: {
               Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
             },
             body: formData,
           }
         );
         
         if (response.ok) {
           const result = await response.json();
           console.log(`Email sent to ${participant.profiles.email}, Mailgun ID: ${result.id}`);
           emailsSent.push(participant.profiles.email);
         } else {
           const errorText = await response.text();
           throw new Error(`Mailgun API returned ${response.status}: ${errorText}`);
         }
       } catch (emailError) {
         console.error(`Error sending email to ${participant.profiles.email}:`, emailError);
       }
     }
   }
   ```

6. **Deploy the Updated Function**
   ```bash
   supabase functions deploy send-meeting-invitation --project-ref your-project-id
   ```

### Advanced Configuration

- **Email Templates**: Use [Mailgun Templates](https://documentation.mailgun.com/en/latest/api-templates.html) for reusable email designs
- **Email Analytics**: Set up [Webhooks](https://documentation.mailgun.com/en/latest/user_manual.html#webhooks) to track email events
- **API Reference**: Consult the [Mailgun API Reference](https://documentation.mailgun.com/en/latest/api_reference.html) for additional features

## AWS SES Integration

[Amazon SES](https://aws.amazon.com/ses/) is a cost-effective option for sending high volumes of email.

### Setup Steps

1. **Create an AWS Account**
   - Sign up at [AWS](https://aws.amazon.com/) if you don't have an account
   - Navigate to the SES (Simple Email Service) console

2. **Verify Email Addresses or Domain**
   - In the SES console, go to "Verified Identities"
   - Click "Create Identity" and follow instructions to verify your domain or email addresses
   - Add the required DNS records if verifying a domain

3. **Move Out of the Sandbox (for Production Use)**
   - New SES accounts are in the sandbox, limiting where you can send emails
   - Request a sending limit increase by creating a support ticket
   - Provide details about your email sending practices

4. **Create IAM Credentials**
   - Go to the IAM console
   - Create a new user or use an existing one
   - Attach the "AmazonSESFullAccess" policy or a custom policy with SES permissions
   - Generate and save the Access Key ID and Secret Access Key

5. **Add Environment Variables to Supabase**
   ```bash
   supabase secrets set AWS_ACCESS_KEY_ID="your-access-key-id" --project-ref your-project-id
   supabase secrets set AWS_SECRET_ACCESS_KEY="your-secret-access-key" --project-ref your-project-id
   supabase secrets set AWS_REGION="us-east-1" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref your-project-id
   ```

6. **Update the Edge Function**

   Edit `supabase/functions/send-meeting-invitation/index.ts`:

   ```typescript
   // Add at the top of your file
   import { SESClient, SendEmailCommand } from 'https://esm.sh/@aws-sdk/client-ses@3.423.0';

   // Replace the email sending code with:
   const sesClient = new SESClient({
     region: Deno.env.get('AWS_REGION') || 'us-east-1',
     credentials: {
       accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') || '',
       secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') || '',
     },
   });

   const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'notifications@example.com';
   const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Meeting Notifications';

   // Loop through participants
   for (const participant of participants) {
     if (participant.profiles && participant.profiles.email) {
       // Generate response URLs and email HTML as before...
       
       // Send email via AWS SES
       const sendEmailCommand = new SendEmailCommand({
         Source: `${fromName} <${fromEmail}>`,
         Destination: {
           ToAddresses: [participant.profiles.email],
         },
         Message: {
           Subject: {
             Data: emailSubject,
             Charset: 'UTF-8',
           },
           Body: {
             Html: {
               Data: emailHtml,
               Charset: 'UTF-8',
             },
           },
         },
       });
       
       try {
         const result = await sesClient.send(sendEmailCommand);
         console.log(`Email sent to ${participant.profiles.email}, SES Message ID: ${result.MessageId}`);
         emailsSent.push(participant.profiles.email);
       } catch (emailError) {
         console.error(`Error sending email to ${participant.profiles.email}:`, emailError);
       }
     }
   }
   ```

7. **Deploy the Updated Function**
   ```bash
   supabase functions deploy send-meeting-invitation --project-ref your-project-id
   ```

### Advanced Configuration

- **Configuration Sets**: Use [SES Configuration Sets](https://docs.aws.amazon.com/ses/latest/dg/using-configuration-sets.html) to track email metrics
- **Event Publishing**: Set up [Event Publishing](https://docs.aws.amazon.com/ses/latest/dg/monitor-sending-activity.html) to track bounces and complaints
- **SMTP Interface**: Consider using the [SMTP Interface](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html) for certain applications

## Postmark Integration

[Postmark](https://postmarkapp.com/) is known for its excellent delivery rates and analytics.

### Setup Steps

1. **Create a Postmark Account**
   - Sign up at [Postmark](https://postmarkapp.com/) and create an account
   - Create a new server for your application

2. **Verify Your Domain**
   - Navigate to "Domains" and add your domain
   - Follow the DNS verification instructions
   - Complete DKIM, Return-Path, and DMARC setup for best deliverability

3. **Get Your Server Token**
   - Go to your server settings
   - Copy the "Server Token" for API access

4. **Add Environment Variables to Supabase**
   ```bash
   supabase secrets set POSTMARK_SERVER_TOKEN="your-server-token" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref your-project-id
   ```

5. **Update the Edge Function**

   Edit `supabase/functions/send-meeting-invitation/index.ts`:

   ```typescript
   // Replace the email sending code with:
   const POSTMARK_SERVER_TOKEN = Deno.env.get('POSTMARK_SERVER_TOKEN');
   const fromEmail = Deno.env.get('EMAIL_FROM_ADDRESS') || 'notifications@example.com';
   const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Meeting Notifications';

   if (!POSTMARK_SERVER_TOKEN) {
     throw new Error('POSTMARK_SERVER_TOKEN is not set');
   }

   // Loop through participants
   for (const participant of participants) {
     if (participant.profiles && participant.profiles.email) {
       // Generate response URLs and email HTML as before...
       
       // Send email via Postmark API
       try {
         const response = await fetch('https://api.postmarkapp.com/email', {
           method: 'POST',
           headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
           },
           body: JSON.stringify({
             From: `${fromName} <${fromEmail}>`,
             To: participant.profiles.email,
             Subject: emailSubject,
             HtmlBody: emailHtml,
             TrackOpens: true,
             TrackLinks: 'HtmlAndText',
           }),
         });
         
         if (response.ok) {
           const result = await response.json();
           console.log(`Email sent to ${participant.profiles.email}, Postmark ID: ${result.MessageID}`);
           emailsSent.push(participant.profiles.email);
         } else {
           const errorData = await response.json();
           throw new Error(`Postmark API returned ${response.status}: ${errorData.Message}`);
         }
       } catch (emailError) {
         console.error(`Error sending email to ${participant.profiles.email}:`, emailError);
       }
     }
   }
   ```

6. **Deploy the Updated Function**
   ```bash
   supabase functions deploy send-meeting-invitation --project-ref your-project-id
   ```

### Advanced Configuration

- **Templates**: Use [Postmark Templates](https://postmarkapp.com/developer/api/templates-api) for consistent email designs
- **Message Streams**: Configure [Message Streams](https://postmarkapp.com/support/article/1207-how-to-use-message-streams) to separate transactional and marketing emails
- **Webhooks**: Set up [Webhooks](https://postmarkapp.com/developer/webhooks/webhooks-overview) for tracking email events

## Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Check if all environment variables are correctly set
   - Verify that your API keys have the right permissions
   - Look for error messages in the Supabase logs

2. **Emails Going to Spam**
   - Ensure your domain is properly verified with SPF, DKIM, and DMARC records
   - Avoid spam trigger words in your email content
   - Build sender reputation by gradually increasing email volume

3. **Rate Limiting Issues**
   - Implement a queue system for high-volume sending
   - Add retry logic with exponential backoff
   - Check the rate limits for your email provider and plan

4. **Error Handling**
   - Add comprehensive error logging
   - Implement a fallback email service
   - Set up monitoring for email delivery issues

### Debugging Tips

- Use the Supabase logs to view function execution details:
  ```bash
  supabase functions logs send-meeting-invitation --project-ref your-project-id
  ```

- Test your email service directly using their API testing tools

- Verify email sending with a test endpoint:
  ```typescript
  // Create a test endpoint in a new function
  if (req.method === 'POST') {
    // Simple test email sending
    const { to } = await req.json();
    // Use your email service code here
    return new Response(JSON.stringify({ success: true }));
  }
  ```

Remember to properly handle errors and implement appropriate security measures when working with email services and user data. 