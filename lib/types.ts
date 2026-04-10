// User/Profile Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'creator' | 'admin';
  bio?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

// Blog Post Types
export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  blog_theme?: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  ai_generated: boolean;
  topic?: string;
  views: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

// Blog Prompt for AI Generation
export interface BlogPrompt {
  id: string;
  user_id: string;
  prompt: string;
  topic?: string;
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  generated_content?: string;
  used: boolean;
  created_at: string;
  updated_at: string;
}

// Community Post
export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

// Comment
export interface Comment {
  id: string;
  post_id?: string;
  community_post_id?: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

// Admin Settings
export interface AdminSettings {
  id: string;
  key: string;
  value: string | number | boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBlogTheme {
  id: string;
  name: string;
  description?: string;
  preview_icon?: string;
  created_by?: string;
  is_public?: boolean;
  is_featured?: boolean;
  status?: 'active' | 'archived';
  theme_config?: unknown;
}
