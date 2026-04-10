-- ============================================================
-- 1. XP & Achievements system
-- ============================================================

-- User XP ledger
CREATE TABLE IF NOT EXISTS user_xp (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak_days integer NOT NULL DEFAULT 0,
  last_active_date date,
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_xp_user ON user_xp(user_id);

-- XP transaction log (audit trail)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  entity_type text,        -- 'post', 'comment', 'like_received', 'forum_reply', etc.
  entity_id text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_xp_tx_user ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_tx_created ON xp_transactions(created_at DESC);

-- Achievement definitions (extends existing badge_definitions concept)
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,             -- e.g. 'first_post', 'streak_7'
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'emoji_events',
  category text NOT NULL DEFAULT 'general',  -- writing, engagement, social, streak, special
  xp_reward integer NOT NULL DEFAULT 0,
  threshold integer NOT NULL DEFAULT 1,       -- e.g. 100 for '100 likes'
  tier text NOT NULL DEFAULT 'bronze',        -- bronze, silver, gold, platinum, diamond
  sort_order integer NOT NULL DEFAULT 0
);

-- User earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  achievement_id text NOT NULL REFERENCES achievements(id),
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_user_ach_user ON user_achievements(user_id);

-- Seed default achievements
INSERT INTO achievements (id, name, description, icon, category, xp_reward, threshold, tier, sort_order) VALUES
  ('first_post',       'First Words',        'Publish your first blog post',               'edit_note',       'writing',     50,   1,   'bronze',   1),
  ('posts_5',          'Consistent Creator',  'Publish 5 blog posts',                       'auto_stories',    'writing',     100,  5,   'silver',   2),
  ('posts_25',         'Prolific Writer',     'Publish 25 blog posts',                      'history_edu',     'writing',     300,  25,  'gold',     3),
  ('posts_100',        'Legendary Author',    'Publish 100 blog posts',                     'military_tech',   'writing',     1000, 100, 'platinum', 4),
  ('first_like',       'First Fan',           'Receive your first like',                    'favorite',        'engagement',  20,   1,   'bronze',   10),
  ('likes_100',        'Rising Star',         'Receive 100 likes across all posts',         'star',            'engagement',  200,  100, 'silver',   11),
  ('likes_1000',       'Crowd Favorite',      'Receive 1,000 likes',                        'stars',           'engagement',  500,  1000,'gold',     12),
  ('first_comment',    'Conversation Starter','Leave your first comment',                   'chat',            'social',      30,   1,   'bronze',   20),
  ('comments_50',      'Active Commenter',    'Leave 50 comments',                          'forum',           'social',      150,  50,  'silver',   21),
  ('forum_helper',     'Forum Helper',        'Post 10 forum replies',                      'support_agent',   'social',      200,  10,  'silver',   22),
  ('forum_guru',       'Forum Guru',          'Post 100 forum replies',                     'school',          'social',      500,  100, 'gold',     23),
  ('streak_3',         'Getting Started',     'Maintain a 3-day activity streak',           'local_fire_department','streak',  50,   3,   'bronze',   30),
  ('streak_7',         'Week Warrior',        'Maintain a 7-day activity streak',           'whatshot',        'streak',      100,  7,   'silver',   31),
  ('streak_30',        'Monthly Machine',     'Maintain a 30-day activity streak',          'bolt',            'streak',      500,  30,  'gold',     32),
  ('streak_100',       'Unstoppable',         '100-day activity streak',                    'diamond',         'streak',      2000, 100, 'diamond',  33),
  ('first_follower',   'Pioneer',             'Get your first follower',                    'person_add',      'social',      40,   1,   'bronze',   40),
  ('followers_100',    'Influencer',          'Reach 100 followers',                         'groups',          'social',      300,  100, 'gold',     41),
  ('dna_generated',    'Self-Aware',          'Generate your Writer DNA profile',           'fingerprint',     'special',     100,  1,   'silver',   50),
  ('ghost_reader_used','Perspective Seeker',  'Use AI Ghost Reader on a post',              'visibility',      'special',     50,   1,   'bronze',   51)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. Writer DNA profiles
-- ============================================================

CREATE TABLE IF NOT EXISTS writer_dna (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  -- Radar chart axes (0-100 scale)
  vocabulary_richness integer NOT NULL DEFAULT 0,
  tone_consistency integer NOT NULL DEFAULT 0,
  topic_diversity integer NOT NULL DEFAULT 0,
  emotional_range integer NOT NULL DEFAULT 0,
  readability integer NOT NULL DEFAULT 0,
  storytelling integer NOT NULL DEFAULT 0,
  analytical_depth integer NOT NULL DEFAULT 0,
  engagement_power integer NOT NULL DEFAULT 0,
  -- Derived labels
  writing_style text,           -- e.g. 'The Analyst', 'The Storyteller'
  famous_writer_match text,     -- e.g. 'Malcolm Gladwell'
  match_explanation text,
  ai_summary text,              -- Short paragraph summary
  posts_analyzed integer NOT NULL DEFAULT 0,
  generated_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_writer_dna_user ON writer_dna(user_id);


-- ============================================================
-- 3. AI Ghost Reader feedback
-- ============================================================

CREATE TABLE IF NOT EXISTS ghost_reader_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id text NOT NULL,
  user_id text NOT NULL,          -- who requested it
  persona text NOT NULL,          -- 'student', 'ceo', 'journalist', 'skeptic', 'fan'
  feedback text NOT NULL,
  rating integer,                 -- 1-5 how well the post serves this persona
  key_strengths text[],
  suggestions text[],
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ghost_reader_post ON ghost_reader_feedback(post_id);
CREATE INDEX IF NOT EXISTS idx_ghost_reader_user ON ghost_reader_feedback(user_id);
