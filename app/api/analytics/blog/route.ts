import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * GET /api/analytics/blog
 * Get analytics for specific blog post
 * Query params:
 * - blogId: UUID
 * - days: 7 | 30 | 90 | 365 (default: 7)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blogId = req.nextUrl.searchParams.get('blogId');
    const daysParam = req.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 7;

    if (!blogId) {
      return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
    }

    // Validate days parameter
    const validDays = [7, 30, 90, 365];
    if (!validDays.includes(days)) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be 7, 30, 90, or 365' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    // Fetch blog details to verify ownership
    const { data: blog } = await supabase
      .from('blog_drafts')
      .select('id, author_user_id')
      .eq('id', blogId)
      .single();

    // Only allow access to own posts or admin
    if (blog && blog.author_user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot access other users blog analytics' },
        { status: 403 }
      );
    }

    // Fetch blog views in the period
    const { count: viewsCount } = await supabase
      .from('blog_views')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId)
      .gte('created_at', fromDate.toISOString());

    // Fetch blog likes in the period
    const { count: likesCount } = await supabase
      .from('blog_likes')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId)
      .gte('created_at', fromDate.toISOString());

    // Fetch blog comments in the period
    const { count: commentsCount } = await supabase
      .from('blog_comments')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId)
      .gte('created_at', fromDate.toISOString());

    // Fetch blog shares in the period
    const { data: shares } = await supabase
      .from('blog_shares')
      .select('platform')
      .eq('blog_draft_id', blogId)
      .gte('created_at', fromDate.toISOString());

    // Calculate platform breakdown for shares
    const platformBreakdown: Record<string, number> = {
      twitter: 0,
      linkedin: 0,
      facebook: 0,
      email: 0,
      direct: 0,
    };

    shares?.forEach((share) => {
      if (share.platform && share.platform in platformBreakdown) {
        platformBreakdown[share.platform]++;
      }
    });

    const shareCount = shares?.length || 0;
    const totalEngagement =
      (viewsCount || 0) +
      (likesCount || 0) +
      (commentsCount || 0) +
      shareCount;

    return NextResponse.json({
      period: `${days} days`,
      stats: {
        viewsCount: viewsCount || 0,
        likesCount: likesCount || 0,
        commentsCount: commentsCount || 0,
        sharesCount: shareCount,
        totalEngagement,
        engagementRate:
          viewsCount && viewsCount > 0
            ? Math.round(
                (((likesCount || 0) +
                  (commentsCount || 0) +
                  shareCount) /
                  viewsCount) *
                  100
              ) / 100
            : 0,
        platformBreakdown,
      },
    });
  } catch (error: any) {
    console.error('Get blog analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog analytics' },
      { status: 500 }
    );
  }
}
