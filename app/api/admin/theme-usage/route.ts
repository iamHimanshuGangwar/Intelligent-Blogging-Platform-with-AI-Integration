import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (profile?.role === 'admin') return true;
    }
  } catch { /* fallback */ }

  return verifyAdminSessionCookie(request) !== null;
}

export async function GET(request: NextRequest) {
  try {
    if (!(await verifyAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Get theme usage counts with author details
    const { data: posts, error } = await supabase
      .from('posts')
      .select('blog_theme, author_id, created_at, profiles(id, name, avatar_url)')
      .not('blog_theme', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Aggregate theme usage
    const themeMap = new Map<string, { count: number; users: Map<string, { name: string; avatar_url: string | null; count: number }> }>();

    for (const post of posts || []) {
      const theme = post.blog_theme || 'default';
      if (!themeMap.has(theme)) {
        themeMap.set(theme, { count: 0, users: new Map() });
      }
      const entry = themeMap.get(theme)!;
      entry.count++;

      const authorId = post.author_id;
      if (authorId) {
        const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
        if (!entry.users.has(authorId)) {
          entry.users.set(authorId, {
            name: profile?.name || 'Unknown',
            avatar_url: profile?.avatar_url || null,
            count: 0,
          });
        }
        entry.users.get(authorId)!.count++;
      }
    }

    const themes = Array.from(themeMap.entries())
      .map(([theme, data]) => ({
        theme,
        totalPosts: data.count,
        users: Array.from(data.users.entries()).map(([id, u]) => ({
          id,
          name: u.name,
          avatar_url: u.avatar_url,
          postCount: u.count,
        })),
      }))
      .sort((a, b) => b.totalPosts - a.totalPosts);

    return NextResponse.json({ themes, totalPosts: posts?.length || 0 });
  } catch (error) {
    console.error('Theme usage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
