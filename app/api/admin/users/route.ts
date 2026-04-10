import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

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

  // Fall back to HMAC-signed admin cookie
  if (request) {
    const adminEmail = verifyAdminSessionCookie(request);
    if (adminEmail) return adminEmail;

    try {
      const supabase = await createClient();
      const otpToken = request.cookies.get("otp_session_token")?.value;
      
      if (otpToken) {
        // Query otp_sessions table to find session
        const { data: sessions, error } = await supabase
          .from('otp_sessions')
          .select('user_id, expires_at, is_active')
          .eq('session_token', otpToken)
          .single();
        
        if (!error && sessions) {
          // Check if session is active and not expired
          if (sessions.is_active && new Date(sessions.expires_at) > new Date()) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', sessions.user_id)
              .single();
            
            if (profile?.role === 'admin') return sessions.user_id;
          }
        }
      }
    } catch (e) {
      console.error('OTP verification error:', e);
    }
  }

  return null;
}

// Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = await createAdminClient();
    const { data: users, error } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create user (admin only)
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, role } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
    }

    const adminClient = await createAdminClient();
    const { data, error } = await adminClient
      .from('profiles')
      .insert([{ email, name, role: role || 'creator' }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User created successfully', user: data }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update user role (admin only)
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role, status } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const adminClient = await createAdminClient();
    const { data, error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User updated successfully', user: data });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const adminClient = await createAdminClient();
    const { error } = await adminClient.from('profiles').delete().eq('id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User deleted successfully', deletedId: userId });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
