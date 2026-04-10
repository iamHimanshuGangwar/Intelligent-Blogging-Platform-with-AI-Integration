-- Fix critical schema issues found during audit
-- 1. posts.approved_by: UUID → TEXT (Clerk IDs are text)
-- 2. comments.approved_by: UUID → TEXT
-- 3. Ensure notification types include job_application
-- 4. Ensure blog_comments works with blog_draft_id

-- Fix posts.approved_by type
DO $$
BEGIN
  -- Drop FK constraint if exists (referencing auth.users)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'posts' AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%approved_by%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE posts DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'posts' AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%approved_by%'
      LIMIT 1
    );
  END IF;

  -- Change column type if it's UUID
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'approved_by' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE posts ALTER COLUMN approved_by TYPE TEXT USING approved_by::TEXT;
  END IF;
END $$;

-- Fix comments.approved_by type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'comments' AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%approved_by%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE comments DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'comments' AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%approved_by%'
      LIMIT 1
    );
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'comments' AND column_name = 'approved_by' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE comments ALTER COLUMN approved_by TYPE TEXT USING approved_by::TEXT;
  END IF;
END $$;

-- Ensure blog_comments has blog_draft_id column (API uses this)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'blog_comments') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'blog_comments' AND column_name = 'blog_draft_id'
    ) THEN
      ALTER TABLE blog_comments ADD COLUMN blog_draft_id TEXT;
    END IF;
  END IF;
END $$;

-- Ensure notifications type CHECK includes job_application
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'notifications_type_check'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
    ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
      type IN (
        'follow', 'like', 'comment', 'share', 'mention',
        'post_approved', 'post_rejected', 'post_featured',
        'system', 'follow_request', 'collab_invite',
        'career_milestone', 'job_application'
      )
    );
  END IF;
END $$;
