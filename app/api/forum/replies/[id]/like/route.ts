import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

// POST /api/forum/replies/[id]/like — toggle like on a reply
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
      .from('forum_reply_likes')
      .select('id')
      .eq('reply_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await supabase.from('forum_reply_likes').delete().eq('id', existing.id);
      const { data: r } = await supabase.from('forum_replies').select('like_count').eq('id', id).single();
      if (r) await supabase.from('forum_replies').update({ like_count: Math.max(0, (r.like_count || 0) - 1) }).eq('id', id);
      return NextResponse.json({ liked: false });
    } else {
      await supabase.from('forum_reply_likes').insert({ reply_id: id, user_id: userId });
      const { data: r } = await supabase.from('forum_replies').select('like_count').eq('id', id).single();
      if (r) await supabase.from('forum_replies').update({ like_count: (r.like_count || 0) + 1 }).eq('id', id);
      return NextResponse.json({ liked: true });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
