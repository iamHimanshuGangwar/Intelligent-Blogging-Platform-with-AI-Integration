import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Verify HMAC-signed admin session cookie token.
 * Returns the admin email if valid, null otherwise.
 */
export function verifyAdminSessionCookie(request: NextRequest): string | null {
  const adminSessionToken = request.cookies.get('admin_session_token')?.value;
  if (!adminSessionToken) return null;

  try {
    const decoded = Buffer.from(adminSessionToken, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length < 3) return null;

    const hmac = parts.pop()!;
    const payload = parts.join(':');
    const [email] = parts;
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase();
    if (!email || email.toLowerCase() !== adminEmail) return null;

    // Verify HMAC signature
    const secret = process.env.ADMIN_SESSION_SECRET || process.env.CLERK_SECRET_KEY;
    if (!secret) {
      console.error('Admin session verification failed: ADMIN_SESSION_SECRET or CLERK_SECRET_KEY must be set');
      return null;
    }
    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expectedHmac, 'hex'))) {
      return null;
    }

    return email;
  } catch {
    return null;
  }
}

/**
 * Middleware to verify admin access
 * Use this in admin API routes to verify the user is an admin
 */

export function verifyAdminStatus(user: any): boolean {
  if (!user) return false;
  
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase();
  if (!adminEmail) return false;
  return user.email?.toLowerCase() === adminEmail;
}

/**
 * Verify admin token/session
 */
export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  
  // Check if token matches admin token in environment
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  } catch {
    return false;
  }
}

/**
 * Extract user info from request headers or cookies
 */
export function getAdminFromRequest(request: NextRequest): {
  email?: string;
  role?: string;
  isAdmin?: boolean;
} | null {
  // Method 1: Check authorization header (JWT or bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (verifyAdminToken(token)) {
      return { 
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
        isAdmin: true
      };
    }
  }

  // Method 2: Check admin token in headers
  const adminToken = request.headers.get('x-admin-token');
  if (adminToken && verifyAdminToken(adminToken)) {
    return {
      email: process.env.ADMIN_EMAIL,
      role: 'admin',
      isAdmin: true
    };
  }

  // Method 3: Check localStorage data passed in request body (if applicable)
  // This would need to be handled in individual routes

  return null;
}

/**
 * Middleware function to protect admin routes
 */
export function requireAdmin(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      // Verify admin token/session
      const admin = getAdminFromRequest(request);
      
      if (!admin || !admin.isAdmin) {
        return NextResponse.json(
          { 
            error: 'Unauthorized',
            message: 'Admin access required'
          },
          { status: 403 }
        );
      }

      return await handler(request);
    } catch (error) {
      console.error('Admin verification error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}
