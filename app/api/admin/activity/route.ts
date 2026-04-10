import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

async function verifyAdmin(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.role === 'admin') return userId;
    }
  } catch {
    // continue to cookie fallback
  }

  const adminEmail = verifyAdminSessionCookie(request);
  if (adminEmail) return adminEmail;

  try {
    const supabase = await createClient();
    const otpToken = request.cookies.get('otp_session_token')?.value;
    if (!otpToken) return null;

    const { data: session } = await supabase
      .from('otp_sessions')
      .select('user_id, expires_at, is_active')
      .eq('session_token', otpToken)
      .maybeSingle();

    if (!session || !session.is_active || new Date(session.expires_at) <= new Date()) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user_id)
      .maybeSingle();

    return profile?.role === 'admin' ? session.user_id : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminUserId = await verifyAdmin(request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50', 10), 200);
    const type = request.nextUrl.searchParams.get('type');

    let query = supabase
      .from('user_activity_logs')
      .select('id, user_id, activity_type, entity_type, entity_id, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('activity_type', type);
    }

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json({
        activities: [],
        totals: {},
        warning: error.message,
      });
    }

    const userIds = [...new Set((logs || []).map((log) => log.user_id).filter(Boolean))] as string[];
    const profileMap = new Map<string, { id: string; name: string | null; email: string | null }>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      for (const profile of profiles || []) {
        profileMap.set(profile.id, profile);
      }
    }

    const totals: Record<string, number> = {};
    for (const log of logs || []) {
      totals[log.activity_type] = (totals[log.activity_type] || 0) + 1;
    }

    return NextResponse.json({
      activities: (logs || []).map((log) => ({
        ...log,
        user: log.user_id ? profileMap.get(log.user_id) || null : null,
      })),
      totals,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
