import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthUserId } from '@/lib/auth-helpers';
import { getLevelProgress } from '@/lib/xp';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/xp — Get current user's XP, level, achievements, and leaderboard
 * GET /api/xp?userId=xxx — Get specific user's public XP profile
 * GET /api/xp?leaderboard=true — Get weekly/monthly leaderboard
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const params = request.nextUrl.searchParams;
  const leaderboard = params.get('leaderboard');

  // Leaderboard mode
  if (leaderboard) {
    const query = supabase
      .from('user_xp')
      .select('user_id, xp, level, streak_days')
      .order('xp', { ascending: false })
      .limit(50);

    const { data: leaders } = await query;
    if (!leaders || leaders.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // Get profile info for leaders
    const userIds = leaders.map((l) => l.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const lb = leaders.map((l, i) => ({
      rank: i + 1,
      user_id: l.user_id,
      name: profileMap.get(l.user_id)?.name || 'Anonymous',
      avatar_url: profileMap.get(l.user_id)?.avatar_url,
      xp: l.xp,
      level: l.level,
      streak_days: l.streak_days,
    }));

    return NextResponse.json({ leaderboard: lb });
  }

  // User XP mode
  const targetUserId = params.get('userId') || await getAuthUserId(request);
  if (!targetUserId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const [xpRes, achRes, allAchRes, recentXpRes] = await Promise.all([
    supabase.from('user_xp').select('*').eq('user_id', targetUserId).maybeSingle(),
    supabase.from('user_achievements').select('achievement_id, earned_at').eq('user_id', targetUserId).order('earned_at', { ascending: false }),
    supabase.from('achievements').select('*').order('sort_order'),
    supabase.from('xp_transactions').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }).limit(20),
  ]);

  const xpData = xpRes.data || { xp: 0, level: 1, streak_days: 0 };
  const levelInfo = getLevelProgress(xpData.xp || 0);

  const earnedSet = new Set((achRes.data || []).map((a) => a.achievement_id));
  const achievements = (allAchRes.data || []).map((ach) => ({
    ...ach,
    earned: earnedSet.has(ach.id),
    earned_at: achRes.data?.find((a) => a.achievement_id === ach.id)?.earned_at || null,
  }));

  return NextResponse.json({
    xp: xpData.xp || 0,
    level: levelInfo.level,
    levelProgress: levelInfo,
    streak_days: xpData.streak_days || 0,
    achievements,
    recentXP: recentXpRes.data || [],
    stats: {
      total: allAchRes.data?.length || 0,
      earned: achRes.data?.length || 0,
    },
  });
}
