import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!profile || profile.role === 'admin') {
      return NextResponse.json({ success: true, message: 'If the account exists, a reset link has been issued.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase.from('password_reset_tokens').update({ used_at: new Date().toISOString() }).eq('user_id', profile.id).is('used_at', null);

    const { error } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: profile.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // In development return token for testing. In production this should be emailed.
    const payload: Record<string, unknown> = {
      success: true,
      message: 'Password reset request submitted',
    };

    if (process.env.NODE_ENV !== 'production') {
      payload.resetToken = rawToken;
      payload.expiresAt = expiresAt;
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
