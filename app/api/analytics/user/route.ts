import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * GET /api/analytics/user
 * Get user analytics with date range filtering
 * Query params:
 * - days: 7 | 30 | 90 | 365 (default: 7)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const daysParam = req.nextUrl.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 7;

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

    // Fetch analytics for the specified period
    const { data: analytics, error } = await supabase
      .from('user_analytics')
      .select(
        `
        date,
        daily_views,
        daily_likes,
        daily_comments,
        daily_shares,
        new_followers,
        engagement_rate
      `
      )
      .eq('user_id', userId)
      .gte('date', fromDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Analytics error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Calculate summary metrics
    const summary = {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalNewFollowers: 0,
      averageEngagementRate: 0,
      dataPoints: analytics?.length || 0,
    };

    if (analytics && analytics.length > 0) {
      analytics.forEach((day: any) => {
        summary.totalViews += day.daily_views || 0;
        summary.totalLikes += day.daily_likes || 0;
        summary.totalComments += day.daily_comments || 0;
        summary.totalShares += day.daily_shares || 0;
        summary.totalNewFollowers += day.new_followers || 0;
        summary.averageEngagementRate +=
          (day.engagement_rate || 0) / analytics.length;
      });

      summary.averageEngagementRate = Math.round(summary.averageEngagementRate * 100) / 100;
    }

    return NextResponse.json({
      period: `${days} days`,
      summary,
      dailyData: analytics || [],
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
