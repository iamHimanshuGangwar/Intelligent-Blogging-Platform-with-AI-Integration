import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/trending-topics
 * Get trending topics with optional filters
 * Query params:
 * - limit: number (default: 10)
 * - offset: number (default: 0)
 * - timeRange: day | week | month (default: week)
 */
export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get('limit') || '10'),
      50
    );
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const timeRange = req.nextUrl.searchParams.get('timeRange') || 'week';

    // Validate timeRange
    const validRanges = ['day', 'week', 'month'];
    if (!validRanges.includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid timeRange. Must be day, week, or month' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Calculate date based on time range
    const fromDate = new Date();
    if (timeRange === 'day') {
      fromDate.setDate(fromDate.getDate() - 1);
    } else if (timeRange === 'week') {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (timeRange === 'month') {
      fromDate.setDate(fromDate.getDate() - 30);
    }

    // Fetch trending topics
    const { data: topics, error, count } = await supabase
      .from('trending_topics')
      .select('*', { count: 'exact' })
      .gte('updated_at', fromDate.toISOString())
      .order('engagement_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Trending topics error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trending topics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      timeRange,
      total: count || 0,
      limit,
      offset,
      topics: topics || [],
    });
  } catch (error: any) {
    console.error('Get trending topics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending topics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trending-topics
 * Force refresh trending topics calculation (admin only)
 */
export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();

    // Call the RPC function to calculate trending topics
    const { data, error } = await supabase.rpc(
      'calculate_trending_topics'
    );

    if (error) {
      console.error('Calculate trending error:', error);
      return NextResponse.json(
        { error: 'Failed to calculate trending topics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Trending topics recalculated',
      result: data,
    });
  } catch (error: any) {
    console.error('Calculate trending error:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate trending topics' },
      { status: 500 }
    );
  }
}
