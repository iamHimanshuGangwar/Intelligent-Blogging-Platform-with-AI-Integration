import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/career/badges?userId=xxx — Get user's earned badges
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: badges, error } = await supabase
    .from('user_skill_badges')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
  }

  // Also fetch all badge definitions for unearned display
  const { data: definitions } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('tier');

  const earnedIds = new Set((badges || []).map((b) => b.badge_id));
  const allBadges = (definitions || []).map((def) => ({
    ...def,
    earned: earnedIds.has(def.badge_id),
    earned_at: badges?.find((b) => b.badge_id === def.badge_id)?.earned_at || null,
  }));

  return NextResponse.json({
    earned: badges || [],
    all: allBadges,
    stats: {
      total: definitions?.length || 0,
      earned: badges?.length || 0,
    },
  });
}
