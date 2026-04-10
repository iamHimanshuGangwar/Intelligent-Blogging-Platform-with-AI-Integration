import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

// GET /api/forum/topics/[id]/replies?page=1&limit=20
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const offset = (page - 1) * limit;

    const { data: replies, error, count } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact' })
      .eq('topic_id', id)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ replies: replies || [], total: count || 0, page, limit });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/forum/topics/[id]/replies — auth required
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const supabase = await createClient();

    // Check topic exists and is not locked
    const { data: topic } = await supabase
      .from('forum_topics')
      .select('id, is_locked')
      .eq('id', id)
      .single();

    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    if (topic.is_locked) {
      return NextResponse.json({ error: 'This topic is locked' }, { status: 403 });
    }

    const body = await request.json();
    const { content, parent_id } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    const { data: reply, error } = await supabase
      .from('forum_replies')
      .insert({
        topic_id: id,
        parent_id: parent_id || null,
        author_id: userId,
        author_name: profile?.name || 'Anonymous',
        author_avatar: profile?.avatar_url || null,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ reply }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
