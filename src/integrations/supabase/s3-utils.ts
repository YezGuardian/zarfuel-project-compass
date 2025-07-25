import { supabase } from './client';

// SECURITY: S3 credentials removed - use standard Supabase storage without bypass

/**
 * Ensure a bucket exists, create it if it doesn't
 */
const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking if bucket '${bucketName}' exists...`);
    
    // Get all buckets and check if our bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    // Check if the bucket exists with exact name
    if (buckets && buckets.some(b => b.name === bucketName)) {
      console.log(`Bucket '${bucketName}' already exists`);
      return true;
    }
    
    // Try to find the bucket with different capitalization
    const variations = [
      bucketName.toLowerCase(),
      bucketName.toUpperCase(),
      bucketName.charAt(0).toUpperCase() + bucketName.slice(1).toLowerCase()
    ];
    
    for (const variation of variations) {
      if (buckets && buckets.some(b => b.name === variation)) {
        console.log(`Found bucket with different capitalization: '${variation}'`);
        return true;
      }
    }
    
    // Print existing buckets for debugging
    if (buckets) {
      console.log('Available buckets:', buckets.map(b => b.name));
    }
    
    // Bucket doesn't exist, try to create it
    console.log(`Bucket doesn't exist. Attempting to create bucket '${bucketName}'...`);
    
    // Try to create the bucket
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    });
    
    if (createError) {
      console.error(`Error creating bucket '${bucketName}':`, createError);
      return false;
    }
    
    console.log(`Successfully created bucket '${bucketName}'`);
    return true;
  } catch (error) {
    console.error(`Error checking/creating bucket '${bucketName}':`, error);
    return false;
  }
};

/**
 * Upload a file to S3 bypassing RLS policies
 */
export const uploadFileWithS3Credentials = async (
  bucket: string,
  path: string, 
  file: File
) => {
  try {
    console.log(`Uploading file to bucket: "${bucket}", path: "${path}"`);
    console.log(`File info: name=${file.name}, type=${file.type}, size=${file.size}bytes`);
    
    // Ensure the bucket name is correctly specified
    if (!bucket || bucket.trim() === '') {
      throw new Error('Bucket name is required');
    }
    
    // Try to ensure the bucket exists
    const bucketExists = await ensureBucketExists(bucket);
    
    if (!bucketExists) {
      throw new Error(`Failed to create or verify bucket '${bucket}'`);
    }
    
    // Upload the file with standard client (no credential bypass)
    const uploadOptions = {
      upsert: true,
      contentType: file.type
    };
    
    console.log('Upload options:', uploadOptions);
    
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, uploadOptions);
      
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }
    
    console.log('Upload successful, getting public URL');
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    console.log('Public URL generated:', publicUrlData.publicUrl);
      
    return { 
      data: { 
        path, 
        url: publicUrlData.publicUrl,
        size: file.size
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error in S3 upload process:', error);
    return { data: null, error };
  }
}; 