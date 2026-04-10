-- Forum Schema Migration
-- Creates all tables needed for the community forum feature

-- Forum Categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'forum',
  gradient TEXT DEFAULT 'from-blue-500 to-purple-600',
  slug TEXT UNIQUE NOT NULL,
  topic_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Topics
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  author_avatar TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  last_reply_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_replies(id) ON DELETE SET NULL,
  author_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT FALSE,
  like_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum Topic Likes
CREATE TABLE IF NOT EXISTS forum_topic_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- Forum Reply Likes
CREATE TABLE IF NOT EXISTS forum_reply_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(reply_id, user_id)
);

-- Forum Bookmarks
CREATE TABLE IF NOT EXISTS forum_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(topic_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_last_reply_at ON forum_topics(last_reply_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author_id ON forum_replies(author_id);

-- Seed default categories
INSERT INTO forum_categories (name, description, icon, gradient, slug, order_index)
VALUES
  ('AI & Machine Learning', 'Discuss AI tools, machine learning, LLMs, and automation', 'smart_toy', 'from-blue-500 to-purple-600', 'ai-machine-learning', 1),
  ('Career & Growth', 'Share career advice, job search tips, and professional development', 'trending_up', 'from-emerald-500 to-teal-600', 'career-growth', 2),
  ('Tech & Development', 'Programming talks, frameworks, devops, and software engineering', 'code', 'from-orange-500 to-red-500', 'tech-development', 3),
  ('General Discussion', 'Off-topic conversations, introductions, and community chat', 'chat', 'from-pink-500 to-rose-600', 'general-discussion', 4),
  ('Q&A / Help', 'Ask the community for help and answer others'' questions', 'help', 'from-yellow-500 to-amber-600', 'qa-help', 5),
  ('Resources & Tools', 'Share useful tools, guides, tutorials, and learning resources', 'bookmark', 'from-indigo-500 to-blue-600', 'resources-tools', 6),
  ('Announcements', 'Platform announcements, updates, and community news', 'campaign', 'from-violet-500 to-purple-600', 'announcements', 7),
  ('Showcase', 'Show off your projects, articles, and achievements', 'star', 'from-cyan-500 to-blue-500', 'showcase', 8)
ON CONFLICT (slug) DO NOTHING;

-- Function to increment topic/post counts on forum_categories
CREATE OR REPLACE FUNCTION increment_forum_category_topic_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_categories SET topic_count = topic_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_categories SET topic_count = GREATEST(0, topic_count - 1) WHERE id = OLD.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_forum_topic_count
AFTER INSERT OR DELETE ON forum_topics
FOR EACH ROW EXECUTE FUNCTION increment_forum_category_topic_count();

-- Function to update reply_count and last_reply_at on topics
CREATE OR REPLACE FUNCTION update_forum_topic_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_topics
    SET reply_count = reply_count + 1, last_reply_at = NOW()
    WHERE id = NEW.topic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_topics
    SET reply_count = GREATEST(0, reply_count - 1)
    WHERE id = OLD.topic_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_forum_reply_count
AFTER INSERT OR DELETE ON forum_replies
FOR EACH ROW EXECUTE FUNCTION update_forum_topic_on_reply();
