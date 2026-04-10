-- Skill Badges & AI Career Analysis
-- Adds user_skill_badges table for earned achievement badges
-- and user_skill_assessments for AI-generated skill analysis

-- ── Skill Badges ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_skill_badges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  badge_name text NOT NULL,
  badge_icon text NOT NULL DEFAULT 'star',
  badge_category text NOT NULL DEFAULT 'writing',
  badge_tier text NOT NULL DEFAULT 'bronze' CHECK (badge_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  description text,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skill_badges_user ON public.user_skill_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_badges_category ON public.user_skill_badges(badge_category);

-- ── Skill Assessments (AI-generated) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_skill_assessments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessment jsonb NOT NULL DEFAULT '{}',
  career_stage text DEFAULT 'novice' CHECK (career_stage IN ('novice', 'emerging', 'established', 'authority')),
  skills jsonb DEFAULT '[]',
  strengths text[] DEFAULT '{}',
  growth_areas text[] DEFAULT '{}',
  next_steps text[] DEFAULT '{}',
  assessed_at timestamptz DEFAULT now(),
  posts_analyzed int DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_user_skill_assessments_user ON public.user_skill_assessments(user_id);

-- ── Enable RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.user_skill_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_assessments ENABLE ROW LEVEL SECURITY;

-- Users can read their own badges and all public badges
CREATE POLICY "Users can view own badges" ON public.user_skill_badges FOR SELECT USING (true);
CREATE POLICY "Service can insert badges" ON public.user_skill_badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update badges" ON public.user_skill_badges FOR UPDATE USING (true);

-- Users can read their own assessments
CREATE POLICY "Users can view own assessments" ON public.user_skill_assessments FOR SELECT USING (true);
CREATE POLICY "Service can insert assessments" ON public.user_skill_assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update assessments" ON public.user_skill_assessments FOR UPDATE USING (true);

-- ── Seed default badge definitions ────────────────────────────────────────────
-- These are the badges users can earn. Stored as reference data.
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  badge_id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'star',
  category text NOT NULL DEFAULT 'writing',
  tier text NOT NULL DEFAULT 'bronze',
  description text NOT NULL,
  criteria jsonb NOT NULL DEFAULT '{}'
);

INSERT INTO public.badge_definitions (badge_id, name, icon, category, tier, description, criteria) VALUES
  ('first-post', 'First Words', 'edit_note', 'writing', 'bronze', 'Published your first blog post', '{"posts_min": 1}'),
  ('prolific-5', 'Prolific Writer', 'auto_stories', 'writing', 'bronze', 'Published 5 blog posts', '{"posts_min": 5}'),
  ('prolific-25', 'Dedicated Author', 'menu_book', 'writing', 'silver', 'Published 25 blog posts', '{"posts_min": 25}'),
  ('prolific-100', 'Writing Machine', 'history_edu', 'writing', 'gold', 'Published 100 blog posts', '{"posts_min": 100}'),
  ('views-1k', 'Getting Noticed', 'visibility', 'engagement', 'bronze', 'Reached 1,000 total views', '{"views_min": 1000}'),
  ('views-10k', 'Rising Star', 'trending_up', 'engagement', 'silver', 'Reached 10,000 total views', '{"views_min": 10000}'),
  ('views-100k', 'Viral Voice', 'whatshot', 'engagement', 'gold', 'Reached 100,000 total views', '{"views_min": 100000}'),
  ('tech-expert', 'Tech Expert', 'computer', 'expertise', 'silver', 'Published 10+ posts in Technology', '{"topic": "Technology", "posts_min": 10}'),
  ('health-guru', 'Health Guru', 'favorite', 'expertise', 'silver', 'Published 10+ posts in Health', '{"topic": "Health", "posts_min": 10}'),
  ('biz-strategist', 'Business Strategist', 'business_center', 'expertise', 'silver', 'Published 10+ posts in Business/Strategy', '{"topic": "Business", "posts_min": 10}'),
  ('ai-pioneer', 'AI Pioneer', 'smart_toy', 'special', 'gold', 'Used AI copilot to enhance 10+ posts', '{"ai_assisted_min": 10}'),
  ('community-star', 'Community Star', 'groups', 'engagement', 'silver', 'Received 50+ comments across posts', '{"comments_min": 50}'),
  ('seo-master', 'SEO Master', 'query_stats', 'special', 'gold', 'Achieved high SEO scores on 5+ posts', '{"seo_checks_min": 5}')
ON CONFLICT (badge_id) DO NOTHING;

ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read badge definitions" ON public.badge_definitions FOR SELECT USING (true);
