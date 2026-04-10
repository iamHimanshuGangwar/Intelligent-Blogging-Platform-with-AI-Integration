import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

// POST /api/forum/topics/[id]/like — toggle like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('forum_topic_likes')
      .select('id')
      .eq('topic_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('forum_topic_likes').delete().eq('id', existing.id);
      await supabase
        .from('forum_topics')
        .update({ like_count: supabase.rpc('_noop') as any })
        .eq('id', id);
      // Decrement manually
      const { data: t } = await supabase.from('forum_topics').select('like_count').eq('id', id).single();
      if (t) {
        await supabase.from('forum_topics').update({ like_count: Math.max(0, (t.like_count || 0) - 1) }).eq('id', id);
      }
      return NextResponse.json({ liked: false });
    } else {
      await supabase.from('forum_topic_likes').insert({ topic_id: id, user_id: userId });
      const { data: t } = await supabase.from('forum_topics').select('like_count').eq('id', id).single();
      if (t) {
        await supabase.from('forum_topics').update({ like_count: (t.like_count || 0) + 1 }).eq('id', id);
      }
      return NextResponse.json({ liked: true });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/forum/topics/[id]/like — check if current user liked
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ liked: false });

    const supabase = await createClient();
    const { data } = await supabase
      .from('forum_topic_likes')
      .select('id')
      .eq('topic_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    return NextResponse.json({ liked: !!data });
  } catch (err) {
    return NextResponse.json({ liked: false });
  }
}
