/**
 * Resend email verification endpoint.
 * For OTP-based users: re-sends an OTP code to verify email ownership.
 * Works in tandem with /api/auth/otp/send and /api/auth/otp/verify.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';
import { checkRateLimit, getRequestIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limit: same as OTP send — 5 per 5 minutes
  const rateLimited = await checkRateLimit(
    request,
    `resend-verify:${getRequestIdentifier(request)}`,
    RATE_LIMITS.OTP_SEND
  );
  if (rateLimited) return rateLimited;

  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch the user's email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, email_verified')
      .eq('id', userId)
      .maybeSingle();

    if (!profile?.email) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (profile.email_verified) {
      return NextResponse.json({ message: 'Email is already verified.', alreadyVerified: true });
    }

    // Delegate to the OTP send endpoint (reuse its full logic)
    const sendResponse = await fetch(new URL('/api/auth/otp/send', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '' },
      body: JSON.stringify({ email: profile.email }),
    });

    const sendData = await sendResponse.json();
    if (!sendResponse.ok) {
      return NextResponse.json({ error: sendData.error || 'Failed to send verification email' }, { status: sendResponse.status });
    }

    return NextResponse.json({
      message: `Verification code sent to ${profile.email}. Check your inbox.`,
      email: profile.email,
    });
  } catch (err) {
    console.error('[resend-verification] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET: Check verification status of the current user.
 */
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, email_verified, email_verified_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({
    email: profile.email,
    verified: !!profile.email_verified,
    verifiedAt: profile.email_verified_at ?? null,
  });
}
