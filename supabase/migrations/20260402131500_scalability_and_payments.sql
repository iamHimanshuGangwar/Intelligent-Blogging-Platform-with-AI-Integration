-- Scalability and payment schema enhancements
-- Goal: strengthen 10k users/day readiness with indexes and payment metadata.

-- -----------------------------------------------------------------------------
-- 1) Payment metadata for subscriptions
-- -----------------------------------------------------------------------------
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS payment_provider TEXT,
  ADD COLUMN IF NOT EXISTS payment_order_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_transaction_id TEXT;

-- payment_method exists in some environments; add if missing
ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_provider ON public.user_subscriptions(payment_provider);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_order_id ON public.user_subscriptions(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_txn_id ON public.user_subscriptions(payment_transaction_id);

-- -----------------------------------------------------------------------------
-- 2) Ensure required tables exist before creating indexes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_by TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL DEFAULT 'editor' CHECK (permission IN ('editor', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.follow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- Collaboration/follow/query hot path indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_post_collaborators_post_status ON public.post_collaborators(post_id, status);
CREATE INDEX IF NOT EXISTS idx_post_collaborators_user_status ON public.post_collaborators(user_id, status);
CREATE INDEX IF NOT EXISTS idx_post_collaborators_invited_by ON public.post_collaborators(invited_by);

CREATE INDEX IF NOT EXISTS idx_follow_requests_to_status_created ON public.follow_requests(to_user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follow_requests_from_status_created ON public.follow_requests(from_user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, is_read, created_at DESC);

-- -----------------------------------------------------------------------------
-- 3) Ensure approval_status column exists on posts
-- -----------------------------------------------------------------------------
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';

-- Blog reading/query path indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_posts_status_approval_created ON public.posts(status, approval_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_status_created ON public.posts(author_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug_status ON public.posts(slug, status);

-- Ensure topic/category columns exist before indexing
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS category TEXT;

CREATE INDEX IF NOT EXISTS idx_posts_topic_created ON public.posts(topic, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_created ON public.posts(category, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post_created ON public.comments(post_id, created_at DESC);

-- post_likes table may not exist yet (created in 20260402150000); create it here to be safe
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post_created ON public.post_likes(post_id, created_at DESC);
