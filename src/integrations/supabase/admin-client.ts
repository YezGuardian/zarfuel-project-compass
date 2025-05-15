import { createClient } from '@supabase/supabase-js';

// Access keys for direct S3 access (bypassing RLS policies)
const S3_ACCESS_KEY = 'b060f494076a6e87be347359a7b7485c';
const S3_SECRET_KEY = '35ee85209ea190baee5fdd75320c2d1c19360209d44a7f43b316d47447e2e067';

// Use hardcoded values since environment variables aren't working consistently
const SUPABASE_URL = "https://auswnhnpeetphmlqtecs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1c3duaG5wZWV0cGhtbHF0ZWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MzM0MTYsImV4cCI6MjA1NTEwOTQxNn0.s07yOdZYp9G1iDGmQZPL_TYxqbZV9n70_c_2SZw-Fsc";

// Log key details
console.log('Admin client: Using hardcoded keys');
console.log('Admin client Anon key length:', SUPABASE_ANON_KEY.length);

// Create an admin supabase client that can bypass RLS
export const adminSupabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        // Use S3 credentials as auth headers
        'X-S3-Access-Key': S3_ACCESS_KEY,
        'X-S3-Secret-Key': S3_SECRET_KEY,
      },
    },
    auth: {
      persistSession: false,
    },
  }
);

// Function to execute SQL directly (bypassing RLS)
export const executeAdminSQL = async (sql: string) => {
  try {
    const { data, error } = await adminSupabase.rpc('execute_sql', { 
      sql_query: sql,
      s3_access_key: S3_ACCESS_KEY,
      s3_secret_key: S3_SECRET_KEY
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Admin SQL execution error:', error);
    return { data: null, error };
  }
};

// Direct S3 file upload function
export const uploadFileDirectS3 = async (
  bucketName: string,
  filePath: string,
  file: File
) => {
  try {
    const { data, error } = await adminSupabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
        headers: {
          'X-S3-Access-Key': S3_ACCESS_KEY,
          'X-S3-Secret-Key': S3_SECRET_KEY
        }
      });
      
    if (error) throw error;
    
    // Get public URL for the uploaded file
    const { data: publicUrlData } = adminSupabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return { 
      data: {
        path: filePath,
        url: publicUrlData.publicUrl,
        size: file.size,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return { data: null, error };
  }
}; 