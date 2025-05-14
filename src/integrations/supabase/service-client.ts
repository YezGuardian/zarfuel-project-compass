import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use hardcoded values since environment variables aren't working
const SUPABASE_URL = "https://auswnhnpeetphmlqtecs.supabase.co";
// Hardcoded service role key - this would normally be in environment variables
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjAxNjYzOCwiZXhwIjoyMDYxNTkyNjM4fQ.ptBT-_nrn4gUcWvgTq-ZjK93Rl-k-lRVv-0w1717kOc";

// Create a service role client for admin operations
// This should be used carefully and only for admin operations
export const serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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