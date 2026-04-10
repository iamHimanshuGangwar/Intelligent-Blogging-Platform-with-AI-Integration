import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

function isSchemaError(error: any): boolean {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('does not exist') || message.includes('could not find');
}

function isMissingColumnError(error: any, column: string): boolean {
  const message = String(error?.message || '').toLowerCase();
  return message.includes(`column`) && message.includes(column.toLowerCase());
}

async function verifyAdmin(request: NextRequest): Promise<string | null> {
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
    // fallback to cookie auth
  }

  const adminEmail = verifyAdminSessionCookie(request);
  if (adminEmail) return adminEmail;

  return null;
}

/**
 * Admin moderation endpoints for managing posts and comments
 * POST /api/admin/moderation - Perform moderation action (approve/reject/flag)
 * GET /api/admin/moderation - Get pending items for moderation
 */

// GET pending items requiring moderation
export async function GET(request: NextRequest) {
  try {
    const adminIdentity = await verifyAdmin(request);
    if (!adminIdentity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'posts'; // 'posts' or 'comments'

    if (type === 'posts') {
      // Get pending posts
      const { data: pendingPosts, error } = await supabase
        .from('posts_pending_approval')
        .select('*')
        .order('created_at', { ascending: true });

      if (error && isSchemaError(error)) {
        // Fallback for databases without posts_pending_approval view.
        let postsQuery: any = await supabase
          .from('posts')
          .select('id, title, excerpt, author_id, created_at, approval_status, status')
          .order('created_at', { ascending: false });

        if (postsQuery.error && isMissingColumnError(postsQuery.error, 'approval_status')) {
          postsQuery = await supabase
            .from('posts')
            .select('id, title, excerpt, author_id, created_at, status')
            .order('created_at', { ascending: false });
        }

        if (postsQuery.error) {
          console.warn('Moderation posts fallback error:', postsQuery.error.message);
          return NextResponse.json({ type: 'posts', items: [], count: 0 });
        }

        const posts = postsQuery.data || [];
        const authorIds = Array.from(new Set(posts.map((post: any) => post.author_id).filter(Boolean)));

        let profilesById = new Map<string, { name?: string | null; avatar_url?: string | null }>();
        if (authorIds.length > 0) {
          const profileRows = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', authorIds);

          if (!profileRows.error) {
            profilesById = new Map(
              (profileRows.data || []).map((profile: any) => [profile.id, profile])
            );
          }
        }

        const filtered = posts.filter((post: any) => {
          if (typeof post.approval_status === 'string') {
            return post.approval_status === 'pending';
          }
          // Legacy fallback without approval_status column.
          return post.status !== 'published';
        });

        const mapped = filtered.map((post: any) => {
          const profile = post.author_id ? profilesById.get(post.author_id) : null;
          return {
            id: post.id,
            title: post.title,
            excerpt: post.excerpt ?? null,
            author_id: post.author_id ?? null,
            author_name: profile?.name ?? null,
            author_avatar: profile?.avatar_url ?? null,
            created_at: post.created_at,
            approval_status: post.approval_status ?? 'pending',
          };
        });

        return NextResponse.json({
          type: 'posts',
          items: mapped,
          count: mapped.length,
        });
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ 
        type: 'posts',
        items: pendingPosts || [],
        count: pendingPosts?.length || 0 
      });
    } else if (type === 'comments') {
      // Get pending comments
      const { data: pendingComments, error } = await supabase
        .from('comments_pending_approval')
        .select('*')
        .order('created_at', { ascending: true });

      if (error && isSchemaError(error)) {
        // Fallback for databases without comments_pending_approval view.
        let fallback: any = await supabase
          .from('comments')
          .select('id, post_id, community_post_id, user_id, guest_name, guest_email, content, created_at, is_approved, flagged_as_spam')
          .order('created_at', { ascending: true });

        if (fallback.error) {
          // Progressive column stripping
          fallback = await supabase
            .from('comments')
            .select('id, post_id, user_id, guest_name, content, created_at, is_approved, flagged_as_spam')
            .order('created_at', { ascending: true });
        }

        if (fallback.error && (isMissingColumnError(fallback.error, 'is_approved') || isMissingColumnError(fallback.error, 'flagged_as_spam'))) {
          fallback = await supabase
            .from('comments')
            .select('id, post_id, user_id, guest_name, content, created_at')
            .order('created_at', { ascending: true });
        }

        if (fallback.error) {
          console.warn('Moderation comments fallback error:', fallback.error.message);
          return NextResponse.json({ type: 'comments', items: [], count: 0 });
        }

        const filtered = (fallback.data || []).filter((comment: any) =>
          comment.is_approved === false || comment.flagged_as_spam === true ||
          (comment.is_approved === undefined && comment.flagged_as_spam === undefined)
        );

        return NextResponse.json({
          type: 'comments',
          items: filtered,
          count: filtered.length,
        });
      }

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ 
        type: 'comments',
        items: pendingComments || [],
        count: pendingComments?.length || 0 
      });
    } else if (type === 'reviews') {
      // Get pending reviews (unapproved)
      let reviewsQuery: any = await supabase
        .from('post_reviews')
        .select('id, post_id, user_id, rating, comment, created_at, is_approved')
        .eq('is_approved', false)
        .order('created_at', { ascending: true });

      if (reviewsQuery.error && (isMissingColumnError(reviewsQuery.error, 'is_approved'))) {
        // If is_approved column doesn't exist, return all reviews
        reviewsQuery = await supabase
          .from('post_reviews')
          .select('id, post_id, user_id, rating, comment, created_at')
          .order('created_at', { ascending: true });
      }

      if (reviewsQuery.error && isSchemaError(reviewsQuery.error)) {
        // post_reviews table doesn't exist
        return NextResponse.json({ type: 'reviews', items: [], count: 0 });
      }

      if (reviewsQuery.error) {
        console.warn('Moderation reviews error:', reviewsQuery.error.message);
        return NextResponse.json({ type: 'reviews', items: [], count: 0 });
      }

      const reviews = reviewsQuery.data || [];

      // Fetch author profiles and post titles
      const userIds = Array.from(new Set(reviews.map((r: any) => r.user_id).filter(Boolean)));
      const postIds = Array.from(new Set(reviews.map((r: any) => r.post_id).filter(Boolean)));

      let profilesById = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);
        if (profiles) {
          profilesById = new Map(profiles.map((p: any) => [p.id, p]));
        }
      }

      let postsById = new Map<string, any>();
      if (postIds.length > 0) {
        const { data: posts } = await supabase
          .from('posts')
          .select('id, title, slug')
          .in('id', postIds);
        if (posts) {
          postsById = new Map(posts.map((p: any) => [p.id, p]));
        }
      }

      const mapped = reviews.map((review: any) => {
        const profile = review.user_id ? profilesById.get(review.user_id) : null;
        const post = review.post_id ? postsById.get(review.post_id) : null;
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          postTitle: post?.title ?? null,
          postSlug: post?.slug ?? null,
          author: {
            id: profile?.id ?? review.user_id ?? '',
            name: profile?.name ?? 'Unknown',
            avatar_url: profile?.avatar_url ?? null,
          },
        };
      });

      return NextResponse.json({
        type: 'reviews',
        items: mapped,
        count: mapped.length,
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Get moderation items error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST moderation actions
export async function POST(request: NextRequest) {
  try {
    const adminIdentity = await verifyAdmin(request);
    if (!adminIdentity) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // For SQL functions expecting UUID approved_by, pass null when authenticated by password cookie.
    const approvedBy = String(adminIdentity).startsWith('user_') ? null : adminIdentity;

    const body = await request.json();
    const { action, itemType, itemId, reason } = body;

    if (!action || !itemType || !itemId) {
      return NextResponse.json({ 
        error: 'action, itemType, and itemId are required' 
      }, { status: 400 });
    }

    if (itemType === 'post') {
      if (action === 'approve') {
        const { error } = await supabase.rpc('approve_post', {
          p_post_id: itemId,
          p_approved_by: approvedBy,
        });

        if (error && isSchemaError(error)) {
          let fallback = await supabase
            .from('posts')
            .update({
              approval_status: 'approved',
              approved_by: approvedBy,
              approved_at: new Date().toISOString(),
              status: 'published',
            })
            .eq('id', itemId);

          if (fallback.error && (isMissingColumnError(fallback.error, 'approval_status') || isMissingColumnError(fallback.error, 'approved_by') || isMissingColumnError(fallback.error, 'approved_at'))) {
            fallback = await supabase
              .from('posts')
              .update({ status: 'published' })
              .eq('id', itemId);
          }

          if (fallback.error) {
            return NextResponse.json({ error: fallback.error.message }, { status: 400 });
          }

          return NextResponse.json({
            message: 'Post approved successfully',
            success: true,
          }, { status: 200 });
        }

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ 
          message: 'Post approved successfully',
          success: true 
        }, { status: 200 });
      } else if (action === 'reject') {
        const { error } = await supabase.rpc('reject_post', {
          p_post_id: itemId,
          p_approved_by: approvedBy,
        });

        if (error && isSchemaError(error)) {
          let fallback = await supabase
            .from('posts')
            .update({
              approval_status: 'rejected',
              approved_by: approvedBy,
              approved_at: new Date().toISOString(),
              status: 'draft',
            })
            .eq('id', itemId);

          if (fallback.error && (isMissingColumnError(fallback.error, 'approval_status') || isMissingColumnError(fallback.error, 'approved_by') || isMissingColumnError(fallback.error, 'approved_at'))) {
            fallback = await supabase
              .from('posts')
              .update({ status: 'draft' })
              .eq('id', itemId);
          }

          if (fallback.error) {
            return NextResponse.json({ error: fallback.error.message }, { status: 400 });
          }

          return NextResponse.json({
            message: 'Post rejected successfully',
            success: true,
          }, { status: 200 });
        }

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ 
          message: 'Post rejected successfully',
          success: true 
        }, { status: 200 });
      }
    } else if (itemType === 'comment') {
      if (action === 'approve') {
        const { error } = await supabase.rpc('approve_comment', {
          p_comment_id: itemId,
          p_approved_by: approvedBy,
        });

        if (error && isSchemaError(error)) {
          const fallback = await supabase
            .from('comments')
            .update({
              is_approved: true,
              flagged_as_spam: false,
              approved_at: new Date().toISOString(),
              approved_by: approvedBy,
            })
            .eq('id', itemId);

          if (fallback.error) {
            return NextResponse.json({ error: fallback.error.message }, { status: 400 });
          }

          return NextResponse.json({
            message: 'Comment approved successfully',
            success: true,
          }, { status: 200 });
        }

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ 
          message: 'Comment approved successfully',
          success: true 
        }, { status: 200 });
      } else if (action === 'reject') {
        const { error } = await supabase.rpc('reject_comment', {
          p_comment_id: itemId,
          p_approved_by: approvedBy,
          p_reason: reason || 'Rejected by moderator',
        });

        if (error && isSchemaError(error)) {
          const fallback = await supabase
            .from('comments')
            .delete()
            .eq('id', itemId);

          if (fallback.error) {
            return NextResponse.json({ error: fallback.error.message }, { status: 400 });
          }

          return NextResponse.json({
            message: 'Comment rejected and deleted',
            success: true,
          }, { status: 200 });
        }

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ 
          message: 'Comment rejected and deleted',
          success: true 
        }, { status: 200 });
      } else if (action === 'flag') {
        const { error } = await supabase.rpc('flag_comment_as_spam', {
          p_comment_id: itemId,
          p_reason: reason || 'Flagged by moderator',
        });

        if (error && isSchemaError(error)) {
          const fallback = await supabase
            .from('comments')
            .update({
              flagged_as_spam: true,
              is_approved: false,
              flag_reason: reason || 'Flagged by moderator',
            })
            .eq('id', itemId);

          if (fallback.error) {
            return NextResponse.json({ error: fallback.error.message }, { status: 400 });
          }

          return NextResponse.json({
            message: 'Comment flagged as spam',
            success: true,
          }, { status: 200 });
        }

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ 
          message: 'Comment flagged as spam',
          success: true 
        }, { status: 200 });
      }
    } else if (itemType === 'review') {
      if (action === 'approve') {
        const { error } = await supabase
          .from('post_reviews')
          .update({
            is_approved: true,
            approved_at: new Date().toISOString(),
            approved_by: approvedBy,
          })
          .eq('id', itemId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
          message: 'Review approved successfully',
          success: true,
        }, { status: 200 });
      } else if (action === 'reject') {
        const { error } = await supabase
          .from('post_reviews')
          .delete()
          .eq('id', itemId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({
          message: 'Review rejected and deleted',
          success: true,
        }, { status: 200 });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Moderation action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
