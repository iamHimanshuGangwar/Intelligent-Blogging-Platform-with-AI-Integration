-- Add is_approved column to post_reviews for admin moderation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_reviews' AND column_name = 'is_approved'
  ) THEN
    ALTER TABLE post_reviews ADD COLUMN is_approved BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_reviews' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE post_reviews ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'post_reviews' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE post_reviews ADD COLUMN approved_by TEXT;
  END IF;
END $$;
