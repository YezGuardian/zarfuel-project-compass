# Email Functionality Setup Guide

This guide helps you set up the email functionality for meeting invitations in your project.

## Local Testing

1. Make sure you have the Supabase CLI installed. If not, follow the [official installation guide](https://supabase.io/docs/guides/cli).

2. Start your local Supabase instance:
   ```bash
   supabase start
   ```

3. Deploy the functions to your local Supabase instance:
   ```bash
   supabase functions deploy send-meeting-invitation
   supabase functions deploy meeting-response
   ```

4. Set the required environment variables:
   ```bash
   # For local testing
   supabase secrets set APP_BASE_URL="http://localhost:3000"
   
   # If you want to test with SendGrid (optional)
   supabase secrets set SENDGRID_API_KEY="your-sendgrid-api-key"
   supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com"
   supabase secrets set EMAIL_FROM_NAME="Your Company Meetings"
   ```

5. Use the `test-email-function.js` script to test the email sending functionality:
   ```bash
   # First install node-fetch if you don't have it
   npm install node-fetch
   
   # Then run the test script
   node test-email-function.js
   ```
   Note: Make sure to update the `eventId` in the script with a valid ID from your database.

## Production Deployment

1. Update the deployment scripts with your actual Supabase project ID:
   - For Windows: Edit `supabase/deploy-functions.bat`
   - For Unix/Mac: Edit `supabase/deploy-functions.sh`

2. Update the email configuration in the deployment scripts:
   ```
   # Replace these with your actual values
   supabase secrets set SENDGRID_API_KEY="your-sendgrid-api-key" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com" --project-ref your-project-id
   supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref your-project-id
   supabase secrets set APP_BASE_URL="https://your-production-url.com" --project-ref your-project-id
   ```

3. Run the deployment script:
   - For Windows: `supabase\deploy-functions.bat`
   - For Unix/Mac: `chmod +x supabase/deploy-functions.sh && ./supabase/deploy-functions.sh`

## Email Provider Configuration

The current implementation uses SendGrid, but you can use any of these email providers by modifying the `send-meeting-invitation/index.ts` file:

1. **SendGrid** (currently implemented)
   - Sign up at [SendGrid](https://sendgrid.com/)
   - Create an API key with mail sending permissions
   - Set the `SENDGRID_API_KEY` environment variable

2. **Mailgun**
   - See the detailed integration guide in `docs/email-integration-guide.md`

3. **AWS SES** 
   - See the detailed integration guide in `docs/email-integration-guide.md`

4. **Postmark**
   - See the detailed integration guide in `docs/email-integration-guide.md`

## Troubleshooting

- **Emails not sending**: Check if your API keys and environment variables are correctly set
- **Function not found**: Make sure you've deployed the functions correctly
- **Invalid event ID**: Verify that the event ID exists in your database
- **SendGrid errors**: Check your SendGrid dashboard for error logs or rate limiting issues

For more detailed provider-specific configuration, refer to `docs/email-integration-guide.md`. 