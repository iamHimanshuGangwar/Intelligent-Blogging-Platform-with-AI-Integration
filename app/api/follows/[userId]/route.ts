import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';
import { logActivity } from '@/lib/activity-log';

function isMissingUserFollowsTableError(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = String((error as any)?.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    (message.includes('user_follows') && (message.includes('does not exist') || message.includes('could not find')))
  );
}

function isFollowRequestSchemaError(error: unknown): boolean {
  const message = String((error as any)?.message || '').toLowerCase();
  return (
    message.includes('follow_requests') ||
    message.includes('responded_at') ||
    message.includes('does not exist') ||
    message.includes('relation')
  );
}

function isNoRowsError(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  return code === 'PGRST116';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const currentUserId = await getAuthUserId(request);

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: targetUserId } = await params;

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const alreadyFollowingResult = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single();

    if (
      alreadyFollowingResult.error &&
      !isMissingUserFollowsTableError(alreadyFollowingResult.error) &&
      !isNoRowsError(alreadyFollowingResult.error)
    ) {
      throw alreadyFollowingResult.error;
    }

    const alreadyFollowing = alreadyFollowingResult.data;

    if (alreadyFollowing) {
      return NextResponse.json({ success: true, status: 'accepted', message: 'Already following' });
    }

    const canUseUserFollows = !isMissingUserFollowsTableError(alreadyFollowingResult.error);

    let requestId: string | undefined;
    let status: 'pending' | 'accepted' = 'pending';

    try {
      const { data: existingRequest, error: existingRequestError } = await supabase
        .from('follow_requests')
        .select('id,status')
        .eq('from_user_id', currentUserId)
        .eq('to_user_id', targetUserId)
        .single();

      if (existingRequestError && existingRequestError.code !== 'PGRST116') {
        throw existingRequestError;
      }

      requestId = existingRequest?.id;

      if (existingRequest?.status === 'pending') {
        return NextResponse.json({ success: true, status: 'pending', requestId, message: 'Request already pending' });
      }

      if (existingRequest) {
        const { data: updatedRequest, error: updateError } = await supabase
          .from('follow_requests')
          .update({ status: 'pending', responded_at: null })
          .eq('id', existingRequest.id)
          .select('id')
          .single();

        if (updateError) throw updateError;
        requestId = updatedRequest.id;
      } else {
        const { data: newRequest, error: requestError } = await supabase
          .from('follow_requests')
          .insert({
            from_user_id: currentUserId,
            to_user_id: targetUserId,
            status: 'pending',
          })
          .select('id')
          .single();

        if (requestError) throw requestError;
        requestId = newRequest.id;
      }
    } catch (followRequestError) {
      if (!isFollowRequestSchemaError(followRequestError)) {
        throw followRequestError;
      }

      if (!canUseUserFollows) {
        return NextResponse.json(
          {
            success: false,
            status: 'unavailable',
            message: 'Follow feature is temporarily unavailable in this environment.',
          },
          { status: 503 }
        );
      }

      const { error: directFollowError } = await supabase
        .from('user_follows')
        .upsert(
          { follower_id: currentUserId, following_id: targetUserId },
          { onConflict: 'follower_id,following_id', ignoreDuplicates: true }
        );

      if (directFollowError) {
        if (isMissingUserFollowsTableError(directFollowError)) {
          return NextResponse.json(
            {
              success: false,
              status: 'unavailable',
              message: 'Follow feature is temporarily unavailable in this environment.',
            },
            { status: 503 }
          );
        }
        throw directFollowError;
      }
      status = 'accepted';
    }

    await supabase.from('notifications').insert({
      user_id: targetUserId,
      related_user_id: currentUserId,
      type: status === 'pending' ? 'follow_request' : 'follow',
      title: status === 'pending' ? 'Follow Request' : 'New Follower',
      message: status === 'pending' ? 'Someone wants to follow you' : 'Someone started following you',
      action_url: status === 'pending' && requestId ? `follow_request:${requestId}` : null,
      icon: 'person_add',
      is_read: false,
    });

    await logActivity({
      userId: currentUserId,
      activityType: 'admin_action',
      entityType: 'user',
      entityId: targetUserId,
      metadata: {
        action: status === 'pending' ? 'follow_request_sent' : 'follow_created',
        requestId: requestId || null,
        status,
      },
    });

    return NextResponse.json({ success: true, status, requestId });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient();
    const currentUserId = await getAuthUserId(request);

    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: targetUserId } = await params;

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);

    if (error) {
      if (isMissingUserFollowsTableError(error)) {
        return NextResponse.json({
          success: false,
          message: 'Follow feature is temporarily unavailable in this environment.',
        });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}
