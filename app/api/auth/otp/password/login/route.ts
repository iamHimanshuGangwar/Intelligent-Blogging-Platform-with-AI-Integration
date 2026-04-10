import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyPassword } from '@/lib/password';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const supabase = await createClient();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, role, avatar_url')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (profile.role === 'admin') {
      return NextResponse.json({ error: 'Admin must login from admin portal' }, { status: 403 });
    }

    const { data: credentials, error: credentialsError } = await supabase
      .from('user_password_credentials')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (credentialsError || !credentials) {
      return NextResponse.json({ error: 'Password login is not setup for this account yet' }, { status: 400 });
    }

    if (credentials.locked_until && new Date(credentials.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Account temporarily locked. Try again later.' }, { status: 423 });
    }

    const ok = verifyPassword(password, credentials.password_salt, credentials.password_hash);

    if (!ok) {
      const failedAttempts = (credentials.failed_attempts || 0) + 1;
      const shouldLock = failedAttempts >= MAX_FAILED_ATTEMPTS;

      await supabase
        .from('user_password_credentials')
        .update({
          failed_attempts: failedAttempts,
          locked_until: shouldLock ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', profile.id);

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from('otp_sessions').update({ is_active: false }).eq('user_id', profile.id);

    const { error: sessionError } = await supabase
      .from('otp_sessions')
      .insert({
        user_id: profile.id,
        email: profile.email,
        session_token: sessionToken,
        device_info: request.headers.get('user-agent') || null,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        expires_at: expiresAt,
        is_active: true,
      });

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    await supabase
      .from('user_password_credentials')
      .update({
        failed_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatar_url || null,
        role: profile.role,
      },
    });

    response.cookies.set('otp_session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('otp_session', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP password login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
