import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';
import { logActivity } from '@/lib/activity-log';

type LikeRow = { user_id: string; created_at?: string | null };

const LIKE_TABLES = ['post_likes', 'likes'] as const;

const isMissingTableError = (error: unknown) => {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = typeof error === 'object' && error !== null ? (error as { message?: string }).message : undefined;
  return code === 'PGRST205' || (typeof message === 'string' && message.includes('Could not find the table'));
};

async function queryLikesTable<T>(run: (table: (typeof LIKE_TABLES)[number]) => Promise<{ data: T | null; error: unknown }>) {
  let lastError: unknown = null;

  for (const table of LIKE_TABLES) {
    const result = await run(table);
    if (!result.error) {
      return { table, data: result.data };
    }

    if (isMissingTableError(result.error)) {
      lastError = result.error;
      continue;
    }

    throw result.error;
  }

  throw lastError ?? new Error('Like table not found');
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const postId = request.nextUrl.searchParams.get('post_id');
    const userId = await getAuthUserId(request);

    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    const likeResult = await queryLikesTable<LikeRow[]>(async (table) =>
      supabase.from(table).select('user_id, created_at').eq('post_id', postId)
    );

    const likes = likeResult.data || [];
    const likedByCurrentUser = !!userId && likes.some((like) => like.user_id === userId);

    const likerIds = [...new Set(likes.map((like) => like.user_id))];
    let likers: Array<{ id: string; name: string | null; avatar_url: string | null }> = [];

    if (likerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', likerIds);
      likers = profiles || [];
    }

    return NextResponse.json({
      likes,
      likers,
      count: likes.length,
      likesCount: likes.length,
      likedByCurrentUser,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const queryPostId = request.nextUrl.searchParams.get('post_id');
    let bodyPostId: string | null = null;
    if (!queryPostId) {
      try {
        const body = await request.json();
        bodyPostId = body?.postId || body?.post_id || null;
      } catch {
        bodyPostId = null;
      }
    }

    const postId = queryPostId || bodyPostId;
    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (postError || !postData) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const existingLikeRows = await queryLikesTable<LikeRow[]>(async (table) =>
      supabase.from(table).select('user_id, created_at').eq('post_id', postId).eq('user_id', userId)
    );

    let insertResult: { table: (typeof LIKE_TABLES)[number]; data: LikeRow | null } = {
      table: existingLikeRows.table,
      data: (existingLikeRows.data || [])[0] || null,
    };

    if (!(existingLikeRows.data || []).length) {
      insertResult = await queryLikesTable<LikeRow>(async (table) =>
        supabase.from(table).insert({ post_id: postId, user_id: userId }).select('user_id, created_at').single()
      );
    } else if ((existingLikeRows.data || []).length > 1) {
      // Clean up duplicate likes for this user/post pair and keep exactly one.
      await queryLikesTable(async (table) =>
        supabase.from(table).delete().eq('post_id', postId).eq('user_id', userId)
      );
      insertResult = await queryLikesTable<LikeRow>(async (table) =>
        supabase.from(table).insert({ post_id: postId, user_id: userId }).select('user_id, created_at').single()
      );
    }

    const countResult = await queryLikesTable<LikeRow[]>(async (table) =>
      supabase.from(table).select('user_id').eq('post_id', postId)
    );

    const count = new Set((countResult.data || []).map((row) => row.user_id)).size;

    await supabase.from('posts').update({ likes_count: count }).eq('id', postId);

    try {
      if (userId !== postData.author_id) {
        await supabase.from('notifications').insert({
          user_id: postData.author_id,
          related_user_id: userId,
          type: 'like',
          related_post_id: postId,
          title: 'New Like',
          message: 'Someone liked your post',
        });
      }
    } catch (notificationError) {
      console.warn('Failed to create like notification:', notificationError);
    }

    await logActivity({
      userId,
      activityType: 'post_liked',
      entityType: 'post',
      entityId: postId,
      metadata: {
        likesCount: count,
      },
    });

    return NextResponse.json({
      success: true,
      like: insertResult.data,
      count,
      likesCount: count,
      likedByCurrentUser: true,
    });
  } catch (error) {
    console.error('Error creating like:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to like post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = request.nextUrl.searchParams.get('post_id');
    if (!postId) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    await queryLikesTable(async (table) =>
      supabase.from(table).delete().eq('post_id', postId).eq('user_id', userId)
    );

    const countResult = await queryLikesTable<LikeRow[]>(async (table) =>
      supabase.from(table).select('user_id').eq('post_id', postId)
    );

    const count = new Set((countResult.data || []).map((row) => row.user_id)).size;

    await supabase.from('posts').update({ likes_count: count }).eq('id', postId);

    await logActivity({
      userId,
      activityType: 'post_unliked',
      entityType: 'post',
      entityId: postId,
      metadata: {
        likesCount: count,
      },
    });

    return NextResponse.json({
      success: true,
      count,
      likesCount: count,
      likedByCurrentUser: false,
    });
  } catch (error) {
    console.error('Error deleting like:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unlike post' },
      { status: 500 }
    );
  }
}
