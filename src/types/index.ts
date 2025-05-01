
export type Status = 'complete' | 'inprogress' | 'notstarted' | 'ongoing';

export type Task = {
  id: string;
  title: string;
  description?: string;
  phase_id: string;
  phase?: string; // For display purposes
  responsible_teams?: string[];
  start_date?: string;
  end_date?: string;
  status: Status;
  progress: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  team?: string; // For display purposes
};

export type Phase = {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  position: number;
  tasks?: Task[];
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type Comment = {
  id: string;
  content: string;
  task_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export type Event = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_meeting: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  participants?: EventParticipant[];
};

export type EventParticipant = {
  id: string;
  event_id: string;
  user_id: string;
  response: 'pending' | 'accepted' | 'declined';
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export type MeetingMinute = {
  id: string;
  event_id: string;
  file_path: string;
  file_name: string;
  created_at: string;
  uploaded_by: string;
  uploader?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export type Contact = {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  visibility: 'public' | 'admin_only' | 'company_specific';
  company_visibility?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
};

export type Document = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  category: string;
  created_at: string;
  uploaded_by?: string;
  uploader?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

export type Notification = {
  id: string;
  type: 'task_created' | 'task_updated' | 'comment_added' | 'meeting_scheduled' | 'document_uploaded';
  content: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
};

export type User = {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  first_name?: string;
  last_name?: string;
  company?: string;
  position?: string;
  phone?: string;
  title?: string;
};
