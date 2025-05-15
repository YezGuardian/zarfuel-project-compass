const fs = require('fs');
const path = require('path');

// Supabase credentials - Make sure there are NO line breaks in these strings
const supabaseUrl = 'https://auswnhnpeetphmlqtecs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MzM0MTYsImV4cCI6MjA1NTEwOTQxNn0.s07yOdZYp9G1iDGmQZPL_TYxqbZV9n70_c_2SZw-Fsc';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTUzMzQxNiwiZXhwIjoyMDU1MTA5NDE2fQ.G-EvKmIlRSRQjKn66P-fJ_YDKhYu8XOK8T-VKj0vW9E';

// Log the lengths to verify we have complete keys
console.log('Anon key length:', supabaseAnonKey.length);
console.log('Service key length:', supabaseServiceRoleKey.length);

// Create the .env.local content
const envContent = `# Supabase configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}
VITE_SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceRoleKey}

# For older code that might be using these formats
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceRoleKey}
`;

// Write to .env file
const viteEnvPath = path.join(__dirname, '.env');
fs.writeFileSync(viteEnvPath, envContent);

console.log(`Environment file created at ${viteEnvPath}`);

// Also create a separate .env.local for backwards compatibility
const envLocalPath = path.join(__dirname, '.env.local');
fs.writeFileSync(envLocalPath, envContent);

console.log(`Local environment file created at ${envLocalPath}`);
console.log('Restart your development server to apply these changes.'); 