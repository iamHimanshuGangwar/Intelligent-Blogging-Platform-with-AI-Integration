import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * POST /api/blog/[blogId]/like
 * Toggle like on a blog post
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const userId = await getAuthUserId(_req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('blog_draft_id', blogId)
      .eq('user_id', userId)
      .single();

    let likesCount = 0;

    if (existingLike) {
      // Unlike: delete the like
      await supabase
        .from('blog_likes')
        .delete()
        .eq('blog_draft_id', blogId)
        .eq('user_id', userId);
    } else {
      // Like: insert new like
      await supabase
        .from('blog_likes')
        .insert([{ blog_draft_id: blogId, user_id: userId }]);
    }

    // Get updated likes count
    const { count } = await supabase
      .from('blog_likes')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId);

    likesCount = count || 0;

    return NextResponse.json({
      success: true,
      liked: !existingLike,
      likesCount,
    });
  } catch (error: any) {
    console.error('Like error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/[blogId]/likes
 * Get likes count
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ blogId: string }> }
) {
  try {
    const { blogId } = await params;
    const supabase = await createClient();
    const userId = await getAuthUserId(_req);

    // Get likes count
    const { count } = await supabase
      .from('blog_likes')
      .select('id', { count: 'exact', head: true })
      .eq('blog_draft_id', blogId);

    // Check if current user liked
    let userLiked = false;
    if (userId) {
      const { data } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('blog_draft_id', blogId)
        .eq('user_id', userId)
        .single();

      userLiked = !!data;
    }

    return NextResponse.json({
      likesCount: count || 0,
      userLiked,
    });
  } catch (error: any) {
    console.error('Get likes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}
