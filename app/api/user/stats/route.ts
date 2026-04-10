import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

// Get user stats (views, followers, engagement)
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = await createClient();

    // Get user's posts stats
    const { data: posts } = await supabase
      .from('posts')
      .select('id, views, likes_count, created_at')
      .eq('author_id', userId);

    const totalPosts = posts?.length ?? 0;
    const totalViews = (posts ?? []).reduce((sum: number, p: any) => sum + (p.views || 0), 0);
    const totalLikes = (posts ?? []).reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0);

    // Get follower count
    const { count: followersCount } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    // Get following count
    const { count: followingCount } = await supabase
      .from('followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100) : 0;

    // Get career progress
    const { data: careerProgress } = await supabase
      .from('user_career_progress')
      .select('*, career_track:career_track_id(name, description, icon)')
      .eq('user_id', userId);

    // Get unread notifications count
    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return NextResponse.json({
      stats: {
        totalPosts,
        totalViews,
        totalLikes,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        engagementRate: Math.round(engagementRate * 100) / 100,
        unreadNotifications: unreadNotifications || 0,
      },
      careerProgress: careerProgress || [],
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
