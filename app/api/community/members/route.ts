import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

// GET members with follow status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const userId = await getAuthUserId(request);
    const limit = request.nextUrl.searchParams.get('limit') || '20';

    // Get all profiles (excluding current user)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url, bio, role')
      .limit(parseInt(limit));

    if (error) throw error;

    // Get follow relationships
    const memberIds = (data || []).map(m => m.id);
    let followData: any[] = [];

    if (userId && memberIds.length > 0) {
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', userId)
        .in('following_id', memberIds);

      followData = follows || [];
    }

    const followingIds = new Set(followData.map(f => f.following_id));
    const members = (data || []).map(m => ({
      ...m,
      isFollowing: followingIds.has(m.id),
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}
