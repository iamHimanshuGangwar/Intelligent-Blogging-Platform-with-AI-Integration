import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

// GET /api/forum/topics?category=slug&limit=20&page=1&sort=latest|popular|unanswered
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const sort = searchParams.get('sort') || 'latest';
    const offset = (page - 1) * limit;

    let query = supabase
      .from('forum_topics')
      .select('*, forum_categories(id, name, slug, icon, gradient)', { count: 'exact' });

    if (categorySlug) {
      const { data: cat } = await supabase
        .from('forum_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    if (sort === 'popular') {
      query = query.order('like_count', { ascending: false });
    } else if (sort === 'unanswered') {
      query = query.eq('reply_count', 0).order('created_at', { ascending: false });
    } else {
      // latest: pinned first, then by last_reply_at
      query = query
        .order('is_pinned', { ascending: false })
        .order('last_reply_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: topics, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      topics: topics || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/forum/topics — create new topic (auth required)
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { category_id, title, content, tags } = body;

    if (!category_id || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'category_id, title, and content are required' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    const { data: topic, error } = await supabase
      .from('forum_topics')
      .insert({
        category_id,
        title: title.trim(),
        content: content.trim(),
        author_id: userId,
        author_name: profile?.name || 'Anonymous',
        author_avatar: profile?.avatar_url || null,
        tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
      })
      .select('*, forum_categories(id, name, slug, icon, gradient)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ topic }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
