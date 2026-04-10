-- ================================================================
-- 024: Fix user_follows table and ensure guest_email on comments
-- ================================================================

-- 1. Create user_follows table if it doesn't exist (database may have 'followers' instead)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_follows'
  ) THEN
    CREATE TABLE public.user_follows (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      UNIQUE(follower_id, following_id),
      CONSTRAINT user_follows_no_self_follow CHECK (follower_id != following_id)
    );

    -- Copy existing data from followers table if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'followers'
    ) THEN
      INSERT INTO public.user_follows (id, follower_id, following_id, created_at)
      SELECT id, follower_id, following_id, created_at FROM public.followers
      ON CONFLICT DO NOTHING;
    END IF;

    -- Enable RLS
    ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Anyone can view follows" ON public.user_follows
      FOR SELECT USING (true);

    CREATE POLICY "Users can follow others" ON public.user_follows
      FOR INSERT WITH CHECK (auth.uid()::text = follower_id);

    CREATE POLICY "Users can unfollow" ON public.user_follows
      FOR DELETE USING (auth.uid()::text = follower_id);

    CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
    CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
  END IF;
END
$$;

-- 2. Ensure guest_email column exists on comments
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- 3. Ensure guest_name column exists on comments (may also be missing)
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS guest_name TEXT;

-- 4. Add indexes for guest comment lookups
CREATE INDEX IF NOT EXISTS idx_comments_guest_email ON public.comments(guest_email);
