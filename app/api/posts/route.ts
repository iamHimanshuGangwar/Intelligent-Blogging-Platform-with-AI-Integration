import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';
import { logActivity } from '@/lib/activity-log';
import { cacheGet, cacheSet } from '@/lib/cache';

// Sanitize user input for PostgREST filter strings
function sanitizeFilterInput(input: string): string {
  return input.replace(/[,.()'"\\]/g, '').trim();
}

type SearchablePost = {
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  topic?: string | null;
  category?: string | null;
  created_at?: string;
};

function isMissingCategoryColumn(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = typeof error === 'object' && error !== null ? (error as { message?: string }).message : undefined;
  if (code !== 'PGRST204' && code !== '42703') return false;
  return typeof message === 'string' && message.toLowerCase().includes('category');
}

function isMissingApprovalColumn(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = typeof error === 'object' && error !== null ? (error as { message?: string }).message : undefined;
  if (code !== 'PGRST204' && code !== '42703') return false;
  return typeof message === 'string' && message.toLowerCase().includes('approval_status');
}

function isMissingBlogThemeColumn(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null ? (error as { code?: string }).code : undefined;
  const message = typeof error === 'object' && error !== null ? (error as { message?: string }).message : undefined;
  if (code !== 'PGRST204' && code !== '42703') return false;
  return typeof message === 'string' && message.toLowerCase().includes('blog_theme');
}

function computeSearchRelevance(post: SearchablePost, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const title = (post.title || '').toLowerCase();
  const topic = (post.topic || '').toLowerCase();
  const category = (post.category || '').toLowerCase();
  const excerpt = (post.excerpt || '').toLowerCase();
  const content = (post.content || '').toLowerCase();

  let score = 0;

  if (title === q) score += 160;
  if (topic === q) score += 180;
  if (category === q) score += 220;

  if (title.startsWith(q)) score += 100;
  if (topic.startsWith(q)) score += 120;
  if (category.startsWith(q)) score += 140;

  if (title.includes(q)) score += 70;
  if (topic.includes(q)) score += 90;
  if (category.includes(q)) score += 110;
  if (excerpt.includes(q)) score += 40;
  if (content.includes(q)) score += 20;

  const terms = q.split(/\s+/).filter(Boolean);
  for (const term of terms) {
    if (term.length < 2) continue;
    if (title.includes(term)) score += 20;
    if (topic.includes(term)) score += 30;
    if (category.includes(term)) score += 35;
    if (excerpt.includes(term)) score += 10;
  }

  return score;
}

function hasAdminSessionCookie(request: NextRequest): boolean {
  try {
    const adminSessionToken = request.cookies.get('admin_session_token')?.value;
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase();

    if (!adminSessionToken || !adminEmail) {
      return false;
    }

    const decoded = Buffer.from(adminSessionToken, 'base64').toString('utf8');
    const [email] = decoded.split(':');
    return email?.toLowerCase() === adminEmail;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const published = searchParams.get('published') === 'true';
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');
    const topic = searchParams.get('topic');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const authUserId = await getAuthUserId(request);
    const isAdminSession = hasAdminSessionCookie(request);

    // Fast path: serve cached published listings for anonymous users
    const isAnonymousPublishedList = published && !authUserId && !search && !userId && !topic && !category && !status;
    if (isAnonymousPublishedList) {
      const cached = await cacheGet<{ posts: unknown[]; total: number; pagination: unknown }>(`posts:pub:${page}:${limit}`);
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
        });
      }
    }

    // Validate Supabase is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
      return NextResponse.json({
        posts: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        warning: 'Supabase not configured. Returning empty posts.'
      });
    }

    const supabase = await createClient();
    let requesterRole: string | null = null;

    if (authUserId) {
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUserId)
        .maybeSingle();
      requesterRole = requesterProfile?.role || null;
    }

    const isAdmin = isAdminSession || requesterRole === 'admin';
    const isOwnContentRequest = Boolean(userId && authUserId && userId === authUserId);
    const canSeeUnpublished = isAdmin || isOwnContentRequest;
    let query = supabase
      .from('posts')
      .select('*, profiles(id, name, avatar_url)', { count: 'exact' });

    if (published) {
      query = query.eq('status', 'published');
      if (!canSeeUnpublished) {
        query = query.or('approval_status.eq.approved,approval_status.is.null');
      }
    } else if (status && canSeeUnpublished) {
      query = query.eq('status', status);
    } else if (!canSeeUnpublished) {
      query = query.eq('status', 'published');
      query = query.or('approval_status.eq.approved,approval_status.is.null');
    }

    if (userId) {
      query = query.eq('author_id', userId);
    }

    if (search) {
      const safe = sanitizeFilterInput(search);
      if (safe) {
        query = query.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%,content.ilike.%${safe}%,topic.ilike.%${safe}%,category.ilike.%${safe}%`);
      }
    }

    if (topic) {
      query = query.eq('topic', topic);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const offset = (page - 1) * limit;
    let categoryFilterUnavailable = false;

    let { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error && isMissingCategoryColumn(error)) {
      categoryFilterUnavailable = Boolean(category);

      let fallbackQuery = supabase
        .from('posts')
        .select('*, profiles(id, name, avatar_url)', { count: 'exact' });

      if (published) {
        fallbackQuery = fallbackQuery.eq('status', 'published');
        if (!canSeeUnpublished) {
          fallbackQuery = fallbackQuery.or('approval_status.eq.approved,approval_status.is.null');
        }
      } else if (status && canSeeUnpublished) {
        fallbackQuery = fallbackQuery.eq('status', status);
      } else if (!canSeeUnpublished) {
        fallbackQuery = fallbackQuery.eq('status', 'published');
        fallbackQuery = fallbackQuery.or('approval_status.eq.approved,approval_status.is.null');
      }

      if (userId) {
        fallbackQuery = fallbackQuery.eq('author_id', userId);
      }

      if (search) {
        const safe = sanitizeFilterInput(search);
        if (safe) {
          fallbackQuery = fallbackQuery.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%,content.ilike.%${safe}%,topic.ilike.%${safe}%`);
        }
      }

      if (topic) {
        fallbackQuery = fallbackQuery.eq('topic', topic);
      }

      const fallbackResult = await fallbackQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      data = fallbackResult.data as any;
      count = fallbackResult.count ?? 0;
      error = fallbackResult.error as any;
    }

    // If approval_status column doesn't exist, retry without the approval filter
    if (error && isMissingApprovalColumn(error)) {
      let noApprovalQuery = supabase
        .from('posts')
        .select('*, profiles(id, name, avatar_url)', { count: 'exact' });

      if (published || !canSeeUnpublished) {
        noApprovalQuery = noApprovalQuery.eq('status', 'published');
      } else if (status && canSeeUnpublished) {
        noApprovalQuery = noApprovalQuery.eq('status', status);
      }

      if (userId) {
        noApprovalQuery = noApprovalQuery.eq('author_id', userId);
      }

      if (search) {
        const safe = sanitizeFilterInput(search);
        if (safe) {
          noApprovalQuery = noApprovalQuery.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%,content.ilike.%${safe}%,topic.ilike.%${safe}%`);
        }
      }

      if (topic) {
        noApprovalQuery = noApprovalQuery.eq('topic', topic);
      }

      const noApprovalResult = await noApprovalQuery
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      data = noApprovalResult.data as any;
      count = noApprovalResult.count ?? 0;
      error = noApprovalResult.error as any;
    }

    if (error) {
      console.error('Posts query error:', error.message, error.code);

      // Return safe fallback instead of breaking homepage/public feeds.
      return NextResponse.json({
        posts: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        warning: error.message || 'Posts unavailable right now',
      });
    }

    const filteredData = data || [];

    const postIds = filteredData.map((post: any) => post.id).filter(Boolean);
    const likesByPostId = new Map<string, number>();
    const commentsByPostId = new Map<string, number>();
    const likedByCurrentUser = new Set<string>();

    if (postIds.length > 0) {
      // Try post_likes first, fall back to likes table
      let likeRows: any[] | null = null;
      let likesError: any = null;

      const result1 = await supabase.from('post_likes').select('post_id').in('post_id', postIds);
      if (result1.error) {
        console.warn('post_likes query warning, trying likes table:', result1.error.message);
        const result2 = await supabase.from('likes').select('post_id').in('post_id', postIds);
        likeRows = result2.data;
        likesError = result2.error;
      } else {
        likeRows = result1.data;
      }

      const { data: commentRows, error: commentsError } = await supabase
        .from('comments')
        .select('post_id')
        .in('post_id', postIds);

      if (likesError) {
        console.warn('likes query warning:', likesError.message);
      }
      if (commentsError) {
        console.warn('comments query warning:', commentsError.message);
      }

      for (const row of likeRows || []) {
        if (!row.post_id) continue;
        likesByPostId.set(row.post_id, (likesByPostId.get(row.post_id) || 0) + 1);
      }

      for (const row of commentRows || []) {
        if (!row.post_id) continue;
        commentsByPostId.set(row.post_id, (commentsByPostId.get(row.post_id) || 0) + 1);
      }

      if (authUserId) {
        let likedRows: any[] | null = null;
        const likedResult1 = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', authUserId)
          .in('post_id', postIds);

        if (likedResult1.error) {
          const likedResult2 = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', authUserId)
            .in('post_id', postIds);
          likedRows = likedResult2.data;
        } else {
          likedRows = likedResult1.data;
        }

        for (const row of likedRows || []) {
          if (row.post_id) likedByCurrentUser.add(row.post_id);
        }
      }
    }

    const enrichedPosts = filteredData.map((post: any) => ({
      ...post,
      likes_count: likesByPostId.get(post.id) ?? post.likes_count ?? 0,
      comments_count: commentsByPostId.get(post.id) ?? post.comments_count ?? 0,
      liked_by_current_user: likedByCurrentUser.has(post.id),
    }));

    const orderedPosts = search
      ? [...enrichedPosts].sort((a: any, b: any) => {
          const scoreA = computeSearchRelevance(a, search);
          const scoreB = computeSearchRelevance(b, search);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
      : enrichedPosts;

    const total = typeof count === 'number' ? Math.max(0, count) : orderedPosts.length;

    const response = NextResponse.json({
      posts: orderedPosts,
      total,
      warning: categoryFilterUnavailable
        ? 'Category filtering is unavailable on this database schema yet.'
        : undefined,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    // Cache published anonymous listing requests (most common public page loads)
    if (isAnonymousPublishedList) {
      response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
      cacheSet(`posts:pub:${page}:${limit}`, { posts: orderedPosts, total, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }, 30).catch(() => {});
    } else {
      response.headers.set('Cache-Control', 'no-store');
    }
    return response;
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { title, content, excerpt, image_url, cover_image_url, published, ai_generated, aiGenerated, topic, category, status, blog_theme, scheduled_for } = body;

    // Get user ID from authenticated session (Clerk or OTP)
    const userId = await getAuthUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const isAiGenerated = ai_generated || aiGenerated || false;

    // Check if the creator is an admin — admin posts skip moderation
    const isAdminSession = hasAdminSessionCookie(request);
    let isAdminCreator = isAdminSession;
    if (!isAdminCreator) {
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      isAdminCreator = creatorProfile?.role === 'admin';
    }

    // If scheduled_for is set, force status to 'scheduled' 
    const scheduledDate = scheduled_for ? new Date(scheduled_for) : null;
    const isScheduled = scheduledDate && scheduledDate > new Date();
    const resolvedStatus = isScheduled ? 'scheduled' : (published ? 'published' : (status || 'draft'));
    // Admin-created posts are always pre-approved — no self-approval loop
    const resolvedApproval = isAdminCreator ? 'approved' : 'pending';
    const nowISO = new Date().toISOString();

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36);

    let createResult = await supabase
      .from('posts')
      .insert([{
        author_id: userId,
        title,
        content,
        excerpt: excerpt || content.substring(0, 160),
        cover_image_url: cover_image_url || image_url || null,
        slug,
        status: resolvedStatus,
        approval_status: resolvedApproval,
        approved_at: isAdminCreator ? nowISO : null,
        approved_by: isAdminCreator ? userId : null,
        published_at: resolvedStatus === 'published' ? nowISO : null,
        ai_generated: isAiGenerated,
        topic: topic || null,
        category: category || null,
        blog_theme: blog_theme || 'default',
        scheduled_for: scheduledDate?.toISOString() ?? null,
      }])
      .select()
      .single();

    if (createResult.error && (isMissingCategoryColumn(createResult.error) || isMissingBlogThemeColumn(createResult.error))) {
      createResult = await supabase
        .from('posts')
        .insert([{
          author_id: userId,
          title,
          content,
          excerpt: excerpt || content.substring(0, 160),
          cover_image_url: cover_image_url || image_url || null,
          slug,
          status: resolvedStatus,
          approval_status: resolvedApproval,
          approved_at: isAdminCreator ? nowISO : null,
          approved_by: isAdminCreator ? userId : null,
          published_at: resolvedStatus === 'published' ? nowISO : null,
          ai_generated: isAiGenerated,
          topic: topic || null,
        }])
        .select()
        .single();
    }

    const data = createResult.data;
    const error = createResult.error;

    if (error) {
      console.error('Create post error:', error);
      return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 });
    }

    await logActivity({
      userId,
      activityType: 'post_created',
      entityType: 'post',
      entityId: data.id,
      metadata: {
        title,
        topic: topic || null,
        category: category || null,
        status: published ? 'published' : (status || 'draft'),
        aiGenerated: isAiGenerated,
      },
    });

    try {
      const { data: adminProfiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (adminProfiles && adminProfiles.length > 0) {
        const notificationRows = adminProfiles
          .filter((admin) => admin.id && admin.id !== userId)
          .map((admin) => ({
            user_id: admin.id,
            type: 'system',
            title: 'New blog post created',
            message: `${title.substring(0, 80)}${title.length > 80 ? '...' : ''}`,
            related_user_id: userId,
            related_post_id: data.id,
            is_read: false,
          }));

        if (notificationRows.length > 0) {
          await supabase.from('notifications').insert(notificationRows);
        }
      }
    } catch (notifyError) {
      console.warn('Failed to create admin post notifications:', notifyError);
    }

    return NextResponse.json({ message: 'Post created successfully', post: data }, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
