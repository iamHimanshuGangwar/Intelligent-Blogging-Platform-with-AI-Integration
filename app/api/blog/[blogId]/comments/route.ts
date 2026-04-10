import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * POST /api/blog/[blogId]/comments
 * Add a comment to a blog post
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, parentCommentId } = await req.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if the commenter is an admin — auto-approve admin comments
    let isAdmin = false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    isAdmin = profile?.role === 'admin';

    // Insert comment
    const { data: comment, error } = await supabase
      .from('blog_comments')
      .insert([
        {
          blog_draft_id: blogId,
          user_id: userId,
          parent_comment_id: parentCommentId || null,
          content: content.trim(),
          is_approved: isAdmin,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to add comment' },
        { status: 500 }
      );
    }

    // Get user info
    const { data: user } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      success: true,
      comment: {
        ...comment,
        user,
      },
    });
  } catch (error: any) {
    console.error('Comment error:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/[blogId]/comments
 * Get all comments for a blog post
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const supabase = await createClient();
    const userId = await getAuthUserId(_req);

    // Check if requester is admin — admins see all comments including unapproved
    let isAdmin = false;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      isAdmin = profile?.role === 'admin';
    }

    // Get comments with user info
    let query = supabase
      .from('blog_comments')
      .select(
        `
        id,
        content,
        likes_count,
        created_at,
        is_approved,
        user_id,
        profiles!inner(id, name, avatar_url)
      `
      )
      .eq('blog_draft_id', blogId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('is_approved', true);
    }

    const { data: comments, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      comments: comments || [],
      count: comments?.length || 0,
    });
  } catch (error: any) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
