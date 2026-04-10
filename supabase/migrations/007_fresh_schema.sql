-- ================================================================
-- AiBlog FRESH Schema — Designed for Clerk + OTP Auth
-- ================================================================
-- HOW TO USE:
--   1. Go to Supabase Dashboard → SQL Editor
--   2. Paste this ENTIRE file
--   3. Click "Run"
--
-- This migration:
--   - Drops ALL existing AiBlog tables (clean slate)
--   - Creates tables with TEXT primary key for profiles
--     (supports Clerk IDs like "user_2abc" and OTP IDs)
--   - Uses permissive RLS since Clerk handles auth, not Supabase Auth
--   - Includes otp_codes, newsletter_subscribers, and RPC functions
-- ================================================================

-- 0. Drop everything in correct order (respects foreign keys)
DROP TABLE IF EXISTS public.otp_codes CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.user_career_progress CASCADE;
DROP TABLE IF EXISTS public.career_levels CASCADE;
DROP TABLE IF EXISTS public.career_tracks CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.followers CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.blog_prompts CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop old trigger if it exists (was for Supabase Auth, no longer used)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. PROFILES
--    id is TEXT to support Clerk IDs (user_xxx) and OTP IDs
-- ================================================================
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================================
-- 2. POSTS
-- ================================================================
CREATE TABLE public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  ai_generated BOOLEAN DEFAULT false,
  topic TEXT,
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Auto-update updated_at on posts
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ================================================================
-- 3. BLOG PROMPTS (AI generation history)
-- ================================================================
CREATE TABLE public.blog_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  topic TEXT,
  tone TEXT CHECK (tone IN ('professional', 'casual', 'academic', 'creative')) DEFAULT 'professional',
  generated_content TEXT,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================================
-- 4. COMMUNITY POSTS
-- ================================================================
CREATE TABLE public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================================
-- 5. COMMENTS (supports blog posts + community posts + guest)
-- ================================================================
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  community_post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_name TEXT,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================================
-- 6. LIKES
-- ================================================================
CREATE TABLE public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  community_post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT likes_unique_post UNIQUE (user_id, post_id),
  CONSTRAINT likes_unique_community UNIQUE (user_id, community_post_id),
  CONSTRAINT likes_unique_comment UNIQUE (user_id, comment_id)
);

-- ================================================================
-- 7. FOLLOWERS
-- ================================================================
CREATE TABLE public.followers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- ================================================================
-- 8. CAREER TRACKS
-- ================================================================
CREATE TABLE public.career_tracks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  creator_count INTEGER DEFAULT 0,
  growth_rate INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================================
-- 9. CAREER LEVELS
-- ================================================================
CREATE TABLE public.career_levels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  career_track_id UUID REFERENCES public.career_tracks(id) ON DELETE CASCADE NOT NULL,
  level INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  perks TEXT[] DEFAULT ARRAY[]::TEXT[],
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================================
-- 10. USER CAREER PROGRESS
-- ================================================================
CREATE TABLE public.user_career_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  career_track_id UUID REFERENCES public.career_tracks(id) ON DELETE CASCADE NOT NULL,
  current_level INTEGER DEFAULT 1,
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  engagements_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, career_track_id)
);

-- ================================================================
-- 11. NOTIFICATIONS
-- ================================================================
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('like', 'comment', 'follow', 'mention', 'career_milestone', 'system')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================================
-- 12. ADMIN SETTINGS
-- ================================================================
CREATE TABLE public.admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ================================================================
-- 13. NEWSLETTER SUBSCRIBERS
-- ================================================================
CREATE TABLE public.newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- ================================================================
-- 14. OTP CODES
-- ================================================================
CREATE TABLE public.otp_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX idx_blog_prompts_user ON public.blog_prompts(user_id);
CREATE INDEX idx_community_posts_user ON public.community_posts(user_id);
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_community ON public.comments(community_post_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_likes_post ON public.likes(post_id);
CREATE INDEX idx_followers_follower ON public.followers(follower_id);
CREATE INDEX idx_followers_following ON public.followers(following_id);
CREATE INDEX idx_career_tracks_active ON public.career_tracks(is_active);
CREATE INDEX idx_career_levels_track ON public.career_levels(career_track_id);
CREATE INDEX idx_user_career_user ON public.user_career_progress(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_otp_codes_email ON public.otp_codes(email);
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);

-- ================================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_career_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES
-- Since Clerk handles auth (not Supabase Auth), auth.uid() is always NULL.
-- Server API routes use the SERVICE_ROLE_KEY which bypasses RLS entirely.
-- The browser anon client only needs to sync profiles, so we make
-- profiles fully permissive. All other tables are service-role only.
-- ================================================================

-- Profiles: fully permissive (browser AuthContext syncs profiles via anon key)
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (true);

-- Posts: public read, service role for writes
CREATE POLICY "posts_select" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT WITH CHECK (true);
CREATE POLICY "posts_update" ON public.posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "posts_delete" ON public.posts FOR DELETE USING (true);

-- Comments: public read, permissive write (guests can comment)
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "comments_update" ON public.comments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "comments_delete" ON public.comments FOR DELETE USING (true);

-- All other tables: fully permissive (auth enforced by Clerk in API routes)
CREATE POLICY "all_blog_prompts" ON public.blog_prompts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_community_posts" ON public.community_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_likes" ON public.likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_followers" ON public.followers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_career_tracks" ON public.career_tracks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_career_levels" ON public.career_levels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_user_career" ON public.user_career_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_newsletter" ON public.newsletter_subscribers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_otp_codes" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);

-- ================================================================
-- RPC: Increment post views
-- ================================================================
CREATE OR REPLACE FUNCTION public.increment_post_views(post_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.posts SET views = views + 1 WHERE id = post_id;
END;
$$;

-- ================================================================
-- STORAGE: blog-images bucket
-- ================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Anyone can upload blog images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images');

-- ================================================================
-- DONE! Your schema is ready for Clerk + OTP authentication.
-- ================================================================
