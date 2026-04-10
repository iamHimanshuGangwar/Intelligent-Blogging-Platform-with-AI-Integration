import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';
import { generateSalt, hashPassword } from '@/lib/password';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getAuthUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (profile.role === 'admin') {
      return NextResponse.json({ error: 'Admin password is managed via admin login only' }, { status: 403 });
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const { error } = await supabase
      .from('user_password_credentials')
      .upsert(
        {
          user_id: userId,
          password_hash: passwordHash,
          password_salt: salt,
          password_set_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          failed_attempts: 0,
          locked_until: null,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password set successfully' });
  } catch (error) {
    console.error('Set OTP password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
