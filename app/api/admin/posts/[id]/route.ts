import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import { logActivity } from '@/lib/activity-log';
import { logAdminAction } from '@/lib/admin-audit';
import { sendPublishAnnouncementEmail } from '@/lib/mailer';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

function isMissingColumnError(error: unknown, column: string): boolean {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = typeof error === 'object' && error !== null ? (error as { message?: string }).message : undefined;

  if (code !== 'PGRST204' && code !== '42703') {
    return false;
  }

  return typeof message === 'string' && message.toLowerCase().includes(column.toLowerCase());
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function verifyAdmin(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .maybeSingle();
      if (profile?.role === 'admin') return userId;
    }
  } catch {
    // continue to cookie fallback
  }

  const adminEmail = verifyAdminSessionCookie(request);
  if (adminEmail) return adminEmail;

  try {
    const supabase = await createClient();
    const otpToken = request.cookies.get('otp_session_token')?.value;
    if (!otpToken) return null;

    const { data: session } = await supabase
      .from('otp_sessions')
      .select('user_id, expires_at, is_active')
      .eq('session_token', otpToken)
      .maybeSingle();

    if (!session || !session.is_active || new Date(session.expires_at) <= new Date()) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user_id)
      .maybeSingle();

    return profile?.role === 'admin' ? session.user_id : null;
  } catch {
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await verifyAdmin(request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClient();

    const { data: existingPost, error: existingError } = await supabase
      .from('posts')
      .select('id, title')
      .eq('id', id)
      .maybeSingle();

    if (existingError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to delete post' }, { status: 500 });
    }

    await logActivity({
      userId: adminUserId,
      activityType: 'admin_post_deleted',
      entityType: 'post',
      entityId: id,
      metadata: { title: existingPost.title },
    });

    await logAdminAction({
      adminId: adminUserId,
      action: 'post.delete',
      resourceType: 'post',
      resourceId: id,
      details: { title: existingPost.title },
    });

    return NextResponse.json({
      success: true,
      message: 'Post deleted by admin',
      postId: id,
      title: existingPost.title,
      deletedBy: adminUserId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminUserId = await verifyAdmin(request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: existingPost, error: existingError } = await supabase
      .from('posts')
      .select('id, title, excerpt, status, topic, category')
      .eq('id', id)
      .maybeSingle();

    if (existingError || !existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    const nextTitle = typeof body.title === 'string' ? body.title.trim() : undefined;
    const nextExcerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : undefined;
    const nextTopic = typeof body.topic === 'string' ? body.topic.trim() : undefined;
    const nextCategory = typeof body.category === 'string' ? body.category.trim() : undefined;
    const nextStatus = typeof body.status === 'string' ? body.status.trim() : undefined;
    const nextScheduledFor = typeof body.scheduled_for === 'string' ? body.scheduled_for.trim() : undefined;

    if (nextTitle) {
      updateData.title = nextTitle;
      updateData.slug = createSlug(nextTitle);
    }
    if (typeof body.excerpt === 'string') {
      updateData.excerpt = nextExcerpt || null;
    }
    if (typeof body.topic === 'string') {
      updateData.topic = nextTopic || null;
    }
    if (typeof body.category === 'string') {
      updateData.category = nextCategory || null;
    }
    if (nextStatus && ['published', 'draft', 'archived', 'pending', 'scheduled'].includes(nextStatus)) {
      updateData.status = nextStatus;
    }
    if (nextScheduledFor) {
      const parsedDate = new Date(nextScheduledFor);
      if (!isNaN(parsedDate.getTime())) {
        updateData.scheduled_for = parsedDate.toISOString();
      }
    } else if (body.scheduled_for === null || body.scheduled_for === '') {
      updateData.scheduled_for = null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields supplied for update' }, { status: 400 });
    }

    if (updateData.status === 'published') {
      updateData.approval_status = 'approved';
      updateData.approved_by = adminUserId;
      updateData.approved_at = new Date().toISOString();
      updateData.published_at = new Date().toISOString();
      updateData.scheduled_for = null;
    } else if (updateData.status === 'scheduled') {
      updateData.approval_status = 'pending';
    } else if (updateData.status === 'draft' || updateData.status === 'archived' || updateData.status === 'pending') {
      updateData.approval_status = updateData.status === 'pending' ? 'pending' : 'reverted';
    }

    let result = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select('id, title, slug, excerpt, status, author_id, created_at, views, ai_generated, topic, category, profiles(id, name, avatar_url)')
      .single();

    if (
      result.error && (
        isMissingColumnError(result.error, 'category') ||
        isMissingColumnError(result.error, 'approval_status') ||
        isMissingColumnError(result.error, 'approved_by') ||
        isMissingColumnError(result.error, 'approved_at')
      )
    ) {
      // Progressive fallback: first try without just 'category'
      const fallback1 = { ...updateData };
      delete fallback1.category;

      result = await supabase
        .from('posts')
        .update(fallback1)
        .eq('id', id)
        .select('id, title, slug, excerpt, status, author_id, created_at, views, ai_generated, topic, profiles(id, name, avatar_url)')
        .single();

      // If still failing due to approval columns, strip those too
      if (
        result.error && (
          isMissingColumnError(result.error, 'approval_status') ||
          isMissingColumnError(result.error, 'approved_by') ||
          isMissingColumnError(result.error, 'approved_at')
        )
      ) {
        const fallback2 = { ...fallback1 };
        delete fallback2.approval_status;
        delete fallback2.approved_by;
        delete fallback2.approved_at;

        result = await supabase
          .from('posts')
          .update(fallback2)
          .eq('id', id)
          .select('id, title, slug, excerpt, status, author_id, created_at, views, ai_generated, topic, profiles(id, name, avatar_url)')
          .single();
      }
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message || 'Failed to update post' }, { status: 500 });
    }

    await logActivity({
      userId: adminUserId,
      activityType: 'admin_action',
      entityType: 'post',
      entityId: id,
      metadata: {
        action: 'admin_post_updated',
        previousTitle: existingPost.title,
        nextTitle: result.data.title,
        statusBefore: existingPost.status,
        statusAfter: result.data.status,
        updatedFields: Object.keys(updateData),
      },
    });

    const auditAction =
      updateData.approval_status === 'approved'
        ? 'post.approve'
        : updateData.approval_status === 'reverted'
        ? 'post.reject'
        : 'post.delete'; // fallback — should never hit

    await logAdminAction({
      adminId: adminUserId,
      action: updateData.approval_status ? auditAction : 'post.approve',
      resourceType: 'post',
      resourceId: id,
      details: {
        previousStatus: existingPost.status,
        newStatus: result.data.status,
        updatedFields: Object.keys(updateData),
      },
    });

    // Fire-and-forget newsletter announcement when post is newly published
    if (updateData.status === 'published' && existingPost.status !== 'published') {
      (async () => {
        try {
          const { data: subscribers } = await supabase
            .from('newsletter_subscribers')
            .select('email, name');

          if (subscribers && subscribers.length > 0) {
            await Promise.allSettled(
              subscribers.map((s) =>
                sendPublishAnnouncementEmail({
                  to: s.email,
                  subscriberName: s.name ?? undefined,
                  postTitle: result.data.title,
                  postExcerpt: result.data.excerpt ?? undefined,
                  postSlug: result.data.slug,
                  authorName: result.data.profiles && !Array.isArray(result.data.profiles)
                    ? (result.data.profiles as { name?: string }).name ?? 'AiBlog Editorial'
                    : 'AiBlog Editorial',
                })
              )
            );
          }
        } catch (mailErr) {
          console.error('[admin/posts PATCH] newsletter send error:', mailErr);
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
