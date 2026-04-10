import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { auth } from '@clerk/nextjs/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (userId) {
      const { createClient } = await import('@/utils/supabase/server');
      const supabase = await createClient();
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (profile?.role === 'admin') return true;
    }
  } catch { /* fallback */ }
  return !!verifyAdminSessionCookie(request);
}

/**
 * Test SMTP Configuration
 * POST /api/admin/test-smtp
 * 
 * Use this to verify your email configuration is working correctly.
 * For Gmail: Use an App Password, not your account password.
 * Get App Password: https://myaccount.google.com/apppasswords
 */

export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { testEmail } = await request.json();

    if (!testEmail) {
      return NextResponse.json(
        { error: 'testEmail is required' },
        { status: 400 }
      );
    }

    // Validate SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: 'SMTP not configured',
          missingVariables: {
            hasSmtpUser: !!process.env.SMTP_USER,
            hasSmtpPassword: !!process.env.SMTP_PASSWORD,
            hasSmtpHost: !!process.env.SMTP_HOST,
            hasSmtpPort: !!process.env.SMTP_PORT,
          },
          setup: {
            message: 'Please configure SMTP in your .env.local file',
            gmailSetup: 'https://myaccount.google.com/apppasswords',
            docs: 'https://nodemailer.com/smtp/gmail/'
          }
        },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    const verified = await transporter.verify();

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'SMTP connection failed',
          message: 'Could not verify SMTP credentials. Check your email/password.',
          debugging: {
            provider: 'Gmail',
            solution: 'Use an App Password from https://myaccount.google.com/apppasswords',
            commonIssues: [
              '❌ Using your Gmail password instead of App Password',
              '❌ App Password not enabled on your Google Account',
              '❌ Gmail blocking the connection (2FA issues)',
              '❌ Incorrect SMTP_USER or SMTP_PASSWORD'
            ],
            steps: [
              '1. Go to https://myaccount.google.com/apppasswords',
              '2. Select "Mail" and "Windows Computer" (or your device)',
              '3. Copy the generated 16-character password',
              '4. Paste it in SMTP_PASSWORD in .env.local',
              '5. Try again'
            ]
          }
        },
        { status: 400 }
      );
    }

    // Send test email
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || `AiBlog <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '✅ AiBlog SMTP Configuration Test',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #121212; color: #e0e0e0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #4ade80;">✅ SMTP Configuration Working!</h1>
          </div>
          <p style="font-size: 15px; color: #b0b0b0; margin-bottom: 16px;">
            Your email configuration is correctly set up. 
          </p>
          <div style="background: #1e1e1e; padding: 16px; border-radius: 8px; border: 1px solid #4ade80; font-size: 12px; color: #888;">
            <p><strong>Configuration:</strong></p>
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>SMTP Host: ${process.env.SMTP_HOST}</li>
              <li>SMTP Port: ${process.env.SMTP_PORT}</li>
              <li>From: ${process.env.SMTP_FROM || process.env.SMTP_USER}</li>
            </ul>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 24px;">
            You can now send OTP codes and emails from your application.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'SMTP configuration is working correctly!',
        testEmailSent: testEmail,
        messageId: result.messageId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('SMTP test error:', error);

    const suggestions: Record<string, string> = {
      'EAUTH': 'Authentication failed. Verify SMTP_USER and SMTP_PASSWORD are correct.',
      'ECONNREFUSED': 'Could not connect to SMTP server. Check SMTP_HOST and SMTP_PORT.',
      'ETIMEDOUT': 'Connection timeout. Check your internet connection or firewall.',
      'EHOSTUNREACH': 'SMTP host unreachable. Verify SMTP_HOST is correct.'
    };

    const errorCode = (error as any).code || 'UNKNOWN';
    const suggestion = suggestions[errorCode] || 'Check your SMTP configuration in .env.local';

    return NextResponse.json(
      {
        success: false,
        error: 'SMTP connection failed',
        message: (error as any).message || 'Unknown error',
        errorCode: errorCode,
        suggestion: suggestion,
        debugging: {
          errorCode: errorCode,
          message: error.message,
          gmail: 'If using Gmail: Get App Password from https://myaccount.google.com/apppasswords'
        }
      },
      { status: 400 }
    );
  }
}
