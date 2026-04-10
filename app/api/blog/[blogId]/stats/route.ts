import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/blog/[blogId]/stats
 * Get comprehensive blog statistics: likes, comments, shares, views, engagement rate
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const supabase = await createClient();

    // Call database helper function for all stats
    const result = await supabase.rpc('get_blog_stats', {
      p_blog_id: blogId,
    });

    if (result.error) {
      console.error('Stats error:', result.error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const stats = result.data?.[0] || {
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
      engagement_rate: 0,
    };

    return NextResponse.json({
      likesCount: stats.likes_count || 0,
      commentsCount: stats.comments_count || 0,
      sharesCount: stats.shares_count || 0,
      viewsCount: stats.views_count || 0,
      engagementRate: Math.round((stats.engagement_rate || 0) * 100) / 100,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog stats' },
      { status: 500 }
    );
  }
}
