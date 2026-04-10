-- Archive feature for user blog drafts
-- Allows users to archive their blogs instead of deleting them

CREATE TABLE IF NOT EXISTS blog_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_draft_id UUID NOT NULL REFERENCES blog_drafts(id) ON DELETE CASCADE,
  archived_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archive_reason TEXT,
  is_archived BOOLEAN DEFAULT TRUE,
  restored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add archive status to blog_drafts if not exists
ALTER TABLE blog_drafts
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- RLS Policies for blog_archives
ALTER TABLE blog_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own archives"
  ON blog_archives
  FOR SELECT
  USING (archived_by = auth.uid());

CREATE POLICY "Users can create archives for their own posts"
  ON blog_archives
  FOR INSERT
  WITH CHECK (
    archived_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM blog_drafts
      WHERE id = blog_draft_id
      AND author_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can unarchive their own blogs"
  ON blog_archives
  FOR UPDATE
  USING (archived_by = auth.uid());

CREATE POLICY "Admins can view all archives"
  ON blog_archives
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Helper function to archive a blog
CREATE OR REPLACE FUNCTION archive_blog(
  p_blog_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if blog exists and user is owner
  IF NOT EXISTS (
    SELECT 1 FROM blog_drafts
    WHERE id = p_blog_id AND author_user_id = v_user_id
  ) THEN
    RETURN QUERY SELECT FALSE, 'Blog not found or insufficient permissions';
    RETURN;
  END IF;
  
  -- Archive the blog
  UPDATE blog_drafts SET
    is_archived = TRUE,
    archived_at = NOW(),
    updated_at = NOW()
  WHERE id = p_blog_id;
  
  -- Create archive record
  INSERT INTO blog_archives (blog_draft_id, archived_by, archive_reason)
  VALUES (p_blog_id, v_user_id, p_reason);
  
  RETURN QUERY SELECT TRUE, 'Blog archived successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to restore a blog
CREATE OR REPLACE FUNCTION restore_blog(p_blog_id UUID)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if blog exists and user is owner
  IF NOT EXISTS (
    SELECT 1 FROM blog_drafts
    WHERE id = p_blog_id AND author_user_id = v_user_id
  ) THEN
    RETURN QUERY SELECT FALSE, 'Blog not found or insufficient permissions';
    RETURN;
  END IF;
  
  -- Restore the blog
  UPDATE blog_drafts SET
    is_archived = FALSE,
    archived_at = NULL,
    updated_at = NOW()
  WHERE id = p_blog_id;
  
  -- Update archive record
  UPDATE blog_archives SET
    is_archived = FALSE,
    restored_at = NOW()
  WHERE blog_draft_id = p_blog_id AND restored_at IS NULL;
  
  RETURN QUERY SELECT TRUE, 'Blog restored successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get archived blogs
CREATE OR REPLACE FUNCTION get_archived_blogs()
RETURNS TABLE(
  id UUID,
  title TEXT,
  brief TEXT,
  archived_at TIMESTAMP WITH TIME ZONE,
  archive_reason TEXT,
  is_archived BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bd.id,
    bd.title,
    bd.brief,
    bd.archived_at,
    ba.archive_reason,
    bd.is_archived
  FROM blog_drafts bd
  LEFT JOIN blog_archives ba ON ba.blog_draft_id = bd.id
  WHERE bd.author_user_id = auth.uid()
  AND bd.is_archived = TRUE
  ORDER BY bd.archived_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_blog_archives_user ON blog_archives(archived_by);
CREATE INDEX IF NOT EXISTS idx_blog_archives_blog ON blog_archives(blog_draft_id);
CREATE INDEX IF NOT EXISTS idx_blog_drafts_archived ON blog_drafts(author_user_id, is_archived);
