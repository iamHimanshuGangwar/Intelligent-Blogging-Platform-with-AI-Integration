import { NextResponse } from 'next/server';

/**
 * Admin Logout Endpoint
 * POST /api/admin/logout
 * 
 * Clears admin session and redirects to home or login
 */

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: 'Admin logout successful'
      },
      { status: 200 }
    );

    response.cookies.set('admin_session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
