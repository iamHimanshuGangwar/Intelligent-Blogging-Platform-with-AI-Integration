import { createClient } from '@/utils/supabase/server';

export type ActivityType =
  | 'post_created'
  | 'post_updated'
  | 'post_deleted'
  | 'post_liked'
  | 'post_unliked'
  | 'comment_created'
  | 'admin_post_deleted'
  | 'admin_action'
  | 'user_signup'
  | 'user_signin'
  | 'user_signout'
  | 'otp_signin'
  | 'admin_login';

export async function logActivity(params: {
  userId?: string | null;
  activityType: ActivityType;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    await supabase.from('user_activity_logs').insert({
      user_id: params.userId || null,
      activity_type: params.activityType,
      entity_type: params.entityType || null,
      entity_id: params.entityId || null,
      metadata: params.metadata || {},
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Activity logging failed:', error);
  }
}
