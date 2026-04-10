-- Fix notification type constraint to include all types used by the application
-- The original CHECK constraint didn't include 'system', 'follow_request', or 'collab_invite'

-- Drop existing constraint and add updated one
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'follow', 'like', 'comment', 'share', 'mention',
    'post_approved', 'post_rejected', 'post_featured',
    'system', 'follow_request', 'collab_invite',
    'career_milestone'
  ));

-- Add missing columns if they don't exist (from migration 002 → 019 gap)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS group_key TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_comment_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS icon TEXT;

-- Fix user_id type: profiles.id is TEXT (Clerk IDs), notifications.user_id must match
-- Change user_id from UUID to TEXT to support Clerk user IDs
ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE notifications ALTER COLUMN related_user_id TYPE TEXT USING related_user_id::TEXT;

-- Drop FK constraints that reference auth.users (wrong table)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_related_user_id_fkey;

-- Re-add FK constraints pointing to profiles(id)
-- Using DO block to avoid error if constraint already exists
DO $$ BEGIN
  ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE notifications ADD CONSTRAINT notifications_related_user_id_fkey
    FOREIGN KEY (related_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Make message nullable (not all notification types need a message body)
ALTER TABLE notifications ALTER COLUMN message DROP NOT NULL;
