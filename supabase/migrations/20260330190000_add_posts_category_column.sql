-- Ensure posts.category exists for category filtering and ranking.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'posts'
      AND column_name = 'category'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN category TEXT;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- Optional lightweight backfill from topic when category is empty.
UPDATE public.posts
SET category = CASE
  WHEN topic ILIKE '%quantum%' OR topic ILIKE '%research%' THEN 'Research'
  WHEN topic ILIKE '%ai%' OR topic ILIKE '%machine learning%' THEN 'AI'
  WHEN topic ILIKE '%career%' OR topic ILIKE '%job%' THEN 'Career'
  ELSE 'General'
END
WHERE (category IS NULL OR btrim(category) = '')
  AND topic IS NOT NULL
  AND btrim(topic) <> '';
