export interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  updated_at?: string;
  is_edited?: boolean;
  attachments: string[];
  likes: Array<{
    userId: string;
    isLike: boolean;
    userName: string;
  }> | string | any[];
  mentioned_users: string[] | string;
  author?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  author_id: string;
  updated_at?: string;
  is_edited?: boolean;
  likes: Array<{
    userId: string;
    isLike: boolean;
    userName: string;
  }> | string | any[];
  mentioned_users: string[] | string;
  author?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface ForumNotification {
  id: string;
  user_id: string;
  type: 'post_created' | 'comment_created' | 'mention' | 'post_edited' | 'post_deleted';
  content: string;
  source_id: string;
  is_read: boolean;
  created_at: string;
}
