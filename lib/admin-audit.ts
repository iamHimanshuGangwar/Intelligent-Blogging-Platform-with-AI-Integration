/**
 * Admin audit logging.
 * Writes to the `admin_audit_log` table (created in migration 20260404110000).
 * All writes are fire-and-forget — audit failures never block the main operation.
 */

import { createClient } from '@/utils/supabase/server';

export type AdminAction =
  | 'post.approve'
  | 'post.reject'
  | 'post.delete'
  | 'post.feature'
  | 'post.unfeature'
  | 'post.duplicate'
  | 'post.schedule'
  | 'comment.approve'
  | 'comment.reject'
  | 'comment.delete'
  | 'user.ban'
  | 'user.unban'
  | 'user.role_change'
  | 'user.delete'
  | 'resume.view'
  | 'job.create'
  | 'job.delete'
  | 'job.approve'
  | 'newsletter.send'
  | 'settings.update'
  | 'payment.refund';

export interface AuditLogEntry {
  adminId: string;
  action: AdminAction;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an admin action. Never throws — audit failures are silent.
 */
export async function logAdminAction(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from('admin_audit_log').insert({
      admin_id: entry.adminId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId ?? null,
      details: entry.details ?? {},
      ip_address: entry.ipAddress ?? null,
    });
  } catch (err) {
    // Audit failures should never surface to users
    console.error('[AuditLog] Failed to write audit entry:', err);
  }
}

/**
 * Fetch admin audit log entries (paginated).
 * Returns entries in reverse-chronological order.
 */
export async function getAdminAuditLog(options?: {
  adminId?: string;
  action?: AdminAction;
  resourceType?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();
  const { adminId, action, resourceType, limit = 50, offset = 0 } = options ?? {};

  let query = supabase
    .from('admin_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (adminId) query = query.eq('admin_id', adminId);
  if (action) query = query.eq('action', action);
  if (resourceType) query = query.eq('resource_type', resourceType);

  const { data, error, count } = await query;
  if (error) throw error;
  return { entries: data ?? [], total: count ?? 0 };
}
