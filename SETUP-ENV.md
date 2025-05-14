# Setting Up Environment Variables

To fix the permission issues with user creation, you need to set up the Supabase service role key in your environment variables.

## Step 1: Create a .env.local file

Create a file named `.env.local` in the root of your project with the following content:

```
# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=https://auswnhnpeetphmlqtecs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key - NEVER expose this in client-side code in production
# This is only used here because we're implementing a quick fix for admin operations
# In a production environment, these operations should be moved to a secure server-side API
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 2: Get your Supabase service role key

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Navigate to your project
3. Go to Project Settings → API
4. Find the "Project API keys" section
5. Copy the "service_role key" (NOT the anon key)
6. Replace `your-service-role-key-here` in your `.env.local` file with this key

## Step 3: Restart your development server

After setting up the environment variables, restart your development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Important Security Warning

The service role key has full access to your database, bypassing all Row Level Security (RLS) policies. 

**In production:**
- NEVER expose this key to the client
- Move admin operations to a secure server-side API
- Use proper authentication and authorization checks

This client-side implementation is only a temporary solution for development purposes. 