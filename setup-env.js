const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://auswnhnpeetphmlqtecs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMTY2MzgsImV4cCI6MjA2MTU5MjYzOH0.tJXZNrK9LaGtVzy-_UuNOgj1kW6zC-FXDxTiIwevFcc';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAxNjYzOCwiZXhwIjoyMDYxNTkyNjM4fQ.ptBT-_nrn4gUcWvgTq-ZjK93Rl-k-lRVv-0w1717kOc';

// Create the .env.local content
const envContent = `# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Service role key - NEVER expose this in client-side code in production
# This is only used here because we're implementing a quick fix for admin operations
# In a production environment, these operations should be moved to a secure server-side API
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceRoleKey}
`;

// Write to .env.local file
const envPath = path.join(__dirname, '.env.local');
fs.writeFileSync(envPath, envContent);

console.log(`Environment file created at ${envPath}`);
console.log('Restart your development server to apply these changes.'); 