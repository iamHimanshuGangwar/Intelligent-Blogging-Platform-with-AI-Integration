-- Schema hardening migration for production compatibility
-- Ensures critical tables/columns required by API routes exist and use TEXT user IDs.

-- -----------------------------------------------------------------------------
-- 1) Resume storage compatibility (Clerk IDs are TEXT)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_resumes'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'user_resumes'
        AND column_name = 'user_id'
        AND data_type = 'uuid'
    ) THEN
      BEGIN
        ALTER TABLE public.user_resumes DROP CONSTRAINT IF EXISTS user_resumes_user_id_fkey;
      EXCEPTION WHEN undefined_object THEN
        NULL;
      END;

      ALTER TABLE public.user_resumes
        ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
    END IF;

    BEGIN
      ALTER TABLE public.user_resumes
        ADD CONSTRAINT user_resumes_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  ELSE
    CREATE TABLE public.user_resumes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
      resume_data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id)
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_resumes_user_id ON public.user_resumes(user_id);

CREATE OR REPLACE FUNCTION public.update_user_resume_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_resume_updated_at ON public.user_resumes;
CREATE TRIGGER trigger_update_user_resume_updated_at
  BEFORE UPDATE ON public.user_resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_resume_updated_at();

ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Users can view their own resumes"
    ON public.user_resumes FOR SELECT
    USING (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can insert their own resumes"
    ON public.user_resumes FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can update their own resumes"
    ON public.user_resumes FOR UPDATE
    USING (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete their own resumes"
    ON public.user_resumes FOR DELETE
    USING (auth.uid()::text = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- 2) Subscriptions compatibility for /api/subscriptions and /api/purchasing
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_annual NUMERIC(10, 2) NOT NULL DEFAULT 0,
  features TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price_monthly ON public.subscription_plans(price_monthly);

-- Seed plans if missing
INSERT INTO public.subscription_plans (name, description, price_monthly, price_annual, features)
SELECT * FROM (
  VALUES
    ('Contributor', 'Perfect for starting the digital narrative', 0, 0, ARRAY['Basic AI assistance', '3 posts per month', 'Community access']::TEXT[]),
    ('Professional', 'For serious writers building a lasting brand', 29, 261, ARRAY['Advanced AI editing tools', 'Unlimited monthly posts', 'Career tracking insights', 'Real-time analytics dashboard']::TEXT[]),
    ('Elite', 'The ultimate ecosystem for industry authorities', 89, 801, ARRAY['Priority AI generation queue', 'Custom SEO strategy engine', '1-1 mentor sessions', 'Full API developer access']::TEXT[])
) AS seed(name, description, price_monthly, price_annual, features)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.subscription_plans p
  WHERE p.name = seed.name
);

-- -----------------------------------------------------------------------------
-- 3) Post and review compatibility
-- -----------------------------------------------------------------------------
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS blog_theme TEXT DEFAULT 'default';

ALTER TABLE public.post_reviews
  ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_post_reviews_post_id ON public.post_reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_created_at ON public.post_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_reviews_is_approved ON public.post_reviews(is_approved);
