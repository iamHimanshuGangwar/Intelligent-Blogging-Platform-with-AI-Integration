import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ invites: [] });

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('post_collaborators')
      .select('id,post_id,permission,status,created_at,posts:posts!post_collaborators_post_id_fkey(title,slug),inviter:profiles!post_collaborators_invited_by_fkey(id,name,email)')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Invites query failed, returning empty list:', error.message);
      return NextResponse.json({ invites: [] });
    }

    return NextResponse.json({ invites: data || [] });
  } catch (error) {
    console.error('Invites GET error:', error);
    return NextResponse.json({ invites: [] });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const postId = body.postId as string;
    const action = body.action as 'accept' | 'reject';
    const status = action === 'accept' ? 'accepted' : 'rejected';

    if (!postId || !action) {
      return NextResponse.json({ error: 'postId and action are required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('post_collaborators')
      .update({ status })
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Invites PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update invite' }, { status: 500 });
  }
}
