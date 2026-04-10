-- ================================================================
-- BLOG FEATURES - Comments, Likes, Shares
-- ================================================================

-- 1. Comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL, -- Store email for guest comments if needed
  name TEXT NOT NULL,
  avatar_url TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')), -- Admin moderation
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes for comments
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON public.blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created ON public.blog_comments(created_at DESC);

-- 3. Post engagement table (likes, shares)
CREATE TABLE IF NOT EXISTS public.blog_engagement (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL CHECK (engagement_type IN ('like', 'share')),
  shared_on_platform TEXT, -- twitter, facebook, linkedin, etc (for shares)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes for engagement
CREATE INDEX IF NOT EXISTS idx_blog_engagement_post ON public.blog_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_engagement_user ON public.blog_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_engagement_type ON public.blog_engagement(engagement_type);
CREATE INDEX IF NOT EXISTS idx_blog_engagement_user_post ON public.blog_engagement(user_id, post_id);

-- 5. Add engagement counts to posts (denormalized for query performance)
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- 6. Enable RLS on new tables
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_engagement ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for comments
CREATE POLICY "Anyone can view approved comments" 
  ON public.blog_comments 
  FOR SELECT 
  USING (status = 'approved' OR is_approved = true);

CREATE POLICY "Users can create comments" 
  ON public.blog_comments 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can edit their own comments" 
  ON public.blog_comments 
  FOR UPDATE 
  USING (user_id = current_user_id() OR current_setting('role') = 'admin')
  WITH CHECK (user_id = current_user_id() OR current_setting('role') = 'admin');

-- 8. RLS Policies for engagement
CREATE POLICY "Anyone can view engagement stats" 
  ON public.blog_engagement 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create engagement records" 
  ON public.blog_engagement 
  FOR INSERT 
  WITH CHECK (true);

-- 9. Function to update engagement counts
CREATE OR REPLACE FUNCTION public.update_post_engagement_counts(post_id_param UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.posts SET
    likes_count = (SELECT COUNT(*) FROM public.blog_engagement WHERE post_id = post_id_param AND engagement_type = 'like'),
    comments_count = (SELECT COUNT(*) FROM public.blog_comments WHERE post_id = post_id_param AND is_approved = true),
    shares_count = (SELECT COUNT(*) FROM public.blog_engagement WHERE post_id = post_id_param AND engagement_type = 'share')
  WHERE id = post_id_param;
END;
$$;

-- 10. Trigger to update engagement counts when engagement changes
CREATE OR REPLACE FUNCTION public.trigger_update_engagement_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.update_post_engagement_counts(NEW.post_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_engagement_counts ON public.blog_engagement;
CREATE TRIGGER trigger_engagement_counts
AFTER INSERT OR DELETE ON public.blog_engagement
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_engagement_counts();

-- 11. Trigger to update engagement counts when comments are approved
CREATE OR REPLACE FUNCTION public.trigger_update_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM public.update_post_engagement_counts(NEW.post_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_comments_count ON public.blog_comments;
CREATE TRIGGER trigger_comments_count
AFTER INSERT OR UPDATE ON public.blog_comments
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_comments_count();

-- Done
COMMENT ON TABLE public.blog_comments IS 'Stores blog post comments with admin moderation';
COMMENT ON TABLE public.blog_engagement IS 'Tracks likes and shares for blog posts';
