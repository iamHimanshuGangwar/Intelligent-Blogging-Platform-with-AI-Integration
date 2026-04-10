import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * POST /api/blog/[blogId]/views
 * Track a blog view
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const { timeSpentSeconds = 0, viewType = 'preview' } = await req.json();
    const userId = await getAuthUserId(req);

    const supabase = await createClient();

    // Get request IP and user agent
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';

    // Insert view
    const { error } = await supabase.from('blog_views').insert([
      {
        blog_draft_id: blogId,
        viewer_user_id: userId || null,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        time_spent_seconds: timeSpentSeconds,
        view_type: viewType,
      },
    ]);

    if (error) {
      console.error('View insert error:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    // Get updated views count
    const { count } = await supabase
      .from('blog_views')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId);

    return NextResponse.json({
      success: true,
      viewsCount: count || 0,
    });
  } catch (error: any) {
    console.error('View error:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/[blogId]/views
 * Get views count
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const supabase = await createClient();

    const { count } = await supabase
      .from('blog_views')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId);

    return NextResponse.json({
      viewsCount: count || 0,
    });
  } catch (error: any) {
    console.error('Get views error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch views' },
      { status: 500 }
    );
  }
}
