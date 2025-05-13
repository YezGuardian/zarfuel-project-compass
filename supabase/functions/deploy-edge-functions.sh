#!/bin/bash

# Log in to Supabase CLI (requires Supabase CLI to be installed)
# supabase login

# Navigate to the functions directory
cd "$(dirname "$0")"

# Deploy the execute-sql function
echo "Deploying execute-sql Edge Function..."
supabase functions deploy execute-sql --project-ref your-project-reference

echo "Deployment complete!" 