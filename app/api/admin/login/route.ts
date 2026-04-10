import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { logActivity } from '@/lib/activity-log';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

function signToken(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET or CLERK_SECRET_KEY must be configured');
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit admin login attempts
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimitResponse = await checkRateLimit(request, `admin-login:${ip}`, RATE_LIMITS.AUTH);
    if (rateLimitResponse) return rateLimitResponse;

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get admin credentials from server-side environment only
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || '';

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    // Simple credential check
    if (email.toLowerCase() === adminEmail && password === adminPassword) {
      const response = NextResponse.json(
        {
          message: 'Admin login successful',
          admin: {
            email: adminEmail,
            role: 'admin',
          },
        },
        { status: 200 }
      );

      const tokenPayload = `${adminEmail}:${Date.now()}`;
      const token = signToken(tokenPayload);

      response.cookies.set('admin_session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
      });

      // Non-httpOnly flag so client JS can detect admin session exists
      // (carries no secret data — just a boolean indicator)
      response.cookies.set('admin_session_active', '1', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
      });

      // Track admin login
      logActivity({
        userId: adminEmail,
        activityType: 'admin_login',
        entityType: 'user',
        entityId: adminEmail,
        metadata: { email: adminEmail, method: 'admin_password' },
      }).catch(() => {});

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
