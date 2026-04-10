-- Performance indexes v2 and schema additions for new features
-- Safe to run multiple times (IF NOT EXISTS / CREATE INDEX IF NOT EXISTS)

-- ── Full-text search on posts ───────────────────────────────────────────────
-- GIN index for fast tsvector searches
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON public.posts USING GIN(search_vector);

-- Function to rebuild search_vector
CREATE OR REPLACE FUNCTION update_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.topic, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(
      LEFT(NEW.content, 10000), ''
    )), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_search_vector ON public.posts;
CREATE TRIGGER trg_posts_search_vector
  BEFORE INSERT OR UPDATE OF title, excerpt, topic, content ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_search_vector();

-- Backfill existing rows
UPDATE public.posts SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(topic, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(LEFT(content, 10000), '')), 'D')
WHERE search_vector IS NULL;

-- ── Content scheduling ──────────────────────────────────────────────────────
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON public.posts(scheduled_for)
  WHERE scheduled_for IS NOT NULL;

-- ── Admin audit log table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    TEXT NOT NULL,
  action      TEXT NOT NULL,                 -- e.g. 'post.approve', 'user.ban', 'comment.delete'
  resource_type TEXT NOT NULL,              -- e.g. 'post', 'user', 'comment'
  resource_id TEXT,                          -- ID of affected resource
  details     JSONB DEFAULT '{}',           -- additional context
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON public.admin_audit_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_resource ON public.admin_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON public.admin_audit_log(action, created_at DESC);

-- ── Processed payments (idempotency) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.processed_payments (
  order_id    TEXT PRIMARY KEY,
  payment_id  TEXT NOT NULL,
  user_id     TEXT,
  amount      INTEGER,                       -- in smallest currency unit (paise)
  currency    TEXT DEFAULT 'INR',
  plan_id     TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_processed_payments_user ON public.processed_payments(user_id, verified_at DESC);

-- ── Additional composite indexes ─────────────────────────────────────────────
-- Comments: by post ordered by time (common display query)
CREATE INDEX IF NOT EXISTS idx_comments_post_approved ON public.comments(post_id, created_at DESC);

-- Posts: approval queue (admin panel)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='approval_status') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_posts_approval_queue ON public.posts(approval_status, created_at DESC) WHERE approval_status = ''pending''';
  END IF;
END $$;

-- Notifications: SSE-friendly (user, newest first, unread)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='notifications') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications(user_id, created_at DESC)';
  END IF;
END $$;

-- User resumes: quick per-user lookup
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='user_resumes') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_resumes_user ON public.user_resumes(user_id, updated_at DESC)';
  END IF;
END $$;

-- Jobs: open positions by created_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='jobs') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON public.jobs(status, created_at DESC) WHERE status = ''open''';
  END IF;
END $$;
