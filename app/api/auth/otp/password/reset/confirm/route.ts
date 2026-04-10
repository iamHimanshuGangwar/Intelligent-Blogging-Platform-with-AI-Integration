import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateSalt, hashPassword } from '@/lib/password';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and newPassword are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const tokenHash = hashToken(token);

    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .maybeSingle();

    if (tokenError || !resetToken) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 400 });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(newPassword, salt);

    const { error: upsertError } = await supabase
      .from('user_password_credentials')
      .upsert(
        {
          user_id: resetToken.user_id,
          password_hash: passwordHash,
          password_salt: salt,
          password_set_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          failed_attempts: 0,
          locked_until: null,
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetToken.id);

    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
