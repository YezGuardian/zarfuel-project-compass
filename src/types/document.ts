
export interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  category: string;
  created_at: string;
  uploaded_by: string | null;
  folder_id?: string;
  downloaded_by: any[] | null; // Added to fix type errors
  uploader?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface DocumentUploadResponse {
  path: string;
  id: string;
}
