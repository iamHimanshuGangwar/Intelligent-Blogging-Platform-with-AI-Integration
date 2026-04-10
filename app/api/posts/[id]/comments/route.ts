import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/posts/[id]/comments
 * Fetch approved comments for a blog post
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = id;
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from('blog_comments')
      .select(
        `
        id,
        user_id,
        email,
        name,
        avatar_url,
        content,
        created_at
      `
      )
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Comments fetch error:', errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/posts/[id]/comments
 * Create a new comment (pending admin approval)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = id;
    const { content, userId, email, name, avatar_url } = await request.json();

    if (!content || !userId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: comment, error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        email,
        name,
        avatar_url,
        content,
        status: 'pending',
        is_approved: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Comment posted! Awaiting admin approval.',
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Comment creation error:', errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
