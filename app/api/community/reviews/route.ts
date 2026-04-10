import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

const isMissingTableError = (error: unknown) => {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = typeof error === 'object' && error !== null ? (error as { message?: string }).message : undefined;
  return code === 'PGRST205' || (typeof message === 'string' && message.includes('Could not find the table'));
};

// GET reviews
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const limit = request.nextUrl.searchParams.get('limit') || '20';
    const userId = await getAuthUserId(request);

    // Check if admin
    let isAdmin = false;
    if (userId) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      isAdmin = profile?.role === 'admin';
    }

    let query = supabase
      .from('post_reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        post_id,
        is_approved,
        profiles(id, name, email, avatar_url),
        posts(id, title, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit, 10));

    if (!isAdmin) {
      query = query.eq('is_approved', true);
    }

    let { data, error } = await query as { data: any[] | null; error: any };

    // If is_approved column doesn't exist, retry without filtering on it
    if (error && (error.message?.includes('is_approved') || error.code === 'PGRST204' || error.code === '42703')) {
      const retryQuery = supabase
        .from('post_reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          user_id,
          post_id,
          profiles(id, name, email, avatar_url),
          posts(id, title, slug)
        `)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit, 10));

      const retryResult = await retryQuery;
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({ reviews: [], unavailable: true });
      }

      console.warn('Reviews query warning:', error.message);
      return NextResponse.json({
        reviews: [],
        unavailable: true,
        warning: error.message || 'Reviews unavailable right now',
      });
    }

    const reviews = (data || []).map((r: any) => {
      // Supabase returns joined relations as object (single FK) or array depending on schema
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      const post = Array.isArray(r.posts) ? r.posts[0] : r.posts;

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        author: {
          id: profile?.id || r.user_id,
          name: profile?.name || 'Unknown',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url,
        },
        postTitle: post?.title || 'Untitled',
        postSlug: post?.slug || '',
      };
    });

    return NextResponse.json(
      { reviews },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({
      reviews: [],
      unavailable: true,
      warning: 'Failed to fetch reviews',
    });
  }
}

// POST a new review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getAuthUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postSlug, rating, comment } = await request.json();

    if (!postSlug || !rating || !comment) {
      return NextResponse.json(
        { error: 'postSlug, rating, and comment are required' },
        { status: 400 }
      );
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', postSlug)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Try inserting with is_approved first, fall back without it if column doesn't exist
    let insertData: any = null;
    let insertError: any = null;

    const reviewPayload: Record<string, unknown> = {
      user_id: userId,
      post_id: post.id,
      rating,
      comment,
    };

    // Try with is_approved = true (auto-approve so reviews appear immediately)
    const result1 = await supabase
      .from('post_reviews')
      .insert({ ...reviewPayload, is_approved: true })
      .select()
      .single();

    if (result1.error) {
      // If error is about is_approved column not existing, retry without it
      const msg = result1.error.message || '';
      if (msg.includes('is_approved') || result1.error.code === 'PGRST204' || result1.error.code === '42703') {
        const result2 = await supabase
          .from('post_reviews')
          .insert(reviewPayload)
          .select()
          .single();
        insertData = result2.data;
        insertError = result2.error;
      } else {
        insertData = result1.data;
        insertError = result1.error;
      }
    } else {
      insertData = result1.data;
      insertError = result1.error;
    }

    if (insertError) {
      if (isMissingTableError(insertError)) {
        return NextResponse.json({ error: 'Reviews feature is not configured yet' }, { status: 503 });
      }
      throw insertError;
    }

    return NextResponse.json({ review: insertData, success: true });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
