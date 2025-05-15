import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use hardcoded values since environment variables aren't working
const SUPABASE_URL = "https://auswnhnpeetphmlqtecs.supabase.co";
// Updated service role key to match the anon key's timeframe
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTUzMzQxNiwiZXhwIjoyMDU1MTA5NDE2fQ.G-EvKmIlRSRQjKn66P-fJ_YDKhYu8XOK8T-VKj0vW9E";

// To verify we don't have corrupted token or linebreaks
console.log('Service role key length:', SUPABASE_SERVICE_ROLE_KEY.length);
console.log('Service role key:', SUPABASE_SERVICE_ROLE_KEY);

// Create a service role client for admin operations
// This should be used carefully and only for admin operations
export const serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test service connection on initialization
(async () => {
  try {
    console.log('Testing Supabase service client connection...');
    const { data, error } = await serviceClient.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Supabase service client test failed:', error);
    } else {
      console.log('Supabase service client test successful:', data);
    }
  } catch (e) {
    console.error('Supabase service client test exception:', e);
  }
})();

// Helper function to check if the service role key is set
export const hasServiceRoleKey = (): boolean => {
  return !!SUPABASE_SERVICE_ROLE_KEY;
};

// Helper function to safely execute admin operations
export const executeAdminOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    if (!hasServiceRoleKey()) {
      console.warn('Service role key not set. Admin operations will not work.');
      return fallback;
    }
    return await operation();
  } catch (error) {
    console.error('Error executing admin operation:', error);
    return fallback;
  }
}; 