#!/bin/bash

# Set your Supabase project ID - replace with your actual project ID
PROJECT_ID="your-project-id"

echo "Running database migrations..."
supabase db push --db-url postgresql://postgres:postgres@localhost:54322/postgres

echo "Deploying Supabase Edge Functions..."

# Deploy all Edge Functions
echo "Deploying send-meeting-invitation function..."
supabase functions deploy send-meeting-invitation --project-ref $PROJECT_ID

echo "Deploying meeting-response function..."
supabase functions deploy meeting-response --project-ref $PROJECT_ID

echo "Deploying create-notification function..."
supabase functions deploy create-notification --project-ref $PROJECT_ID

echo "Deploying init-storage function..."
supabase functions deploy init-storage --project-ref $PROJECT_ID

echo "Deploying send-invitation function..."
supabase functions deploy send-invitation --project-ref $PROJECT_ID

echo "All functions deployed successfully!"

# Set the environment variables for email and app configuration
echo "Setting environment variables..."
supabase secrets set APP_BASE_URL="https://your-app-url.com" --project-ref $PROJECT_ID
supabase secrets set SENDGRID_API_KEY="your-sendgrid-api-key" --project-ref $PROJECT_ID
supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com" --project-ref $PROJECT_ID
supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref $PROJECT_ID

echo "Deployment completed!" 
supabase secrets set APP_BASE_URL="https://your-app-url.com" --project-ref $PROJECT_ID
supabase secrets set SENDGRID_API_KEY="your-sendgrid-api-key" --project-ref $PROJECT_ID
supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com" --project-ref $PROJECT_ID
supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref $PROJECT_ID

echo "Deployment completed!" 
supabase secrets set APP_BASE_URL="https://your-app-url.com" --project-ref $PROJECT_ID
supabase secrets set SENDGRID_API_KEY="your-sendgrid-api-key" --project-ref $PROJECT_ID
supabase secrets set EMAIL_FROM_ADDRESS="meetings@yourdomain.com" --project-ref $PROJECT_ID
supabase secrets set EMAIL_FROM_NAME="Your Company Meetings" --project-ref $PROJECT_ID

echo "Deployment completed!" 

# Set your Supabase project ID - replace with your actual project ID
PROJECT_ID="your-project-id"

echo "Deploying Supabase Edge Functions..."

# Deploy all Edge Functions
echo "Deploying send-meeting-invitation function..."
supabase functions deploy send-meeting-invitation --project-ref $PROJECT_ID

echo "Deploying meeting-response function..."
supabase functions deploy meeting-response --project-ref $PROJECT_ID

echo "Deploying create-notification function..."
supabase functions deploy create-notification --project-ref $PROJECT_ID

echo "Deploying init-storage function..."
supabase functions deploy init-storage --project-ref $PROJECT_ID

echo "Deploying send-invitation function..."
supabase functions deploy send-invitation --project-ref $PROJECT_ID

echo "All functions deployed successfully!"

# Set the APP_BASE_URL environment variable for the meeting-response function
echo "Setting environment variables..."
supabase secrets set APP_BASE_URL="https://your-app-url.com" --project-ref $PROJECT_ID

echo "Deployment completed!" 