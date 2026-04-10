-- 019_notifications.sql
-- Create comprehensive notifications system

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User who receives the notification
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type of notification
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'share', 'mention', 'post_approved', 'post_rejected', 'post_featured')),
  
  -- Related entities (optional, depending on type)
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- Who performed the action
  related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  related_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT,  -- Material symbol icon name
  
  -- Action URL (where to navigate when clicked)
  action_url TEXT,
  
  -- Metadata
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- For potential deduplication (e.g., multiple likes on same post)
  group_key TEXT
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_related_post ON notifications(related_post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_related_user ON notifications(related_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_group_key ON notifications(group_key);

-- RPC to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_user_id UUID DEFAULT NULL,
  p_related_post_id UUID DEFAULT NULL,
  p_related_comment_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT NULL,
  p_group_key TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, message, related_user_id, 
    related_post_id, related_comment_id, action_url, icon, group_key
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_related_user_id,
    p_related_post_id, p_related_comment_id, p_action_url, p_icon, p_group_key
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET 
    is_read = true,
    read_at = NOW()
  WHERE id = p_notification_id AND is_read = false;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications 
  SET 
    is_read = true,
    read_at = NOW()
  WHERE user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count 
  FROM notifications 
  WHERE user_id = p_user_id AND is_read = false;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to delete a notification
CREATE OR REPLACE FUNCTION delete_notification(
  p_notification_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM notifications 
  WHERE id = p_notification_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to delete old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when someone follows a user
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.followed THEN
    PERFORM create_notification(
      p_user_id := NEW.follower_id,
      p_type := 'follow',
      p_title := 'New Follower',
      p_message := 'Someone started following you',
      p_related_user_id := NEW.follower_id,
      p_action_url := '/profile/' || NEW.follower_id,
      p_icon := 'person_add'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when a post is approved
CREATE OR REPLACE FUNCTION notify_on_post_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    IF NEW.approval_status = 'approved' THEN
      PERFORM create_notification(
        p_user_id := NEW.author_id,
        p_type := 'post_approved',
        p_title := 'Post Approved',
        p_message := 'Your blog post "' || NEW.title || '" has been approved and published!',
        p_related_post_id := NEW.id,
        p_action_url := '/blog/' || NEW.slug,
        p_icon := 'check_circle'
      );
    ELSIF NEW.approval_status = 'rejected' THEN
      PERFORM create_notification(
        p_user_id := NEW.author_id,
        p_type := 'post_rejected',
        p_title := 'Post Needs Review',
        p_message := 'Your blog post "' || NEW.title || '" needs review. Please check the guidelines.',
        p_related_post_id := NEW.id,
        p_action_url := '/dashboard/posts',
        p_icon := 'info'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS notify_on_post_approved_trigger ON posts;
DROP TRIGGER IF EXISTS notify_on_follow_trigger ON follows;

-- Create triggers
CREATE TRIGGER notify_on_post_approved_trigger
AFTER UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION notify_on_post_approved();

-- View for recent notifications
CREATE OR REPLACE VIEW recent_notifications AS
SELECT 
  n.*,
  COALESCE(p.name, 'System') as related_user_name,
  COALESCE(p.avatar_url, '') as related_user_avatar
FROM notifications n
LEFT JOIN profiles p ON n.related_user_id = p.id
ORDER BY n.created_at DESC;

-- View for unread notifications by user
CREATE OR REPLACE VIEW user_unread_notifications AS
SELECT 
  n.*,
  COALESCE(p.name, 'System') as related_user_name,
  COALESCE(p.avatar_url, '') as related_user_avatar
FROM notifications n
LEFT JOIN profiles p ON n.related_user_id = p.id
WHERE n.is_read = false
ORDER BY n.created_at DESC;
