import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.role === 'admin') return true;
    }
  } catch {
    // continue fallback
  }

  if (verifyAdminSessionCookie(request)) return true;

  try {
    const otpToken = request.cookies.get('otp_session_token')?.value;
    if (!otpToken) return false;

    const supabase = await createClient();
    const { data: session } = await supabase
      .from('otp_sessions')
      .select('user_id, expires_at, is_active')
      .eq('session_token', otpToken)
      .maybeSingle();

    if (!session || !session.is_active || new Date(session.expires_at) <= new Date()) {
      return false;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user_id)
      .maybeSingle();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

function isMissingSchema(error: any): boolean {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('does not exist') || message.includes('could not find') || message.includes('relation');
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, author_id, views, likes_count, approval_status, status, created_at');

    if (postsError && !isMissingSchema(postsError)) {
      return NextResponse.json({ error: postsError.message }, { status: 400 });
    }

    const postList = posts || [];

    const pendingPosts = postList.filter((p: any) => p.approval_status === 'pending').length;

    const byViewsDesc = [...postList].sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
    const byViewsAsc = [...postList].sort((a: any, b: any) => (a.views || 0) - (b.views || 0));
    const byLikesDesc = [...postList].sort((a: any, b: any) => (b.likes_count || 0) - (a.likes_count || 0));

    const mostViewedPost = byViewsDesc[0] || null;
    const leastViewedPost = byViewsAsc[0] || null;
    const mostLikedPost = byLikesDesc[0] || null;

    let pendingComments = 0;
    try {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false);
      pendingComments = count || 0;
    } catch {
      pendingComments = 0;
    }

    const authorIds = [...new Set(postList.map((p: any) => p.author_id).filter(Boolean))] as string[];

    const followerCountByAuthor = new Map<string, number>();
    try {
      if (authorIds.length > 0) {
        const { data: follows } = await supabase
          .from('user_follows')
          .select('following_id')
          .in('following_id', authorIds);

        for (const row of follows || []) {
          if (!row.following_id) continue;
          followerCountByAuthor.set(
            row.following_id,
            (followerCountByAuthor.get(row.following_id) || 0) + 1
          );
        }
      }
    } catch {
      // optional table may not exist
    }

    const { data: profiles } = authorIds.length
      ? await supabase.from('profiles').select('id, name, avatar_url').in('id', authorIds)
      : { data: [] as any[] };

    const profileMap = new Map<string, { id: string; name: string | null; avatar_url: string | null }>();
    for (const profile of profiles || []) {
      profileMap.set(profile.id, profile);
    }

    const topAuthorsByFollowers = authorIds
      .map((id) => ({
        id,
        followers: followerCountByAuthor.get(id) || 0,
        name: profileMap.get(id)?.name || 'Unknown',
        avatar_url: profileMap.get(id)?.avatar_url || null,
      }))
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 5);

    return NextResponse.json({
      pendingPosts,
      pendingComments,
      mostViewedPost,
      leastViewedPost,
      mostLikedPost,
      topAuthorsByFollowers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
