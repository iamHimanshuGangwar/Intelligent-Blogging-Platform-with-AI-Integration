import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

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

      if (profile?.role === 'admin') {
        return userId;
      }
    }
  } catch {
    // Continue to cookie fallback.
  }

  const adminEmail = verifyAdminSessionCookie(request);
  if (adminEmail) return adminEmail;

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const adminUserId = await verifyAdmin(request);
    if (!adminUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();
    const offset = (page - 1) * limit;

    const supabase = await createClient();
    let query = supabase
      .from('posts')
      .select('id, title, slug, excerpt, status, author_id, created_at, views, ai_generated, topic, category, profiles(id, name, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      const safe = search.replace(/[,.()'"\\]/g, '').trim().replace(/[%_]/g, '\\$&');
      if (safe) {
        query = query.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%,content.ilike.%${safe}%,topic.ilike.%${safe}%,category.ilike.%${safe}%`);
      }
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message || 'Failed to load posts' }, { status: 500 });
    }

    return NextResponse.json({
      posts: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}