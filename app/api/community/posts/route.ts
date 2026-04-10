import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * GET /api/community/posts
 * Get published blog posts from the community
 * Query params:
 * - limit: number (default: 20)
 * - offset: number (default: 0)
 * - sortBy: published_at | likes | engagement (default: published_at)
 * - tags: comma-separated string
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get('limit') || '20'),
      100
    );
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const sortBy = req.nextUrl.searchParams.get('sortBy') || 'published_at';
    const tagsParam = req.nextUrl.searchParams.get('tags');

    const supabase = await createClient();

    let query = supabase
      .from('blog_drafts')
      .select(
        `
        id,
        title,
        brief,
        tags,
        word_count,
        reading_time_minutes,
        published_at,
        author_user_id,
        completion_percentage,
        created_at,
        updated_at
      `
      )
      .eq('is_published', true);

    // Filter by tags if provided
    if (tagsParam) {
      const tags = tagsParam.split(',').map((t) => t.trim());
      query = query.overlaps('tags', tags);
    }

    // Sort
    if (sortBy === 'engagement') {
      // For engagement, we'll fetch the data and sort on the backend
      query = query.order('published_at', { ascending: false });
    } else if (sortBy === 'likes') {
      query = query.order('published_at', { ascending: false });
    } else {
      query = query.order('published_at', { ascending: false });
    }

    const { data: posts, count, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error('Posts fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // Enrich posts with engagement data and author info
    const enrichedPosts = await Promise.all(
      (posts || []).map(async (post) => {
        // Get engagement stats
        const stats = await supabase.rpc('get_blog_stats', {
          p_blog_id: post.id,
        });

        // Get author info (basic profile data)
        const { data: author } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('user_id', post.author_user_id)
          .single();

        // Check if current user follows this author
        let isFollowing = false;
        if (userId) {
          const { data: follower } = await supabase
            .from('user_followers')
            .select('id')
            .eq('follower_user_id', userId)
            .eq('following_user_id', post.author_user_id)
            .single();
          isFollowing = !!follower;
        }

        // Check if current user liked this post
        let isLiked = false;
        if (userId) {
          const { data: like } = await supabase
            .from('blog_likes')
            .select('id')
            .eq('user_id', userId)
            .eq('blog_draft_id', post.id)
            .single();
          isLiked = !!like;
        }

        return {
          ...post,
          engagement: {
            likes: stats.data?.[0]?.likes_count || 0,
            comments: stats.data?.[0]?.comments_count || 0,
            shares: stats.data?.[0]?.shares_count || 0,
            views: stats.data?.[0]?.views_count || 0,
            engagementRate:
              Math.round((stats.data?.[0]?.engagement_rate || 0) * 100) / 100,
          },
          author: author || { id: post.author_user_id },
          userEngagement: {
            liked: isLiked,
            following: isFollowing,
          },
        };
      })
    );

    // Sort by engagement if requested
    if (sortBy === 'engagement') {
      enrichedPosts.sort(
        (a, b) =>
          (b.engagement.engagementRate || 0) -
          (a.engagement.engagementRate || 0)
      );
    } else if (sortBy === 'likes') {
      enrichedPosts.sort((a, b) => (b.engagement.likes || 0) - (a.engagement.likes || 0));
    }

    return NextResponse.json({
      total: count || 0,
      limit,
      offset,
      posts: enrichedPosts,
    });
  } catch (error: any) {
    console.error('Get community posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community posts' },
      { status: 500 }
    );
  }
}
