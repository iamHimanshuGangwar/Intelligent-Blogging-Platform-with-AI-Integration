import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';
import { sendCollaborationInviteEmail } from '@/lib/mailer';

async function isOwner(supabase: any, postId: string, userId: string) {
  const { data } = await supabase.from('posts').select('author_id').eq('id', postId).single();
  return data?.author_id === userId;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const owner = await isOwner(supabase, postId, userId);

    if (!owner) {
      const { data: access } = await supabase
        .from('post_collaborators')
        .select('id,status')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('status', 'accepted')
        .single();

      if (!access) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('post_collaborators')
      .select('id,post_id,user_id,invited_by,permission,status,created_at,profiles:profiles!post_collaborators_user_id_fkey(id,name,email,avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ collaborators: data || [] });
  } catch (error) {
    console.error('Collaborators GET error:', error);
    return NextResponse.json({ error: 'Failed to load collaborators' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const inviterId = await getAuthUserId(request);
    if (!inviterId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const owner = await isOwner(supabase, postId, inviterId);
    if (!owner) return NextResponse.json({ error: 'Only owner can invite collaborators' }, { status: 403 });

    const [{ data: inviterProfile }, { data: post }] = await Promise.all([
      supabase.from('profiles').select('name,email').eq('id', inviterId).maybeSingle(),
      supabase.from('posts').select('title').eq('id', postId).maybeSingle(),
    ]);

    const body = await request.json();
    const permission = body.permission === 'viewer' ? 'viewer' : 'editor';

    let targetUserId = body.userId as string | undefined;

    if (!targetUserId && body.email) {
      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('id,name,email')
        .eq('email', String(body.email).toLowerCase())
        .single();
      targetUserId = profileByEmail?.id;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user not found. Invite using a registered user email.' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('post_collaborators')
      .upsert(
        {
          post_id: postId,
          user_id: targetUserId,
          invited_by: inviterId,
          permission,
          status: 'pending',
        },
        { onConflict: 'post_id,user_id' }
      )
      .select('id,post_id,user_id,invited_by,permission,status,created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const { data: inviteeProfile } = await supabase
      .from('profiles')
      .select('name,email')
      .eq('id', targetUserId)
      .maybeSingle();

    try {
      await supabase.from('notifications').insert({
        user_id: targetUserId,
        related_user_id: inviterId,
        related_post_id: postId,
        type: 'collab_invite',
        title: 'Collaboration Invite',
        message: 'You were invited to collaborate on a draft.',
        action_url: `collab_invite:${postId}`,
        icon: 'group_add',
        is_read: false,
      });
    } catch {}

    if (inviteeProfile?.email) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const editorLink = `${baseUrl}/dashboard/collaboration`;
        await sendCollaborationInviteEmail({
          to: inviteeProfile.email,
          inviteeName: inviteeProfile.name || undefined,
          inviterName: inviterProfile?.name || inviterProfile?.email || 'A collaborator',
          postTitle: post?.title || 'Untitled draft',
          editorLink,
        });
      } catch (mailError) {
        console.warn('Failed to send collaboration invite email:', mailError);
      }
    }

    return NextResponse.json({ collaborator: data, message: 'Invitation sent' }, { status: 201 });
  } catch (error) {
    console.error('Collaborators POST error:', error);
    return NextResponse.json({ error: 'Failed to invite collaborator' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const body = await request.json();
    const targetUserId = body.userId || userId;
    const action = body.action as 'accept' | 'reject' | 'permission';

    const owner = await isOwner(supabase, postId, userId);

    if (action === 'permission') {
      if (!owner) return NextResponse.json({ error: 'Only owner can change permissions' }, { status: 403 });
      const permission = body.permission === 'viewer' ? 'viewer' : 'editor';
      const { error } = await supabase
        .from('post_collaborators')
        .update({ permission })
        .eq('post_id', postId)
        .eq('user_id', targetUserId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }

    if (!owner && targetUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = action === 'accept' ? 'accepted' : 'rejected';
    const { error } = await supabase
      .from('post_collaborators')
      .update({ status })
      .eq('post_id', postId)
      .eq('user_id', targetUserId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Collaborators PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update collaborator' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createClient();
    const owner = await isOwner(supabase, postId, userId);
    if (!owner) return NextResponse.json({ error: 'Only owner can remove collaborators' }, { status: 403 });

    const targetUserId = request.nextUrl.searchParams.get('userId');
    if (!targetUserId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const { error } = await supabase
      .from('post_collaborators')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', targetUserId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Collaborators DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove collaborator' }, { status: 500 });
  }
}
