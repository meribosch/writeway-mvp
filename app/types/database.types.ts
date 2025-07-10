export type User = {
  id: string;
  username: string;
  password?: string; // Don't expose this in client-side
  role: 'user' | 'admin';
  created_at: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
};

export type Story = {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  story_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}; 