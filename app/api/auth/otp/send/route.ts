import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import nodemailer from 'nodemailer';
import { retryWithExponentialBackoff, isRateLimitError, isConfigError } from '@/lib/retry';
import { checkRateLimit, getRequestIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' ? true : false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
  },
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function isOtpDevTestMode(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.OTP_DEV_TEST_MODE === 'true';
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 OTP sends per 5 minutes per IP
  const rateLimitResponse = await checkRateLimit(
    request,
    `otp:send:${getRequestIdentifier(request)}`,
    RATE_LIMITS.OTP_SEND
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@gmail.com';
    if (normalizedEmail === adminEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Admin email must use admin email/password login.' },
        { status: 403 }
      );
    }

    // Validate Supabase is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_actual_')) {
      console.error('Supabase Service Role Key not configured');
      return NextResponse.json(
        { 
          error: 'OTP service temporarily unavailable. Please try again later.',
          details: 'Development: Set SUPABASE_SERVICE_ROLE_KEY in .env.local'
        }, 
        { status: 503 }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    try {
      const supabase = await createClient();

      // Store OTP in database (upsert so resending replaces old OTP)
      const { error: dbError } = await supabase
        .from('otp_codes')
        .upsert(
          [{ email: normalizedEmail, code: otp, expires_at: expiresAt, verified: false }],
          { onConflict: 'email' }
        );

      if (dbError) {
        console.error('OTP store error:', dbError);
        
        // If schema doesn't exist, return a helpful message
        if (dbError.message?.includes('does not exist')) {
          return NextResponse.json(
            { 
              error: 'OTP service not initialized. Please run database migrations.',
              otp: isOtpDevTestMode() ? otp : undefined
            }, 
            { status: 503 }
          );
        }
        
        return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
      }
    } catch (supabaseError: any) {
      console.error('Supabase connection error:', supabaseError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 503 }
      );
    }

    // Validate SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('SMTP not configured');
      return NextResponse.json(
        { 
          error: 'Email service not configured. OTP stored but could not be sent.',
          debug: process.env.NODE_ENV === 'development' ? {
            message: 'Configure SMTP variables in .env.local',
            variables: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'],
            gmailSetup: 'Get App Password from: https://myaccount.google.com/apppasswords',
            testEndpoint: '/api/admin/test-smtp'
          } : undefined,
          otp: isOtpDevTestMode() ? otp : undefined
        }, 
        { status: 503 }
      );
    }

    try {
      const transporter = createTransporter();
      
      // Try to send with retry logic
      await retryWithExponentialBackoff(
        async () => {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `AiBlog <${process.env.SMTP_USER}>`,
            to: normalizedEmail,
            subject: 'Your AiBlog Login Code',
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #121212; color: #e0e0e0;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="font-size: 24px; font-weight: 800; color: #fff; margin: 0;">AiBlog</h1>
                </div>
                <p style="font-size: 15px; color: #b0b0b0; margin-bottom: 24px;">Your one-time login code is:</p>
                <div style="text-align: center; margin: 24px 0;">
                  <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #fff; background: #1e1e1e; padding: 16px 32px; border-radius: 12px; border: 1px solid #333;">
                    ${otp}
                  </span>
                </div>
                <p style="font-size: 13px; color: #888; text-align: center;">This code expires in 10 minutes. Do not share it.</p>
                <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />
                <p style="font-size: 11px; color: #666; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
              </div>
            `,
          });
        },
        { maxRetries: 2, initialDelayMs: 1000, maxDelayMs: 5000 }
      );

      return NextResponse.json({
        message: 'OTP sent successfully',
        otp: isOtpDevTestMode() ? otp : undefined,
        testMode: isOtpDevTestMode(),
      });
    } catch (emailError: any) {
      console.error('Email send error:', emailError);
      
      // Determine error type and provide helpful guidance
      const isRateLimit = isRateLimitError(emailError);
      const isConfig = isConfigError(emailError);
      
      if (isRateLimit) {
        return NextResponse.json(
          { 
            error: 'Too many OTP requests. Please wait a few minutes before trying again.',
            code: 'RATE_LIMIT',
            otp: isOtpDevTestMode() ? otp : undefined
          }, 
          { status: 429 }
        );
      }
      
      if (isConfig) {
        return NextResponse.json(
          { 
            error: 'Email configuration error. OTP generated but could not send.',
            code: 'CONFIG_ERROR',
            debug: process.env.NODE_ENV === 'development' ? {
              message: emailError.message,
              solution: 'Verify SMTP credentials. For Gmail, use App Password: https://myaccount.google.com/apppasswords',
              testEndpoint: '/api/admin/test-smtp'
            } : undefined,
            otp: isOtpDevTestMode() ? otp : undefined
          }, 
          { status: 503 }
        );
      }
      
      // OTP is stored but email failed
      return NextResponse.json(
        { 
          error: 'OTP generated but email sending failed. Please try again or check your email configuration.',
          code: 'EMAIL_SEND_FAILED',
          debug: process.env.NODE_ENV === 'development' ? {
            originalError: emailError.message,
            errorCode: emailError.code
          } : undefined,
          otp: isOtpDevTestMode() ? otp : undefined
        }, 
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
