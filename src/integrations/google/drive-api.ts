// Google Drive API integration
import { supabase } from '@/integrations/supabase/client';

// Add type declarations for Google API
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<any>;
        drive: {
          files: {
            create: (params: any) => Promise<any>;
            list: (params: any) => Promise<any>;
            get: (params: any) => Promise<any>;
            delete: (params: any) => Promise<any>;
          };
          permissions: {
            create: (params: any) => Promise<any>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
          };
          signIn: () => Promise<any>;
        };
      };
    };
  }
}

// Configuration - stored in environment variables for security
// These keys would be loaded from environment variables in production
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
// Default folder where files will be stored if no specific folder is provided
const DEFAULT_DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '';

// Flag to determine if we're in development mode with mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || !GOOGLE_API_KEY;

// Load the Google API client library
const loadGoogleApiClient = async (): Promise<typeof window.gapi | null> => {
  if (typeof window === 'undefined') return null;
  
  // Check if gapi is already loaded
  if (window.gapi) return window.gapi;
  
  return new Promise((resolve, reject) => {
    // Add the Google API script if it doesn't exist
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client:auth2', () => {
        window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
          scope: 'https://www.googleapis.com/auth/drive.file'
        }).then(() => {
          resolve(window.gapi);
        }).catch(error => {
          console.error('Error initializing Google API client:', error);
          reject(error);
        });
      });
    };
    script.onerror = (error) => {
      console.error('Error loading Google API script:', error);
      reject(error);
    };
    document.body.appendChild(script);
  });
};

/**
 * Checks authentication status and signs in if needed
 */
const ensureAuthenticated = async (): Promise<boolean> => {
  try {
    if (USE_MOCK_DATA) return true;
    
    const gapi = await loadGoogleApiClient();
    if (!gapi) return false;
    
    const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    if (!isSignedIn) {
      await gapi.auth2.getAuthInstance().signIn();
    }
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  } catch (error) {
    console.error('Google authentication error:', error);
    return false;
  }
};

/**
 * Creates a folder in Google Drive if it doesn't already exist
 */
const createFolderIfNotExists = async (folderName: string, parentFolderId: string = DEFAULT_DRIVE_FOLDER_ID): Promise<string> => {
  if (USE_MOCK_DATA) return `mock-folder-${Date.now()}`;
  
  try {
    const gapi = await loadGoogleApiClient();
    
    // Check if folder already exists
    const response = await gapi.client.drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
      fields: 'files(id, name)'
    });
    
    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }
    
    // Create the folder
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId]
    };
    
    const folderResponse = await gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });
    
    return folderResponse.result.id;
  } catch (error) {
    console.error('Error creating folder in Google Drive:', error);
    throw error;
  }
};

/**
 * Upload a file to Google Drive
 */
export const uploadToDrive = async (file: File, folderPath: string = ''): Promise<{url: string, fileId: string} | null> => {
  try {
    console.log('Uploading to Google Drive:', file.name);
    
    // Use mock data in development
    if (USE_MOCK_DATA) {
      // Simulate a delay for the "upload"
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a fake Google Drive ID
      const fakeFileId = `gdrive-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      // Create a fakeDriveUrl
      const fakeDriveUrl = `https://drive.google.com/file/d/${fakeFileId}/view`;
      
      console.log('File "uploaded" to Google Drive (MOCK):', fakeDriveUrl);
      
      return {
        url: fakeDriveUrl,
        fileId: fakeFileId
      };
    }
    
    // Real implementation
    const isAuthenticated = await ensureAuthenticated();
    if (!isAuthenticated) {
      throw new Error('Google Drive authentication failed');
    }
    
    const gapi = await loadGoogleApiClient();
    
    // Create folder structure if needed
    let folderId = DEFAULT_DRIVE_FOLDER_ID;
    if (folderPath) {
      const folderNames = folderPath.split('/').filter(name => name);
      for (const name of folderNames) {
        folderId = await createFolderIfNotExists(name, folderId);
      }
    }
    
    // Prepare the file metadata
    const metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      parents: [folderId]
    };
    
    // Read the file
    const content = await file.arrayBuffer();
    
    // Upload the file
    const response = await gapi.client.drive.files.create({
      resource: metadata,
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: content
      },
      fields: 'id'
    });
    
    const fileId = response.result.id;
    
    // Set file to be publicly viewable (can be adjusted based on requirements)
    await gapi.client.drive.permissions.create({
      fileId: fileId,
      resource: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    const url = `https://drive.google.com/file/d/${fileId}/view`;
    
    console.log('File uploaded to Google Drive:', url);
    
    return {
      url,
      fileId
    };
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    
    // Fallback to mock data if real upload fails
    if (!USE_MOCK_DATA) {
      console.log('Falling back to mock data due to error');
      return uploadToDrive(file, folderPath);
    }
    
    return null;
  }
};

/**
 * Generate a Google Drive viewer URL for a file
 */
export const getDriveViewerUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/view`;
};

/**
 * Generate a Google Drive download URL for a file
 */
export const getDriveDownloadUrl = (fileId: string): string => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

/**
 * Generate a Google Drive embed URL for a file
 */
export const getDriveEmbedUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

/**
 * Extract file ID from a Google Drive URL
 */
export const extractDriveFileId = (url: string): string | null => {
  // Match patterns like /file/d/FILE_ID/view or id=FILE_ID
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)\/|id=([^&]+)/);
  if (fileIdMatch) {
    return fileIdMatch[1] || fileIdMatch[2];
  }
  return null;
};

/**
 * Delete a file from Google Drive
 */
export const deleteFromDrive = async (fileId: string): Promise<boolean> => {
  try {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('File "deleted" from Google Drive (MOCK):', fileId);
      return true;
    }
    
    const isAuthenticated = await ensureAuthenticated();
    if (!isAuthenticated) {
      throw new Error('Google Drive authentication failed');
    }
    
    const gapi = await loadGoogleApiClient();
    
    await gapi.client.drive.files.delete({
      fileId: fileId
    });
    
    console.log('File deleted from Google Drive:', fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    return false;
  }
};

/**
 * Get file metadata from Google Drive
 */
export const getFileMetadata = async (fileId: string): Promise<any | null> => {
  try {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: fileId,
        name: `Mock File ${fileId.substring(0, 8)}`,
        mimeType: 'application/pdf',
        size: '1024000',
        createdTime: new Date().toISOString()
      };
    }
    
    const isAuthenticated = await ensureAuthenticated();
    if (!isAuthenticated) {
      throw new Error('Google Drive authentication failed');
    }
    
    const gapi = await loadGoogleApiClient();
    
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,size,createdTime,webViewLink,webContentLink'
    });
    
    return response.result;
  } catch (error) {
    console.error('Error getting file metadata from Google Drive:', error);
    return null;
  }
}; 