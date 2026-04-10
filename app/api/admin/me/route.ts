import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

/**
 * GET /api/admin/me
 * Lightweight endpoint — validates admin_session_token cookie (HMAC-signed) and returns admin profile.
 * Used by AuthContext to detect admin sessions without hitting heavy activity endpoints.
 */
export async function GET(request: NextRequest) {
  const email = verifyAdminSessionCookie(request);

  if (!email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';

  return NextResponse.json({
    admin: {
      id: 'admin-session',
      email: adminEmail,
      name: process.env.ADMIN_DISPLAY_NAME || 'Administrator',
      role: 'admin',
    },
  });
}
