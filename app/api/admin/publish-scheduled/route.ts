/**
 * Content scheduling publisher.
 * Call this endpoint via a cron job (e.g., Vercel Cron at /api/cron/publish-scheduled)
 * or trigger it manually from the admin panel.
 *
 * It finds all posts with:
 *   status = 'scheduled'  AND  scheduled_for <= NOW()
 * and promotes them to status = 'published', approval_status = 'approved'.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

/** Verify request is from cron scheduler or admin session */
function isAuthorized(request: NextRequest): boolean {
  // Vercel Cron sends this header automatically
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret && cronSecret === process.env.CRON_SECRET) return true;

  // Admin session cookie fallback (HMAC-verified)
  return verifyAdminSessionCookie(request) !== null;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Find all scheduled posts whose time has arrived
    const { data: due, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, author_id')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!due || due.length === 0) {
      return NextResponse.json({ published: 0, message: 'No scheduled posts due.' });
    }

    const ids = due.map((p) => p.id);

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        approval_status: 'approved',
        published_at: now,
      })
      .in('id', ids);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      published: ids.length,
      postIds: ids,
      message: `Published ${ids.length} scheduled post(s).`,
    });
  } catch (err) {
    console.error('[publish-scheduled] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: preview which posts are due without publishing them
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('posts')
    .select('id, title, scheduled_for, author_id')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ due: data ?? [], count: data?.length ?? 0 });
}
