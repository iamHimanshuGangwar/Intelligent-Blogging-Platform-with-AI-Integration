-- Reviews and likes compatibility migration
-- Ensures post_reviews has is_approved column and indexes are present

-- Add is_approved column if missing (with default true so existing reviews are visible)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'post_reviews'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'post_reviews'
        AND column_name = 'is_approved'
    ) THEN
      ALTER TABLE public.post_reviews ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT true;
    END IF;
  END IF;
END $$;

-- Ensure post_likes table exists (some environments only have 'likes')
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Sync likes_count on posts from actual like rows
UPDATE public.posts p
SET likes_count = sub.cnt
FROM (
  SELECT post_id, COUNT(*) as cnt
  FROM public.post_likes
  GROUP BY post_id
) sub
WHERE p.id = sub.post_id AND (p.likes_count IS NULL OR p.likes_count != sub.cnt);
