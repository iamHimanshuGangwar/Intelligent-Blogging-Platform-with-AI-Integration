-- Ensure trending_topics table exists (may have been missed in migration 015)
CREATE TABLE IF NOT EXISTS public.trending_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  mention_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  engagement_count INT DEFAULT 0,
  trending_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rank INT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trending_topics_date ON public.trending_topics(trending_date DESC);
CREATE INDEX IF NOT EXISTS idx_trending_topics_rank ON public.trending_topics(rank);
CREATE INDEX IF NOT EXISTS idx_trending_topics_engagement ON public.trending_topics(engagement_count DESC);

ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_trending" ON public.trending_topics;
CREATE POLICY "service_role_all_trending"
  ON public.trending_topics FOR ALL USING (true) WITH CHECK (true);
