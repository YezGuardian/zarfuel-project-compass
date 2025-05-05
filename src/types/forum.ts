
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  attachments: string[];
  likes: string[];
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
  author?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}
