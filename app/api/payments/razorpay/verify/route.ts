import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

async function resolveAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  try {
    const clerkAuth = await auth();
    if (clerkAuth.userId) return clerkAuth.userId;
  } catch { /* continue */ }

  const supabase = await createClient();
  const otpToken = request.cookies.get('otp_session_token')?.value;
  if (!otpToken) return null;

  const { data: session } = await supabase
    .from('otp_sessions')
    .select('user_id, expires_at, is_active')
    .eq('session_token', otpToken)
    .maybeSingle();

  if (!session?.is_active || new Date(session.expires_at) <= new Date()) return null;
  return session.user_id as string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, planId, amount, currency = 'INR' } = body;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'orderId, paymentId and signature are required' }, { status: 400 });
    }

    // Resolve userId server-side — never trust client-supplied userId
    const userId = await resolveAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 503 });
    }

    const supabase = await createClient();

    // ── Idempotency check ───────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('processed_payments')
      .select('order_id, payment_id, verified_at')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        valid: true,
        idempotent: true,
        message: 'Payment already verified',
        verifiedAt: existing.verified_at,
      });
    }

    // ── Signature verification (constant-time) ──────────────────────────────
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    let isValid = false;
    try {
      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      isValid =
        sigBuffer.length === expectedBuffer.length &&
        crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      return NextResponse.json({ valid: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    // ── Record verified payment (idempotency store) ─────────────────────────
    const { error: insertError } = await supabase.from('processed_payments').insert({
      order_id: orderId,
      payment_id: paymentId,
      user_id: userId,
      amount: typeof amount === 'number' ? amount : null,
      currency,
      plan_id: typeof planId === 'string' ? planId : null,
    });

    if (insertError) {
      console.error('Razorpay verify: failed to record payment:', insertError.message);
      // Don't fail the user — payment is valid; record failure is non-fatal
    }

    return NextResponse.json({ valid: true, idempotent: false });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

