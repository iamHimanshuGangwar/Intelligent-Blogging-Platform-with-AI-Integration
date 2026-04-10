import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';
import { logActivity } from '@/lib/activity-log';

export async function POST(request: NextRequest) {
  try {
    const { email, code, name: providedName } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find the OTP record — use maybeSingle() to avoid crashing on 0 or multiple rows
    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code.trim())
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError || !otpRecord) {
      // Log failed attempt (non-fatal)
      void supabase.from('otp_login_audit').insert({
        email: normalizedEmail,
        status: 'wrong_code',
        device_info: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    // Check expiry
    if (new Date(otpRecord.expires_at) < new Date()) {
      void supabase.from('otp_login_audit').insert({
        email: normalizedEmail,
        status: 'code_expired',
        device_info: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json({ error: 'Code has expired. Please request a new one.' }, { status: 401 });
    }

    // Mark OTP as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('email', normalizedEmail)
      .eq('code', code);

    // Upsert user profile so they exist in the database
    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';
    if (normalizedEmail === adminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Admin email must use admin email/password login.' },
        { status: 403 }
      );
    }

    const role = 'user';
    const fallbackProfileId = `otp_${normalizedEmail.replace(/[^a-z0-9]/gi, '_')}`;
    const userName = providedName?.trim() || normalizedEmail.split('@')[0];

    // Reuse existing profile by email when it already exists (e.g. Clerk-created rows).
    // This prevents unique email constraint violations when a profile for this email
    // already exists under a different ID.
    const existingProfileLookup = await supabase
      .from('profiles')
      .select('id, email, name, role, avatar_url')
      .eq('email', normalizedEmail)
      .maybeSingle();

    const targetProfileId = existingProfileLookup.data?.id || fallbackProfileId;

    let profile = existingProfileLookup.data;

    if (profile && providedName?.trim() && profile.name !== providedName.trim()) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({ name: providedName.trim() })
        .eq('id', profile.id)
        .select('id, email, name, role, avatar_url')
        .maybeSingle();

      if (updatedProfile) {
        profile = updatedProfile;
      }
    }

    // Only upsert a new profile row when no existing profile was found for this email.
    if (!profile) {
      let profileResult = await supabase
        .from('profiles')
        .upsert(
          [{
            id: targetProfileId,
            email: normalizedEmail,
            name: userName,
            role,
            updated_at: new Date().toISOString(),
          }],
          { onConflict: 'id' }
        )
        .select()
        .single();

      if (profileResult.error) {
        // Fallback: try without updated_at for schemas that lack the column.
        profileResult = await supabase
          .from('profiles')
          .upsert(
            [{ id: targetProfileId, email: normalizedEmail, name: userName, role }],
            { onConflict: 'id' }
          )
          .select()
          .single();
      }

      if (profileResult.error) {
        // Last resort: try a plain insert, ignoring conflict.
        await supabase.from('profiles').insert({ id: targetProfileId, email: normalizedEmail, name: userName, role }).select().maybeSingle();
        // Re-fetch after insert attempt
        const refetch = await supabase.from('profiles').select('id, email, name, role, avatar_url').eq('id', targetProfileId).maybeSingle();
        if (refetch.data) {
          profile = refetch.data;
        }
      } else {
        profile = profileResult.data;
      }

      // If still no profile after all attempts, re-fetch by email one more time.
      if (!profile) {
        const retryLookup = await supabase.from('profiles').select('id, email, name, role, avatar_url').eq('email', normalizedEmail).maybeSingle();
        if (retryLookup.data) {
          profile = retryLookup.data;
        }
      }

      if (!profile) {
        console.error('Profile creation failed for email:', normalizedEmail);
        return NextResponse.json(
          { error: 'Failed to create user profile. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create OTP session in database
    const { data: _session, error: sessionError } = await supabase
      .from('otp_sessions')
      .insert({
        user_id: targetProfileId,
        email: normalizedEmail,
        session_token: sessionToken,
        device_info: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        expires_at: expiresAt.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create user session. Please try again.' },
        { status: 500 }
      );
    }

    // Log successful login (non-fatal — table may not exist in all environments)
    void supabase.from('otp_login_audit').insert({
      email: normalizedEmail,
      user_id: targetProfileId,
      status: 'success',
      device_info: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    });

    // Mark email as verified (OTP verification proves email ownership)
    void supabase
      .from('profiles')
      .update({ email_verified: true, email_verified_at: new Date().toISOString() })
      .eq('id', targetProfileId);

    // Track sign-in event
    logActivity({
      userId: targetProfileId,
      activityType: 'otp_signin',
      entityType: 'user',
      entityId: targetProfileId,
      metadata: { email: normalizedEmail, method: 'otp' },
    }).catch(() => {});

    // Prepare user object to send to client
    const userData = {
      id: profile?.id || targetProfileId,
      email: normalizedEmail,
      name: profile?.name || userName,
      avatar_url: profile?.avatar_url || null,
      role: profile?.role || role,
    };

    const { data: credentialRow } = await supabase
      .from('user_password_credentials')
      .select('user_id')
      .eq('user_id', userData.id)
      .maybeSingle();

    // Set both session cookie AND httpOnly cookie for enhanced security
    const response = NextResponse.json(
      {
        message: 'OTP verified successfully',
        user: userData,
        session_token: sessionToken, // Return token for client-side use
        passwordConfigured: !!credentialRow,
      },
      { status: 200 }
    );

    // Set httpOnly cookie with session token
    response.cookies.set('otp_session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Non-httpOnly companion flag so client JS can detect OTP session
    response.cookies.set('otp_session', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
