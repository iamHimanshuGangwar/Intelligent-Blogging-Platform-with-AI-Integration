import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * POST /api/user/[userId]/follow
 * Toggle follow relationship
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const currentUserId = await getAuthUserId(_req);

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if already following
    const { data: existing } = await supabase
      .from('user_followers')
      .select('id')
      .eq('follower_user_id', currentUserId)
      .eq('following_user_id', targetUserId)
      .single();

    let isFollowing = false;

    if (existing) {
      // Unfollow
      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_user_id', currentUserId)
        .eq('following_user_id', targetUserId);

      if (error) {
        console.error('Unfollow error:', error);
        return NextResponse.json(
          { error: 'Failed to unfollow' },
          { status: 500 }
        );
      }
      isFollowing = false;
    } else {
      // Follow
      const { error } = await supabase.from('user_followers').insert([
        {
          follower_user_id: currentUserId,
          following_user_id: targetUserId,
          followed_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Follow error:', error);
        return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
      }
      isFollowing = true;
    }

    // Get updated follower count
    const { count } = await supabase
      .from('user_followers')
      .select('id', { count: 'exact', head: true })
      .eq('following_user_id', targetUserId);

    return NextResponse.json({
      success: true,
      isFollowing,
      followerCount: count || 0,
    });
  } catch (error: any) {
    console.error('Follow toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/[userId]/follow
 * Get follow status and counts
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const currentUserId = await getAuthUserId(_req);
    const supabase = await createClient();

    // Get follower count for target user
    const { count: followerCount } = await supabase
      .from('user_followers')
      .select('id', { count: 'exact', head: true })
      .eq('following_user_id', targetUserId);

    // Get following count for target user
    const { count: followingCount } = await supabase
      .from('user_followers')
      .select('id', { count: 'exact', head: true })
      .eq('follower_user_id', targetUserId);

    // Check if current user is following target user
    let isFollowing = false;
    if (currentUserId) {
      const { data: existing } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_user_id', currentUserId)
        .eq('following_user_id', targetUserId)
        .single();

      isFollowing = !!existing;
    }

    return NextResponse.json({
      followerCount: followerCount || 0,
      followingCount: followingCount || 0,
      isFollowing,
    });
  } catch (error: any) {
    console.error('Get follow status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow status' },
      { status: 500 }
    );
  }
}
