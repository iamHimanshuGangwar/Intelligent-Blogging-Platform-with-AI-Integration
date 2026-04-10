import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * POST /api/blog/archive
 * Archive a blog draft
 */
export async function POST(
  req: NextRequest
) {
  try {
    const { blogId, reason } = await req.json();
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!blogId) {
      return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Call archive helper function
    const { error } = await supabase.rpc('archive_blog', {
      p_blog_id: blogId,
      p_reason: reason || null,
    });

    if (error) {
      console.error('Archive error:', error);
      return NextResponse.json(
        { error: 'Failed to archive blog' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog archived successfully',
    });
  } catch (error: any) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: 'Failed to archive blog' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/archive
 * Restore an archived blog
 */
export async function DELETE(
  req: NextRequest
) {
  try {
    const { blogId } = await req.json();
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!blogId) {
      return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Call restore helper function
    const { error } = await supabase.rpc('restore_blog', {
      p_blog_id: blogId,
    });

    if (error) {
      console.error('Restore error:', error);
      return NextResponse.json(
        { error: 'Failed to restore blog' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog restored successfully',
    });
  } catch (error: any) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore blog' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/drafts/archived
 * Get all archived blogs for current user
 */
export async function GET(_req: NextRequest) {
  try {
    const userId = await getAuthUserId(_req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get archived blogs
    const { data: archived, error } = await supabase.rpc('get_archived_blogs');

    if (error) {
      console.error('Get archived error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch archived blogs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      archived: archived || [],
      count: archived?.length || 0,
    });
  } catch (error: any) {
    console.error('Get archived error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archived blogs' },
      { status: 500 }
    );
  }
}
