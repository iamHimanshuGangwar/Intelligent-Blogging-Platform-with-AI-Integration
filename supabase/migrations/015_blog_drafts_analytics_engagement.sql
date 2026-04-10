-- Migration: 015_blog_drafts_analytics_engagement.sql
-- Description: Complete schema for blog drafts, analytics, engagement, and community features

-- ============================================================================
-- BLOG DRAFTS TABLE - Save incomplete blog posts
-- ============================================================================
CREATE TABLE blog_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  slug TEXT UNIQUE,
  content TEXT,
  brief TEXT,
  cover_image_url TEXT,
  category TEXT,
  tags TEXT[], -- Array of tags
  status TEXT CHECK (status IN ('draft', 'published', 'archived', 'deleted')) DEFAULT 'draft',
  completion_percentage INT DEFAULT 0,
  
  -- Completion tracking
  has_title BOOLEAN DEFAULT false,
  has_brief BOOLEAN DEFAULT false,
  has_content BOOLEAN DEFAULT false,
  has_sections INT DEFAULT 0, -- Number of completed sections
  total_sections INT DEFAULT 0,
  
  -- Metadata
  word_count INT DEFAULT 0,
  reading_time_minutes INT DEFAULT 0,
  is_auto_saved BOOLEAN DEFAULT true,
  
  -- Publishing
  published_at TIMESTAMP,
  scheduled_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_drafts_user_id ON blog_drafts(user_id);
CREATE INDEX idx_blog_drafts_status ON blog_drafts(status);
CREATE INDEX idx_blog_drafts_updated_at ON blog_drafts(updated_at DESC);
CREATE INDEX idx_blog_drafts_published_at ON blog_drafts(published_at DESC);

-- ============================================================================
-- BLOG POST VERSIONS TABLE - Track draft history
-- ============================================================================
CREATE TABLE blog_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_draft_id UUID NOT NULL REFERENCES blog_drafts(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  title TEXT,
  content TEXT,
  brief TEXT,
  saved_by TEXT, -- 'auto_save' or 'manual'
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_versions_draft_id ON blog_versions(blog_draft_id);
CREATE INDEX idx_blog_versions_version_number ON blog_versions(version_number DESC);

-- ============================================================================
-- BLOG POST ENGAGEMENT TABLE - Likes, comments, shares
-- ============================================================================
CREATE TABLE blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_draft_id UUID NOT NULL REFERENCES blog_drafts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(blog_draft_id, user_id) -- One like per user per post
);

CREATE INDEX idx_blog_likes_blog_id ON blog_likes(blog_draft_id);
CREATE INDEX idx_blog_likes_user_id ON blog_likes(user_id);

-- ============================================================================
-- BLOG COMMENTS TABLE
-- ============================================================================
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_draft_id UUID NOT NULL REFERENCES blog_drafts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  
  -- Engagement
  likes_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_blog_comments_blog_id ON blog_comments(blog_draft_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_parent_id ON blog_comments(parent_comment_id);

-- ============================================================================
-- BLOG SHARES TABLE - Track shares
-- ============================================================================
CREATE TABLE blog_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_draft_id UUID NOT NULL REFERENCES blog_drafts(id) ON DELETE CASCADE,
  shared_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  share_platform TEXT CHECK (share_platform IN ('twitter', 'linkedin', 'facebook', 'email', 'direct')),
  shared_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_shares_blog_id ON blog_shares(blog_draft_id);
CREATE INDEX idx_blog_shares_shared_by ON blog_shares(shared_by_user_id);

-- ============================================================================
-- BLOG VIEWS TABLE - Track page views
-- ============================================================================
CREATE TABLE blog_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_draft_id UUID NOT NULL REFERENCES blog_drafts(id) ON DELETE CASCADE,
  viewer_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  time_spent_seconds INT,
  view_type TEXT CHECK (view_type IN ('full_read', 'partial', 'preview')) DEFAULT 'preview',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_views_blog_id ON blog_views(blog_draft_id);
CREATE INDEX idx_blog_views_date ON blog_views(created_at DESC);

-- ============================================================================
-- USER FOLLOWERS TABLE
-- ============================================================================
CREATE TABLE user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  follower_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(user_id, follower_user_id) -- One follow relationship per pair
);

CREATE INDEX idx_user_followers_user_id ON user_followers(user_id);
CREATE INDEX idx_user_followers_follower_id ON user_followers(follower_user_id);

-- ============================================================================
-- USER ANALYTICS TABLE - Daily metrics
-- ============================================================================
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Views and engagement
  total_views INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  new_followers INT DEFAULT 0,
  
  -- Calculated metrics
  engagement_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_date ON user_analytics(date DESC);

-- ============================================================================
-- TRENDING TOPICS TABLE - Real trending data
-- ============================================================================
CREATE TABLE trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  
  -- Trending metrics
  mention_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  engagement_count INT DEFAULT 0,
  
  -- Trending period
  trending_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rank INT,
  
  -- Category
  category TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_trending_topics_date ON trending_topics(trending_date DESC);
CREATE INDEX idx_trending_topics_rank ON trending_topics(rank);

-- ============================================================================
-- AUDIENCE MAPPING TABLE - Track audience demographics
-- ============================================================================
CREATE TABLE audience_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_draft_id UUID NOT NULL REFERENCES blog_drafts(id) ON DELETE CASCADE,
  
  -- Audience segments
  students_percentage INT DEFAULT 0,
  professionals_percentage INT DEFAULT 0,
  content_creators_percentage INT DEFAULT 0,
  other_percentage INT DEFAULT 0,
  
  -- Total audience
  total_reach INT DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audience_mapping_blog_id ON audience_mapping(blog_draft_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE blog_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_mapping ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Blog Drafts: Users see their own drafts, published posts visible to all
CREATE POLICY "Users see own drafts" ON blog_drafts
  FOR SELECT USING (auth.uid() = user_id OR status = 'published');

CREATE POLICY "Users can update own drafts" ON blog_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts" ON blog_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Blog Likes: Everyone can read, users can insert their own
CREATE POLICY "Anyone can see likes" ON blog_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON blog_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON blog_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Blog Comments: Everyone can read approved, users can insert own
CREATE POLICY "Anyone can see approved comments" ON blog_comments
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can comment on posts" ON blog_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Blog Views: Service role can insert
CREATE POLICY "Allow inserting views" ON blog_views
  FOR INSERT WITH CHECK (true);

-- User Analytics: Users see their own, admins see all
CREATE POLICY "Users see own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Trending Topics: Everyone can read
CREATE POLICY "Anyone can see trending topics" ON trending_topics
  FOR SELECT USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get blog engagement stats
CREATE OR REPLACE FUNCTION get_blog_stats(p_blog_id UUID)
RETURNS TABLE(
  likes_count BIGINT,
  comments_count BIGINT,
  shares_count BIGINT,
  views_count BIGINT,
  engagement_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT COUNT(*) FROM blog_likes WHERE blog_draft_id = p_blog_id), 0) as likes_count,
    COALESCE((SELECT COUNT(*) FROM blog_comments WHERE blog_draft_id = p_blog_id AND is_approved = true), 0) as comments_count,
    COALESCE((SELECT COUNT(*) FROM blog_shares WHERE blog_draft_id = p_blog_id), 0) as shares_count,
    COALESCE((SELECT COUNT(*) FROM blog_views WHERE blog_draft_id = p_blog_id), 0) as views_count,
    CASE 
      WHEN (SELECT COUNT(*) FROM blog_views WHERE blog_draft_id = p_blog_id) > 0 THEN
        ROUND((
          (COALESCE((SELECT COUNT(*) FROM blog_likes WHERE blog_draft_id = p_blog_id), 0) + 
           COALESCE((SELECT COUNT(*) FROM blog_comments WHERE blog_draft_id = p_blog_id AND is_approved = true), 0)) * 100.0 /
          (SELECT COUNT(*) FROM blog_views WHERE blog_draft_id = p_blog_id)
        )::NUMERIC, 2)
      ELSE 0
    END as engagement_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user analytics
CREATE OR REPLACE FUNCTION update_user_analytics(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_analytics (user_id, date, total_views, total_likes, total_comments, total_shares, new_followers, engagement_rate)
  SELECT
    p_user_id,
    CURRENT_DATE,
    COALESCE((SELECT COUNT(*) FROM blog_views bv 
      JOIN blog_drafts bd ON bv.blog_draft_id = bd.id 
      WHERE bd.user_id = p_user_id AND DATE(bv.created_at) = CURRENT_DATE), 0),
    COALESCE((SELECT COUNT(*) FROM blog_likes bl 
      JOIN blog_drafts bd ON bl.blog_draft_id = bd.id 
      WHERE bd.user_id = p_user_id AND DATE(bl.created_at) = CURRENT_DATE), 0),
    COALESCE((SELECT COUNT(*) FROM blog_comments bc 
      JOIN blog_drafts bd ON bc.blog_draft_id = bd.id 
      WHERE bd.user_id = p_user_id AND DATE(bc.created_at) = CURRENT_DATE), 0),
    COALESCE((SELECT COUNT(*) FROM blog_shares bs 
      JOIN blog_drafts bd ON bs.blog_draft_id = bd.id 
      WHERE bd.user_id = p_user_id AND DATE(bs.shared_at) = CURRENT_DATE), 0),
    COALESCE((SELECT COUNT(*) FROM user_followers 
      WHERE user_id = p_user_id AND DATE(created_at) = CURRENT_DATE), 0),
    0
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_views = EXCLUDED.total_views,
    total_likes = EXCLUDED.total_likes,
    total_comments = EXCLUDED.total_comments,
    total_shares = EXCLUDED.total_shares,
    new_followers = EXCLUDED.new_followers,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate blog completion percentage
CREATE OR REPLACE FUNCTION calculate_blog_completion(p_blog_id UUID)
RETURNS INT AS $$
DECLARE
  v_completion INT;
BEGIN
  SELECT (
    (CASE WHEN has_title THEN 25 ELSE 0 END) +
    (CASE WHEN has_brief THEN 25 ELSE 0 END) +
    (CASE WHEN has_content THEN 25 ELSE 0 END) +
    (CASE WHEN word_count > 500 THEN 25 ELSE 0 END)
  ) INTO v_completion
  FROM blog_drafts WHERE id = p_blog_id;
  
  RETURN COALESCE(v_completion, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update completion percentage
CREATE OR REPLACE FUNCTION update_blog_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completion_percentage = calculate_blog_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_completion_update
  BEFORE UPDATE ON blog_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_completion();
