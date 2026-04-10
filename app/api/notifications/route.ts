import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

function extractRequestId(actionUrl?: string | null): string | null {
  if (!actionUrl) return null;
  if (!actionUrl.startsWith('follow_request:')) return null;
  return actionUrl.split(':')[1] || null;
}

async function handleFollowRequestAction(
  authUserId: string,
  body: any
) {
  const supabase = await createClient();
  const { notificationId, decision, requestId: explicitRequestId } = body;

  if (!notificationId || (decision !== 'accept' && decision !== 'reject')) {
    return NextResponse.json({ error: 'notificationId and valid decision are required' }, { status: 400 });
  }

  const { data: notification, error: notificationError } = await supabase
    .from('notifications')
    .select('id,user_id,type,action_url')
    .eq('id', notificationId)
    .eq('user_id', authUserId)
    .single();

  if (notificationError || !notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  if (notification.type !== 'follow_request') {
    return NextResponse.json({ error: 'Notification is not a follow request' }, { status: 400 });
  }

  const requestId = explicitRequestId || extractRequestId(notification.action_url);
  if (!requestId) {
    return NextResponse.json({ error: 'Follow request id is missing' }, { status: 400 });
  }

  const { data: followRequest, error: followRequestError } = await supabase
    .from('follow_requests')
    .select('id,from_user_id,to_user_id,status')
    .eq('id', requestId)
    .eq('to_user_id', authUserId)
    .single();

  if (followRequestError || !followRequest) {
    return NextResponse.json({ error: 'Follow request not found' }, { status: 404 });
  }

  if (followRequest.status === 'pending') {
    const { error: updateRequestError } = await supabase
      .from('follow_requests')
      .update({ status: decision === 'accept' ? 'accepted' : 'rejected', responded_at: new Date().toISOString() })
      .eq('id', followRequest.id)
      .eq('to_user_id', authUserId);

    if (updateRequestError) {
      return NextResponse.json({ error: updateRequestError.message }, { status: 400 });
    }

    if (decision === 'accept') {
      const { error: followInsertError } = await supabase
        .from('user_follows')
        .upsert(
          {
            follower_id: followRequest.from_user_id,
            following_id: followRequest.to_user_id,
          },
          { onConflict: 'follower_id,following_id', ignoreDuplicates: true }
        );

      if (followInsertError) {
        return NextResponse.json({ error: followInsertError.message }, { status: 400 });
      }

      try {
        await supabase.from('notifications').insert({
          user_id: followRequest.from_user_id,
          related_user_id: authUserId,
          type: 'follow',
          title: 'Follow request accepted',
          message: 'Your follow request was accepted.',
          is_read: false,
        });
      } catch (notifyError) {
        console.warn('Failed to notify follow requester after acceptance:', notifyError);
      }
    }
  }

  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', authUserId);

  return NextResponse.json({
    success: true,
    status: decision === 'accept' ? 'accepted' : 'rejected',
    requestId,
  });
}

// Get user notifications
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = Number(request.nextUrl.searchParams.get('limit') || '20');
    const supabase = await createClient();

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*, related_user:related_user_id(id,name,email), post:related_post_id(id,title,slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 100));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      notifications,
      unreadCount: notifications?.filter((n: any) => !n.is_read).length || 0,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create notification (internal API - requires auth)
export async function POST(request: NextRequest) {
  try {
    const authUserId = await getAuthUserId(request);
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, notificationId, userId, type, title, message, relatedUserId, relatedPostId } = body;

    if (action === 'follow-request') {
      return handleFollowRequestAction(authUserId, body);
    }

    // Handle mark-read action
    if (action === 'mark-read' && notificationId) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', authUserId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Notification marked as read',
        success: true,
      }, { status: 200 });
    }

    // Handle mark-all-read action
    if (action === 'mark-all-read') {
      const supabase = await createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', authUserId)
        .eq('is_read', false);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        message: 'All notifications marked as read',
        success: true,
      }, { status: 200 });
    }

    // Handle delete action
    if (action === 'delete' && notificationId) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', authUserId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({
        message: 'Notification deleted',
        success: true,
      }, { status: 200 });
    }

    // Default: Create notification (internal API)
    if (!userId || !type || !title) {
      return NextResponse.json({ error: 'userId, type, and title are required' }, { status: 400 });
    }

    const adminClient = await createAdminClient();
    const { data: notification, error } = await adminClient
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type,
          title,
          message: message || title,
          related_user_id: relatedUserId,
          related_post_id: relatedPostId,
          is_read: false,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(notification![0], { status: 201 });
  } catch (error) {
    console.error('Notification action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Backward compatibility: some clients still call PUT for mark-read.
export async function PUT(request: NextRequest) {
  try {
    const authUserId = await getAuthUserId(request);
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId || typeof isRead !== 'boolean') {
      return NextResponse.json({ error: 'notificationId and isRead are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const updatePayload: Record<string, any> = { is_read: isRead };

    if (isRead) {
      updatePayload.read_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('notifications')
      .update(updatePayload)
      .eq('id', notificationId)
      .eq('user_id', authUserId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notification PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
