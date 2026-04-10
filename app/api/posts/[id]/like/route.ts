import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/posts/[id]/like
 * Like or unlike a blog post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = id;
    const { userId, action } = await request.json(); // action: 'like' or 'unlike'

    if (!userId || !postId) {
      return NextResponse.json(
        { error: 'User ID and Post ID required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (action === 'like') {
      // Check if already liked
      const { data: existing } = await supabase
        .from('blog_engagement')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('engagement_type', 'like')
        .single();

      if (existing) {
        return NextResponse.json(
          { message: 'Already liked' },
          { status: 200 }
        );
      }

      // Add like
      const { error } = await supabase
        .from('blog_engagement')
        .insert({
          post_id: postId,
          user_id: userId,
          engagement_type: 'like',
        });

      if (error) {
        console.error('Error adding like:', error);
        return NextResponse.json(
          { error: 'Failed to add like' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Post liked successfully' });
    } else if (action === 'unlike') {
      // Remove like
      const { error } = await supabase
        .from('blog_engagement')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('engagement_type', 'like');

      if (error) {
        console.error('Error removing like:', error);
        return NextResponse.json(
          { error: 'Failed to remove like' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Like removed successfully' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Like error:', errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/posts/[id]/like
 * Check if user has liked the post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = id;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId || !postId) {
      return NextResponse.json(
        { liked: false },
        { status: 200 }
      );
    }

    const supabase = await createClient();

    const { data: like } = await supabase
      .from('blog_engagement')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('engagement_type', 'like')
      .single();

    return NextResponse.json({ liked: !!like });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Like check error:', errorMsg);
    return NextResponse.json({ liked: false });
  }
}
