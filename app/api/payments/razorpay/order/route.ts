import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';

async function resolveAuthenticatedUserId(request: NextRequest) {
  try {
    const clerkAuth = await auth();
    if (clerkAuth.userId) return clerkAuth.userId;
  } catch {}

  const supabase = await createClient();
  const otpToken = request.cookies.get('otp_session_token')?.value;
  if (!otpToken) return null;

  const { data: session } = await supabase
    .from('otp_sessions')
    .select('user_id, expires_at, is_active')
    .eq('session_token', otpToken)
    .single();

  if (!session || !session.is_active || new Date(session.expires_at) <= new Date()) {
    return null;
  }

  return session.user_id as string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, billingCycle } = await request.json();
    if (!planId || !['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json({ error: 'planId and billingCycle are required' }, { status: 400 });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 503 });
    }

    const supabase = await createClient();
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id,name,price_monthly,price_annual')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const rawAmount = billingCycle === 'annual' ? plan.price_annual : plan.price_monthly;
    const amountInPaise = Math.max(0, Math.round(Number(rawAmount || 0) * 100));

    if (amountInPaise <= 0) {
      return NextResponse.json({ error: 'This plan does not require Razorpay payment' }, { status: 400 });
    }

    const authHeader = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `aiblog-${plan.id}-${Date.now()}`,
        notes: {
          userId,
          planId,
          billingCycle,
        },
      }),
      cache: 'no-store',
    });

    const razorpayPayload = await razorpayRes.json();

    if (!razorpayRes.ok) {
      return NextResponse.json(
        { error: razorpayPayload?.error?.description || 'Failed to create Razorpay order' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      order: razorpayPayload,
      keyId: razorpayKeyId,
      amount: amountInPaise,
      currency: 'INR',
      plan: {
        id: plan.id,
        name: plan.name,
        billingCycle,
      },
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
