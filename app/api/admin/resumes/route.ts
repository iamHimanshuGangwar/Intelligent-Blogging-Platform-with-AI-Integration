import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

async function verifyAdmin(request: NextRequest): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (profile?.role === 'admin') return userId;
    }
  } catch {}

  return verifyAdminSessionCookie(request);
}

export async function GET(request: NextRequest) {
  const adminId = await verifyAdmin(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('user_resumes')
    .select(`
      id,
      user_id,
      full_name,
      target_role,
      template,
      color_theme,
      ats_score,
      created_at,
      updated_at,
      resume_data
    `, { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    const safe = search.replace(/[%_]/g, '\\$&');
    query = query.or(`full_name.ilike.%${safe}%,target_role.ilike.%${safe}%`);
  }

  const { data: resumes, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get profile info for each user
  const userIds = [...new Set((resumes || []).map(r => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url')
    .in('id', userIds);

  const profileMap = new Map((profiles || []).map(p => [p.id, p]));

  const enriched = (resumes || []).map(r => ({
    ...r,
    user_profile: profileMap.get(r.user_id) || null,
    // Don't send full resume_data in list view, just key stats
    skills_count: (r.resume_data as Record<string, unknown>)?.skills
      ? ((r.resume_data as Record<string, unknown>).skills as string[]).length
      : 0,
    experience_count: (r.resume_data as Record<string, unknown>)?.experience
      ? ((r.resume_data as Record<string, unknown>).experience as unknown[]).length
      : 0,
    resume_data: undefined,
  }));

  return NextResponse.json({
    resumes: enriched,
    pagination: { page, limit, total: count || 0, pages: Math.ceil((count || 0) / limit) },
  });
}
