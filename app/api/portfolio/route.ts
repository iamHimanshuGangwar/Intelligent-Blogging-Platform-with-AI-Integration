import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const queryUserId = request.nextUrl.searchParams.get('userId');
    const authUserId = await getAuthUserId(request);
    const targetUserId = queryUserId || authUserId;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [{ data: profile }, { data: posts }, { data: comments }] = await Promise.all([
      supabase.from('profiles').select('id,name,email,bio,avatar_url,website').eq('id', targetUserId).single(),
      supabase
        .from('posts')
        .select('id,title,slug,topic,excerpt,views,likes_count,status,created_at')
        .eq('author_id', targetUserId)
        .order('created_at', { ascending: false })
        .limit(120),
      supabase.from('comments').select('id').eq('user_id', targetUserId),
    ]);

    const allPosts = posts || [];
    const published = allPosts.filter((p: any) => p.status === 'published');
    const totalViews = published.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
    const totalLikes = published.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0);

    const milestones = [
      {
        id: 'first_post',
        label: 'First Post Published',
        achieved: published.length >= 1,
      },
      {
        id: 'ten_posts',
        label: 'Published 10 Posts',
        achieved: published.length >= 10,
      },
      {
        id: 'thousand_views',
        label: 'Reached 1,000 Total Views',
        achieved: totalViews >= 1000,
      },
      {
        id: 'hundred_likes',
        label: 'Received 100 Total Likes',
        achieved: totalLikes >= 100,
      },
      {
        id: 'community_voice',
        label: 'Posted 20+ Community Comments',
        achieved: (comments || []).length >= 20,
      },
    ];

    return NextResponse.json({
      profile: profile || null,
      metrics: {
        totalPosts: allPosts.length,
        publishedPosts: published.length,
        totalViews,
        totalLikes,
        totalComments: (comments || []).length,
      },
      milestones,
      topPosts: published
        .slice()
        .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
        .slice(0, 6),
      recentPosts: allPosts.slice(0, 8),
    });
  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json({ error: 'Failed to load portfolio data' }, { status: 500 });
  }
}
