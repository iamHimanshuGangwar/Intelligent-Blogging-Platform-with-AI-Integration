-- Ensure one like per user per post and improve read performance.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'post_likes'
  ) THEN
    DELETE FROM public.post_likes a
    USING public.post_likes b
    WHERE a.ctid < b.ctid
      AND a.post_id = b.post_id
      AND a.user_id = b.user_id;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'post_likes_post_id_user_id_key'
    ) THEN
      ALTER TABLE public.post_likes
      ADD CONSTRAINT post_likes_post_id_user_id_key UNIQUE (post_id, user_id);
    END IF;

    CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
    CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'comments'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON public.comments(post_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_community_post_id_created_at ON public.comments(community_post_id, created_at DESC);
  END IF;
END $$;
