-- 017_blog_approval_system.sql
-- Add blog post approval/publishing workflow

-- Add approval-related columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- Ensure status and approval_status are aligned when publishing
CREATE OR REPLACE FUNCTION sync_post_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is set to 'published', mark as approved
  IF NEW.status = 'published' AND NEW.approval_status = 'pending' THEN
    NEW.approval_status := 'approved';
    NEW.approved_at := NOW();
  END IF;
  
  -- If rejected, set status to draft
  IF NEW.approval_status = 'rejected' THEN
    NEW.status := 'draft';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_post_approval_trigger ON posts;
CREATE TRIGGER sync_post_approval_trigger
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION sync_post_approval();

-- Create posts_pending_approval view for admin dashboard
CREATE OR REPLACE VIEW posts_pending_approval AS
SELECT 
  p.id,
  p.title,
  p.excerpt,
  p.author_id,
  pr.name as author_name,
  pr.avatar_url as author_avatar,
  p.created_at,
  p.approval_status,
  p.approved_at,
  p.approved_by
FROM posts p
LEFT JOIN profiles pr ON p.author_id = pr.id
WHERE p.approval_status = 'pending'
ORDER BY p.created_at DESC;

-- RPC to approve a post
CREATE OR REPLACE FUNCTION approve_post(
  p_post_id UUID,
  p_approved_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  UPDATE posts 
  SET 
    approval_status = 'approved',
    approved_by = p_approved_by,
    approved_at = NOW(),
    status = 'published'
  WHERE id = p_post_id;
  
  RETURN QUERY SELECT 
    true,
    'Post approved successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to reject a post
CREATE OR REPLACE FUNCTION reject_post(
  p_post_id UUID,
  p_approved_by UUID
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  UPDATE posts 
  SET 
    approval_status = 'rejected',
    approved_by = p_approved_by,
    approved_at = NOW(),
    status = 'draft'
  WHERE id = p_post_id;
  
  RETURN QUERY SELECT 
    true,
    'Post rejected and moved to draft'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_posts_approval_status ON posts(approval_status);
CREATE INDEX IF NOT EXISTS idx_posts_approved_by ON posts(approved_by);
