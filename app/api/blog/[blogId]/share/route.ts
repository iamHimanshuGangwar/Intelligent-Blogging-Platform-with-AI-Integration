import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

type SharePlatform = 'twitter' | 'linkedin' | 'facebook' | 'email' | 'direct';

/**
 * POST /api/blog/[blogId]/share
 * Track a blog share to a platform
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const { platform, recipientEmail, message } = await req.json();
    const userId = await getAuthUserId(req);

    // Validate platform
    const validPlatforms: SharePlatform[] = [
      'twitter',
      'linkedin',
      'facebook',
      'email',
      'direct',
    ];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert share record
    const { data: share, error } = await supabase
      .from('blog_shares')
      .insert([
        {
          blog_draft_id: blogId,
          shared_by_user_id: userId || null,
          platform: platform as SharePlatform,
          shared_with_email: platform === 'email' ? recipientEmail : null,
          message: message || null,
          shared_at: new Date().toISOString(),
        },
      ])
      .select('id');

    if (error) {
      console.error('Share insert error:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // Get updated shares count
    const { count } = await supabase
      .from('blog_shares')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId);

    return NextResponse.json({
      success: true,
      shareId: share?.[0]?.id,
      sharesCount: count || 0,
    });
  } catch (error: any) {
    console.error('Share error:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/[blogId]/share
 * Get shares count and breakdown by platform
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const supabase = await createClient();

    // Get total shares count
    const { count } = await supabase
      .from('blog_shares')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId);

    // Get breakdown by platform
    const { data: breakdown, error } = await supabase
      .from('blog_shares')
      .select('platform')
      .eq('blog_draft_id', blogId);

    if (error) {
      console.error('Share breakdown error:', error);
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
    }

    // Calculate platform breakdown
    const platformBreakdown: Record<string, number> = {
      twitter: 0,
      linkedin: 0,
      facebook: 0,
      email: 0,
      direct: 0,
    };

    breakdown?.forEach((share) => {
      if (share.platform && share.platform in platformBreakdown) {
        platformBreakdown[share.platform]++;
      }
    });

    return NextResponse.json({
      sharesCount: count || 0,
      platformBreakdown,
    });
  } catch (error: any) {
    console.error('Get shares error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    );
  }
}
