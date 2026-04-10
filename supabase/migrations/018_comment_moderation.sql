-- 018_comment_moderation.sql
-- Add comment moderation workflow

-- Add moderation columns to comments table
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS flagged_as_spam BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_reason TEXT;

-- Create comments_pending_approval view for admin dashboard
CREATE OR REPLACE VIEW comments_pending_approval AS
SELECT 
  c.id,
  c.content,
  c.user_id,
  c.guest_name,
  c.guest_email,
  COALESCE(pr.name, c.guest_name, 'Anonymous') as author_name,
  pr.avatar_url as author_avatar,
  p.id as post_id,
  p.title as post_title,
  c.post_id,
  c.community_post_id,
  c.created_at,
  c.is_approved,
  c.flagged_as_spam
FROM comments c
LEFT JOIN profiles pr ON c.user_id = pr.id
LEFT JOIN posts p ON c.post_id = p.id
WHERE c.is_approved = false OR c.flagged_as_spam = true
ORDER BY c.created_at DESC;

-- RPC to approve a comment
CREATE OR REPLACE FUNCTION approve_comment(
  p_comment_id UUID,
  p_approved_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  UPDATE comments 
  SET 
    is_approved = true,
    approved_by = p_approved_by,
    approved_at = NOW(),
    flagged_as_spam = false
  WHERE id = p_comment_id;
  
  RETURN QUERY SELECT 
    true,
    'Comment approved successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to reject/delete a comment
CREATE OR REPLACE FUNCTION reject_comment(
  p_comment_id UUID,
  p_approved_by UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  DELETE FROM comments 
  WHERE id = p_comment_id;
  
  RETURN QUERY SELECT 
    true,
    'Comment rejected and deleted'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to flag a comment as spam
CREATE OR REPLACE FUNCTION flag_comment_as_spam(
  p_comment_id UUID,
  p_reason TEXT DEFAULT 'User report'
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  UPDATE comments 
  SET 
    flagged_as_spam = true,
    flag_reason = p_reason
  WHERE id = p_comment_id;
  
  RETURN QUERY SELECT 
    true,
    'Comment flagged for review'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-hide comments with multiple spam flags
CREATE OR REPLACE FUNCTION check_spam_threshold()
RETURNS TRIGGER AS $$
BEGIN
  -- If a comment has been flagged, mark as not approved automatically
  IF NEW.flagged_as_spam = true THEN
    NEW.is_approved := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_spam_threshold_trigger ON comments;
CREATE TRIGGER check_spam_threshold_trigger
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION check_spam_threshold();

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_comments_is_approved ON comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_comments_flagged_as_spam ON comments(flagged_as_spam);
CREATE INDEX IF NOT EXISTS idx_comments_approved_by ON comments(approved_by);
