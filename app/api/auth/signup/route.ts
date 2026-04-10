import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name, userId } = await request.json();

    if (!email || !name || !userId) {
      return NextResponse.json(
        { error: 'Email, name, and userId are required' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || '';
    const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

    const supabase = await createClient();
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: userId,
          email,
          name,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ], { onConflict: 'id' });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return NextResponse.json(
      { message: 'User profile created successfully.', role },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
