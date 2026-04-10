import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/auth/otp/session
 * Get current OTP user session from database
 * Uses session token from cookies
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get session token from cookie
    const sessionToken = request.cookies.get('otp_session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'No session found' }, { status: 401 });
    }

    // Find the session in database
    const { data: session, error: sessionError } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Mark session as inactive
      await supabase
        .from('otp_sessions')
        .update({ is_active: false })
        .eq('id', session.id);
      
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // Update last accessed time
    await supabase
      .from('otp_sessions')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', session.id);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatar_url,
        role: profile.role,
      },
      session: {
        token: sessionToken,
        expiresAt: session.expires_at,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Get OTP session error:", errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/auth/otp/session
 * Validate OTP session
 */
export async function POST(request: NextRequest) {
  try {
    const { session_token } = await request.json();
    
    if (!session_token) {
      return NextResponse.json({ error: 'Session token required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find the session
    const { data: session } = await supabase
      .from('otp_sessions')
      .select('*')
      .eq('session_token', session_token)
      .eq('is_active', true)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Check expiry
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from('otp_sessions')
        .update({ is_active: false })
        .eq('id', session.id);
      
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Validate OTP session error:", errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/auth/otp/session
 * Logout OTP session from database
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const sessionToken = request.cookies.get('otp_session_token')?.value;

    if (sessionToken) {
      // Mark session as inactive
      await supabase
        .from('otp_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Clear cookies
    response.cookies.set('otp_session_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('otp_session', '', {
      httpOnly: false,
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("OTP logout error:", errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
