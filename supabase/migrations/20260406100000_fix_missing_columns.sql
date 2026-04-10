-- 20260406100000_fix_missing_columns.sql
-- Fix missing columns that cause "Could not find column in schema cache" errors

-- ════════════════════════════════════════════════════════════════════════════════
-- 1. posts.published_at — needed for publish workflow
-- ════════════════════════════════════════════════════════════════════════════════
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;

-- Back-fill already-published posts: use created_at as fallback
UPDATE posts SET published_at = created_at
WHERE status = 'published' AND published_at IS NULL;

-- ════════════════════════════════════════════════════════════════════════════════
-- 2. posts approval columns — needed for moderation
-- ════════════════════════════════════════════════════════════════════════════════
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS approved_by TEXT;

-- Back-fill: published posts should have approved status
UPDATE posts SET approval_status = 'approved'
WHERE status = 'published' AND (approval_status IS NULL OR approval_status = 'pending');

-- ════════════════════════════════════════════════════════════════════════════════
-- 3. posts.category and posts.blog_theme
-- ════════════════════════════════════════════════════════════════════════════════
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS blog_theme TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;

-- ════════════════════════════════════════════════════════════════════════════════
-- 4. comments moderation columns — needed for approve/reject workflow
-- ════════════════════════════════════════════════════════════════════════════════
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS flagged_as_spam BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- ════════════════════════════════════════════════════════════════════════════════
-- 5. post_reviews moderation columns
-- ════════════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_reviews') THEN
    CREATE TABLE post_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      is_approved BOOLEAN DEFAULT true,
      approved_at TIMESTAMP WITH TIME ZONE,
      approved_by TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(post_id, user_id)
    );
    ALTER TABLE post_reviews ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Anyone can read approved reviews" ON post_reviews FOR SELECT USING (is_approved = true);
    CREATE POLICY "Users can insert own reviews" ON post_reviews FOR INSERT WITH CHECK (true);
  ELSE
    ALTER TABLE post_reviews
      ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS approved_by TEXT;
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════════
-- 6. career_tracks — ensure columns for admin panel
-- ════════════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'career_tracks') THEN
    CREATE TABLE career_tracks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT 'work',
      creator_count INTEGER DEFAULT 0,
      growth_rate NUMERIC DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    ALTER TABLE career_tracks ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Anyone can read active tracks" ON career_tracks FOR SELECT USING (is_active = true);
    CREATE POLICY "Admins can manage tracks" ON career_tracks FOR ALL USING (true);

    -- Seed default career tracks
    INSERT INTO career_tracks (name, description, icon, creator_count, growth_rate, is_active) VALUES
      ('Technical Writer', 'Master technical documentation, API guides, and developer-focused content creation.', 'code', 0, 0, true),
      ('Creative Storyteller', 'Craft compelling narratives, personal essays, and creative non-fiction.', 'auto_stories', 0, 0, true),
      ('Industry Analyst', 'Produce data-driven reports, market analysis, and thought leadership pieces.', 'analytics', 0, 0, true);
  ELSE
    ALTER TABLE career_tracks
      ADD COLUMN IF NOT EXISTS creator_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS growth_rate NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'work';
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════════
-- 7. career_levels — for career path progression
-- ════════════════════════════════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'career_levels') THEN
    CREATE TABLE career_levels (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      career_track_id UUID REFERENCES career_tracks(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      min_posts INTEGER DEFAULT 0,
      min_followers INTEGER DEFAULT 0,
      min_engagement NUMERIC DEFAULT 0,
      perks JSONB DEFAULT '[]',
      badge_icon TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    ALTER TABLE career_levels ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Anyone can read levels" ON career_levels FOR SELECT USING (true);
    CREATE POLICY "Admins can manage levels" ON career_levels FOR ALL USING (true);
  END IF;
END $$;

-- ════════════════════════════════════════════════════════════════════════════════
-- 8. Recreate views safely (drop if exist, then create)
-- ════════════════════════════════════════════════════════════════════════════════

-- posts_pending_approval view
CREATE OR REPLACE VIEW posts_pending_approval AS
SELECT
  p.id, p.title, p.excerpt, p.author_id,
  pr.name AS author_name, pr.avatar_url AS author_avatar,
  p.created_at, p.approval_status, p.approved_at, p.approved_by
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE p.approval_status = 'pending'
ORDER BY p.created_at ASC;

-- comments_pending_approval view
CREATE OR REPLACE VIEW comments_pending_approval AS
SELECT
  c.id, c.content, c.user_id, c.guest_name, c.guest_email,
  COALESCE(pr.name, c.guest_name, 'Anonymous') AS author_name,
  pr.avatar_url AS author_avatar,
  c.post_id, c.community_post_id,
  c.created_at, c.is_approved, c.flagged_as_spam
FROM comments c
LEFT JOIN profiles pr ON c.user_id = pr.id
WHERE c.is_approved = false OR c.flagged_as_spam = true
ORDER BY c.created_at DESC;

-- ════════════════════════════════════════════════════════════════════════════════
-- 9. Recreate RPCs for moderation
-- ════════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION approve_post(p_post_id UUID, p_approved_by TEXT)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE posts SET
    approval_status = 'approved',
    approved_by = p_approved_by,
    approved_at = NOW(),
    status = 'published',
    published_at = COALESCE(published_at, NOW())
  WHERE id = p_post_id;
  RETURN QUERY SELECT true, 'Post approved successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_post(p_post_id UUID, p_approved_by TEXT)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE posts SET
    approval_status = 'rejected',
    approved_by = p_approved_by,
    approved_at = NOW(),
    status = 'draft'
  WHERE id = p_post_id;
  RETURN QUERY SELECT true, 'Post rejected successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION approve_comment(p_comment_id UUID, p_approved_by TEXT)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE comments SET
    is_approved = true,
    approved_by = p_approved_by,
    approved_at = NOW(),
    flagged_as_spam = false
  WHERE id = p_comment_id;
  RETURN QUERY SELECT true, 'Comment approved successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reject_comment(p_comment_id UUID, p_approved_by TEXT, p_reason TEXT DEFAULT NULL)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  DELETE FROM comments WHERE id = p_comment_id;
  RETURN QUERY SELECT true, 'Comment rejected and deleted'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION flag_comment_as_spam(p_comment_id UUID, p_reason TEXT DEFAULT NULL)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
  UPDATE comments SET
    flagged_as_spam = true,
    flag_reason = p_reason
  WHERE id = p_comment_id;
  RETURN QUERY SELECT true, 'Comment flagged as spam'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ════════════════════════════════════════════════════════════════════════════════
-- 10. Useful indexes
-- ════════════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_approval_status ON posts(approval_status) WHERE approval_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved) WHERE is_approved = false;
CREATE INDEX IF NOT EXISTS idx_post_reviews_is_approved ON post_reviews(is_approved) WHERE is_approved = false;
CREATE INDEX IF NOT EXISTS idx_career_tracks_active ON career_tracks(is_active) WHERE is_active = true;
