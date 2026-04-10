import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

async function verifyAdmin(request?: NextRequest) {
  // Try Clerk auth first
  try {
    const { userId } = await auth();
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (profile?.role === 'admin') return userId;
    }
  } catch {}

  // Fall back to OTP session
  if (request) {
    try {
      const supabase = await createClient();
      const otpToken = request.cookies.get("otp_session_token")?.value;
      
      if (otpToken) {
        const { data: sessions } = await supabase
          .from('otp_sessions')
          .select('user_id, expires_at, is_active')
          .eq('session_token', otpToken)
          .single();
        
        if (!sessions) return null;
        if (!sessions.is_active || new Date(sessions.expires_at) < new Date()) return null;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessions.user_id)
          .single();
        
        if (profile?.role === 'admin') return sessions.user_id;
      }
    } catch {}
  }

  return null;
}

// GET career paths
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: paths, error } = await supabase
      .from('career_paths')
      .select(`
        *,
        skills:career_path_skills(*)
      `)
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      // Table doesn't exist yet or other error
      return NextResponse.json({ paths: [] });
    }

    return NextResponse.json({ paths: paths || [] });
  } catch (error) {
    console.error('Get career paths error:', error);
    return NextResponse.json({ paths: [] });
  }
}

// POST create career path (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, level, skills } = await request.json();
    if (!title || !level) {
      return NextResponse.json({ error: 'title and level required' }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    const { data: path, error: pathError } = await adminClient
      .from('career_paths')
      .insert([{ title, description, level }])
      .select()
      .single();

    if (pathError) {
      return NextResponse.json({ error: pathError.message }, { status: 400 });
    }

    // Add skills if provided
    if (path && skills && Array.isArray(skills) && skills.length > 0) {
      const skillsData = skills.map((skill: string) => ({
        career_path_id: path.id,
        skill_name: skill,
      }));

      await adminClient.from('career_path_skills').insert(skillsData);
    }

    return NextResponse.json({ message: 'Career path created', data: path }, { status: 201 });
  } catch (error) {
    console.error('Create career path error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE career path (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const adminClient = await createAdminClient();
    const { error } = await adminClient.from('career_paths').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Career path deleted' });
  } catch (error) {
    console.error('Delete career path error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
