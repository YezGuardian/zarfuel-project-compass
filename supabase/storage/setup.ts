// This file contains helper functions for setting up Supabase storage

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add this at the top if not already present
declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Create documents bucket if it doesn't exist
export const createDocumentsBucket = async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw error;
    }
    
    const documentsBucketExists = buckets.some(bucket => bucket.name === 'documents');
    
    if (!documentsBucketExists) {
      const { error: createError } = await supabase.storage.createBucket(
        'documents',
        {
          public: false, // Private by default
          fileSizeLimit: 10485760, // 10MB
        }
      );
      
      if (createError) {
        throw createError;
      }
      
      console.log('Created documents bucket');
      
      // Create policies for the documents bucket
      await createBucketPolicies(supabase);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting up storage:', error);
    return { success: false, error };
  }
};

// Create storage policies
const createBucketPolicies = async (supabase: SupabaseClient) => {
  try {
    // Allow authenticated users to upload files
    await supabase.storage.from('documents').createPolicy('authenticated upload policy', {
      name: 'authenticated-upload-policy',
      definition: `
        (role() = 'authenticated')::boolean
      `,
      type: 'INSERT',
    });
    
    // Allow authenticated users to read files
    await supabase.storage.from('documents').createPolicy('authenticated download policy', {
      name: 'authenticated-download-policy',
      definition: `
        (role() = 'authenticated')::boolean
      `,
      type: 'SELECT',
    });
    
    // Allow authenticated users to update files
    await supabase.storage.from('documents').createPolicy('authenticated update policy', {
      name: 'authenticated-update-policy', 
      definition: `
        (role() = 'authenticated')::boolean
      `,
      type: 'UPDATE',
    });
    
    // Allow authenticated users to delete files
    await supabase.storage.from('documents').createPolicy('authenticated delete policy', {
      name: 'authenticated-delete-policy',
      definition: `
        (role() = 'authenticated')::boolean
      `,
      type: 'DELETE',
    });
    
    console.log('Created bucket policies');
  } catch (error) {
    console.error('Error creating bucket policies:', error);
    throw error;
  }
};
