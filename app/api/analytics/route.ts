import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { verifyAdminSessionCookie } from '@/lib/admin-auth';

// POST track an analytics event
export async function POST(request: NextRequest) {
  try {
    const clerkAuth = await auth();
    const body = await request.json();
    const { event_type, event_data, source } = body;

    if (!event_type) {
      return NextResponse.json({ error: 'event_type is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('analytics_events')
      .insert([
        {
          user_id: clerkAuth.userId || null,
          event_type,
          event_data: event_data || {},
          source: source || 'web',
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Track event error:', errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET analytics summary (admin only)
export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;
    
    // Try Clerk auth
    try {
      const clerkAuth = await auth();
      userId = clerkAuth.userId || null;
    } catch {}
    
    // Fall back to admin session cookie
    if (!userId) {
      const adminEmail = verifyAdminSessionCookie(request);
      if (adminEmail) {
        userId = adminEmail;
      }
    }
    
    // Fall back to OTP session
    if (!userId) {
      try {
        const supabase = await createClient();
        const otpToken = request.cookies.get("otp_session_token")?.value;
        
        if (otpToken) {
          const { data: sessions } = await supabase
            .from('otp_sessions')
            .select('user_id')
            .eq('session_token', otpToken)
            .eq('is_active', true)
            .single();
          
          if (sessions?.user_id) {
            userId = sessions.user_id;
          }
        }
      } catch {}
    }
    
    // If userId came from admin session cookie, it's an email — mark as verified admin directly
    let isVerifiedAdmin = false;
    const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '').toLowerCase();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // If userId is the admin email (from cookie auth), skip profile lookup
    if (userId.includes('@') && userId.toLowerCase() === adminEmail) {
      isVerifiedAdmin = true;
    } else {
      // Verify admin via profile lookup (Clerk / OTP user IDs)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.role === 'admin') {
        isVerifiedAdmin = true;
      }
    }

    if (!isVerifiedAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || '7d'; // '24h', '7d', '30d', 'all'

    let daysAgo = 7;
    if (timeframe === '24h') daysAgo = 1;
    if (timeframe === '30d') daysAgo = 30;
    if (timeframe === 'all') daysAgo = 999999;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    // Get event counts by type
    const { data: eventCounts } = await supabase
      .from('analytics_events')
      .select('event_type', { count: 'exact' })
      .gte('created_at', cutoffDate.toISOString())
      .then((res) => {
        // Group by event type
        const counts: Record<string, number> = {};
        (res.data || []).forEach((item: any) => {
          counts[item.event_type] = (counts[item.event_type] || 0) + 1;
        });
        return { data: counts };
      });

    // Get total users
    const { data: _users, count: totalUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .limit(1);

    // Get total posts (only approved ones)
    const { data: _posts, count: totalPosts } = await supabase
      .from('posts')
      .select('id', { count: 'exact' })
      .eq('status', 'published')
      .or('approval_status.eq.approved,approval_status.is.null')
      .limit(1);

    // Get active subscriptions
    const { data: _subscriptions, count: activeSubscriptions } = await supabase
      .from('user_subscriptions')
      .select('id', { count: 'exact' })
      .eq('status', 'active')
      .limit(1);

    // Get job applications
    const { data: _applications, count: totalApplications } = await supabase
      .from('job_applications')
      .select('id', { count: 'exact' })
      .gte('applied_at', cutoffDate.toISOString())
      .limit(1);

    // Get open jobs
    const { data: _jobs, count: openJobs } = await supabase
      .from('job_listings')
      .select('id', { count: 'exact' })
      .eq('status', 'open')
      .limit(1);

    // Get recent user activity
    const { data: recentActivity } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      timeframe,
      summary: {
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        activeSubscriptions: activeSubscriptions || 0,
        jobApplicationsThisPeriod: totalApplications || 0,
        openJobs: openJobs || 0,
      },
      eventBreakdown: eventCounts || {},
      recentActivity: recentActivity || [],
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Get analytics error:', errorMsg);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
