import { supabase } from '@/integrations/supabase/client';

/**
 * Server-side API calls for admin operations
 * These replace the dangerous direct database access with secure API endpoints
 */

export const secureDeleteUser = async (userId: string) => {
  const response = await fetch('/api/delete-auth-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: userId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete user');
  }
  
  return response.json();
};

export const secureDeleteProfile = async (profileId: string) => {
  const response = await fetch('/api/delete-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: profileId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete profile');
  }
  
  return response.json();
};

export const secureInviteUser = async (userData: {
  email: string;
  password: string;
  role: string;
  organization?: string;
  position?: string;
  invited_by?: string;
}) => {
  const response = await fetch('/api/invite-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to invite user');
  }
  
  return response.json();
};

export const secureSendPasswordReset = async (email: string) => {
  const response = await fetch('/api/send-password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send password reset');
  }
  
  return response.json();
};

/**
 * Secure file upload that respects RLS policies
 */
export const secureUploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      
    if (error) throw error;
    
    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return { 
      data: {
        path,
        url: publicUrlData.publicUrl,
        size: file.size,
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Secure upload error:', error);
    return { data: null, error };
  }
};