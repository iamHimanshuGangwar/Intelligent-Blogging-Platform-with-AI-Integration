import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/posts/[id]/share
 * Track and record a share action
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = id;
    const { userId, platform } = await request.json(); // platform: twitter, facebook, linkedin, email, etc

    if (!userId || !postId || !platform) {
      return NextResponse.json(
        { error: 'User ID, Post ID, and Platform required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Record the share
    const { error } = await supabase
      .from('blog_engagement')
      .insert({
        post_id: postId,
        user_id: userId,
        engagement_type: 'share',
        shared_on_platform: platform,
      });

    if (error) {
      console.error('Error recording share:', error);
      return NextResponse.json(
        { error: 'Failed to record share' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: `Post shared on ${platform} successfully` });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Share error:', errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/posts/[id]/share
 * Get share statistics
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = id;
    const supabase = await createClient();

    // Get share stats by platform
    const { data: shares, error } = await supabase
      .from('blog_engagement')
      .select('shared_on_platform')
      .eq('post_id', postId)
      .eq('engagement_type', 'share');

    if (error) {
      console.error('Error fetching shares:', error);
      return NextResponse.json({ sharesByPlatform: {} });
    }

    // Count by platform
    const sharesByPlatform = shares?.reduce((acc: any, share: any) => {
      const platform = share.shared_on_platform || 'other';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {}) || {};

    const totalShares = shares?.length || 0;

    return NextResponse.json({
      totalShares,
      sharesByPlatform,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Share stats error:', errorMsg);
    return NextResponse.json({ totalShares: 0, sharesByPlatform: {} });
  }
}
