-- Migration: 012_social_features_schema.sql
-- Description: Add tables for user follows, likes, notifications, and resumes

-- User Follows Table
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Follow Requests Table (for pending follow requests)
CREATE TABLE follow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  responded_at TIMESTAMP,
  UNIQUE(from_user_id, to_user_id),
  CHECK (from_user_id != to_user_id)
);

-- Post Likes Table
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  triggered_by_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'follow_request', 'mention', 'system')),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Resumes Table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template_id TEXT NOT NULL DEFAULT 'standard',
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_url TEXT UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Resume Sections Table
CREATE TABLE resume_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'contact')),
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  order_index INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_follow_requests_from_user ON follow_requests(from_user_id);
CREATE INDEX idx_follow_requests_to_user ON follow_requests(to_user_id);
CREATE INDEX idx_follow_requests_status ON follow_requests(status);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_resumes_user ON resumes(user_id);
CREATE INDEX idx_resumes_public ON resumes(is_public) WHERE is_public = true;
CREATE INDEX idx_resume_sections_resume ON resume_sections(resume_id);

-- Row-Level Security Policies
-- User Follows: Everyone can see follows, users can only manage their own
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON user_follows
  FOR INSERT WITH CHECK (auth.uid()::text = follower_id OR current_setting('app.user_id') = follower_id);

CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE USING (auth.uid()::text = follower_id OR current_setting('app.user_id') = follower_id);

-- Follow Requests: Users can see their own requests
ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see follow requests they sent or received" ON follow_requests
  FOR SELECT USING (
    auth.uid()::text = from_user_id OR 
    auth.uid()::text = to_user_id OR
    current_setting('app.user_id') = from_user_id OR
    current_setting('app.user_id') = to_user_id
  );

CREATE POLICY "Users can send follow requests" ON follow_requests
  FOR INSERT WITH CHECK (auth.uid()::text = from_user_id OR current_setting('app.user_id') = from_user_id);

CREATE POLICY "Users can update their own follow requests" ON follow_requests
  FOR UPDATE USING (auth.uid()::text = to_user_id OR current_setting('app.user_id') = to_user_id);

-- Post Likes: Everyone can see, users can only manage their own
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see likes" ON post_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON post_likes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

CREATE POLICY "Users can unlike posts" ON post_likes
  FOR DELETE USING (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

-- Notifications: Users can only see their own
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

-- Resumes: Users can see their own, public resumes are visible to all
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own resumes" ON resumes
  FOR SELECT USING (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

CREATE POLICY "Public resumes are visible to everyone" ON resumes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create resumes" ON resumes
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

CREATE POLICY "Users can update their own resumes" ON resumes
  FOR UPDATE USING (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

CREATE POLICY "Users can delete their own resumes" ON resumes
  FOR DELETE USING (auth.uid()::text = user_id OR current_setting('app.user_id') = user_id);

-- Resume Sections: Inherit resume visibility
ALTER TABLE resume_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see sections of their resumes" ON resume_sections
  FOR SELECT USING (
    resume_id IN (
      SELECT id FROM resumes WHERE user_id = auth.uid()::text OR user_id = current_setting('app.user_id')
    ) OR 
    resume_id IN (
      SELECT id FROM resumes WHERE is_public = true
    )
  );

CREATE POLICY "Users can manage sections of their resumes" ON resume_sections
  FOR INSERT WITH CHECK (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()::text OR user_id = current_setting('app.user_id'))
  );

CREATE POLICY "Users can update sections of their resumes" ON resume_sections
  FOR UPDATE USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()::text OR user_id = current_setting('app.user_id'))
  );

CREATE POLICY "Users can delete sections of their resumes" ON resume_sections
  FOR DELETE USING (
    resume_id IN (SELECT id FROM resumes WHERE user_id = auth.uid()::text OR user_id = current_setting('app.user_id'))
  );

-- Triggers
-- Update posts like count when a like is added or removed
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes = GREATEST(COALESCE(likes, 1) - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Auto-generate public URL for public resumes
CREATE OR REPLACE FUNCTION generate_resume_public_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_public AND NEW.public_url IS NULL THEN
    NEW.public_url := 'resume-' || NEW.id::text || '-' || substr(md5(random()::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_resume_public_url
BEFORE INSERT OR UPDATE ON resumes
FOR EACH ROW EXECUTE FUNCTION generate_resume_public_url();

-- Update resume updated_at timestamp
CREATE OR REPLACE FUNCTION update_resume_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resume_timestamp
BEFORE UPDATE ON resumes
FOR EACH ROW EXECUTE FUNCTION update_resume_timestamp();

CREATE TRIGGER trigger_update_resume_section_timestamp
BEFORE UPDATE ON resume_sections
FOR EACH ROW EXECUTE FUNCTION update_resume_timestamp();
