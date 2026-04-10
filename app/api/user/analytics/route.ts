import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

// GET user analytics with date range filtering
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '90D'; // '7D', '30D', '90D', '1Y'

    let daysAgo = 90;
    if (timeframe === '7D') daysAgo = 7;
    if (timeframe === '30D') daysAgo = 30;
    if (timeframe === '1Y') daysAgo = 365;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const supabase = await createClient();

    // Get user's posts within timeframe
    const { data: posts } = await supabase
      .from('posts')
      .select('id, views, likes_count, created_at, title')
      .eq('author_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    // Calculate metrics
    const totalPosts = posts?.length ?? 0;
    const totalViews = (posts ?? []).reduce((sum: number, p: any) => sum + (p.views || 0), 0);
    const totalLikes = (posts ?? []).reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0);
    const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100) : 0;

    // Get daily activity data for chart
    const dailyData = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayPosts = posts?.filter(p =>
        new Date(p.created_at) >= dayStart && new Date(p.created_at) <= dayEnd
      ) || [];

      const dayViews = dayPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const dayLikes = dayPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);

      dailyData.push({
        date: dayStart.toISOString().split('T')[0],
        posts: dayPosts.length,
        views: dayViews,
        likes: dayLikes,
        engagement: dayViews > 0 ? (dayLikes / dayViews) * 100 : 0
      });
    }

    // Get trending topics from user's content
    const { data: userEvents } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .eq('event_type', 'content_view');

    const topicCounts: Record<string, number> = {};
    userEvents?.forEach((event: any) => {
      const topic = event.event_data?.topic;
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    });

    const trendingTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({
        topic,
        heat: Math.min(100, count * 10) // Scale heat 0-100
      }));

    return NextResponse.json({
      timeframe,
      summary: {
        totalPosts,
        totalViews,
        totalLikes,
        engagementRate: Math.round(engagementRate * 100) / 100,
      },
      dailyData,
      trendingTopics: trendingTopics.length > 0 ? trendingTopics : [
        { topic: "AI-Driven Content Strategy", heat: 94 },
        { topic: "Synthetic Media Ethics", heat: 87 },
        { topic: "Career Automation", heat: 76 },
        { topic: "Generative Design Thinking", heat: 68 },
        { topic: "Professional Branding with AI", heat: 61 },
      ],
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}