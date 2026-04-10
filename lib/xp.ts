import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// XP amounts for each activity
const XP_VALUES: Record<string, number> = {
  publish_post: 25,
  receive_like: 5,
  leave_comment: 10,
  forum_reply: 10,
  receive_follower: 15,
  daily_login: 5,
  generate_dna: 20,
  ghost_reader: 10,
};

// Level thresholds (XP required to reach each level)
function getLevel(xp: number): number {
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 350) return 3;
  if (xp < 700) return 4;
  if (xp < 1200) return 5;
  if (xp < 2000) return 6;
  if (xp < 3500) return 7;
  if (xp < 5500) return 8;
  if (xp < 8000) return 9;
  return 10;
}

export function getLevelProgress(xp: number): { level: number; current: number; next: number; progress: number } {
  const thresholds = [0, 50, 150, 350, 700, 1200, 2000, 3500, 5500, 8000, Infinity];
  const level = getLevel(xp);
  const current = thresholds[level - 1];
  const next = thresholds[level];
  const progress = next === Infinity ? 100 : Math.round(((xp - current) / (next - current)) * 100);
  return { level, current, next: next === Infinity ? xp : next, progress };
}

/**
 * Award XP to a user and check for new achievements
 */
export async function awardXP(
  userId: string,
  reason: keyof typeof XP_VALUES | string,
  entityType?: string,
  entityId?: string
): Promise<{ xp: number; level: number; newAchievements: string[] }> {
  const supabase = getSupabase();
  const amount = XP_VALUES[reason] || 0;
  if (amount === 0) return { xp: 0, level: 1, newAchievements: [] };

  // Insert transaction
  await supabase.from('xp_transactions').insert({
    user_id: userId,
    amount,
    reason,
    entity_type: entityType,
    entity_id: entityId,
  });

  // Upsert user_xp row
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('user_xp')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  let newXP: number;
  let streakDays: number;

  if (existing) {
    newXP = (existing.xp || 0) + amount;
    streakDays = existing.streak_days || 0;

    // Update streak
    if (existing.last_active_date) {
      const lastDate = new Date(existing.last_active_date);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000);
      if (diffDays === 1) {
        streakDays += 1;
      } else if (diffDays > 1) {
        streakDays = 1;
      }
      // diffDays === 0 means same day, keep streak as-is
    } else {
      streakDays = 1;
    }

    await supabase
      .from('user_xp')
      .update({
        xp: newXP,
        level: getLevel(newXP),
        streak_days: streakDays,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  } else {
    newXP = amount;
    streakDays = 1;
    await supabase.from('user_xp').insert({
      user_id: userId,
      xp: newXP,
      level: getLevel(newXP),
      streak_days: 1,
      last_active_date: today,
    });
  }

  // Check for new achievements
  const newAchievements = await checkAchievements(userId, supabase);

  return { xp: newXP, level: getLevel(newXP), newAchievements };
}

async function checkAchievements(userId: string, supabase: ReturnType<typeof getSupabase>): Promise<string[]> {
  // Get existing achievements
  const { data: earned } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);
  const earnedSet = new Set((earned || []).map((a) => a.achievement_id));

  // Get all achievement definitions
  const { data: allAch } = await supabase
    .from('achievements')
    .select('*');
  if (!allAch) return [];

  // Get user stats for checking thresholds
  const [postsRes, likesRes, commentsRes, forumRepliesRes, followersRes, xpRes] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'published'),
    supabase.from('posts').select('likes_count').eq('author_id', userId),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('forum_replies').select('id', { count: 'exact', head: true }).eq('author_id', userId),
    supabase.from('follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('user_xp').select('streak_days').eq('user_id', userId).maybeSingle(),
  ]);

  const postCount = postsRes.count || 0;
  const totalLikes = (likesRes.data || []).reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const commentCount = commentsRes.count || 0;
  const forumReplyCount = forumRepliesRes.count || 0;
  const followerCount = followersRes.count || 0;
  const streakDays = xpRes.data?.streak_days || 0;

  // Check DNA & Ghost Reader usage
  const { count: dnaCount } = await supabase.from('writer_dna').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  const { count: ghostCount } = await supabase.from('ghost_reader_feedback').select('id', { count: 'exact', head: true }).eq('user_id', userId);

  const statsMap: Record<string, number> = {
    first_post: postCount,
    posts_5: postCount,
    posts_25: postCount,
    posts_100: postCount,
    first_like: totalLikes,
    likes_100: totalLikes,
    likes_1000: totalLikes,
    first_comment: commentCount,
    comments_50: commentCount,
    forum_helper: forumReplyCount,
    forum_guru: forumReplyCount,
    streak_3: streakDays,
    streak_7: streakDays,
    streak_30: streakDays,
    streak_100: streakDays,
    first_follower: followerCount,
    followers_100: followerCount,
    dna_generated: dnaCount || 0,
    ghost_reader_used: ghostCount || 0,
  };

  const newlyEarned: string[] = [];

  for (const ach of allAch) {
    if (earnedSet.has(ach.id)) continue;
    const stat = statsMap[ach.id];
    if (stat !== undefined && stat >= ach.threshold) {
      // Award achievement
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: ach.id,
      });

      // Award bonus XP for achievement
      if (ach.xp_reward > 0) {
        await supabase.from('xp_transactions').insert({
          user_id: userId,
          amount: ach.xp_reward,
          reason: `achievement:${ach.id}`,
          entity_type: 'achievement',
          entity_id: ach.id,
        });
        // Update user_xp total
        const rpcResult = await supabase.rpc('increment_user_xp', { p_user_id: userId, p_amount: ach.xp_reward });
        if (rpcResult.error) {
          // Fallback if RPC doesn't exist
          const { data } = await supabase.from('user_xp')
            .select('xp')
            .eq('user_id', userId)
            .maybeSingle();
          if (data) {
            const newTotal = (data.xp || 0) + ach.xp_reward;
            await supabase.from('user_xp').update({ xp: newTotal, level: getLevel(newTotal) }).eq('user_id', userId);
          }
        }
      }
      newlyEarned.push(ach.id);
    }
  }

  return newlyEarned;
}
