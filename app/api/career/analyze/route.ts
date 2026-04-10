import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyzeWriterSkills, getAIProviderStatus } from '@/lib/gemini';
import { checkRateLimit, getRequestIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/career/analyze — AI-powered skill assessment from published posts
 */
export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(
    request,
    `career:analyze:${getRequestIdentifier(request)}`,
    RATE_LIMITS.AI_GENERATE
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { userId } = await request.json();
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const aiStatus = getAIProviderStatus();
    if (!aiStatus.configured) {
      return NextResponse.json({ error: 'AI not configured', code: 'MISSING_API_KEY' }, { status: 503 });
    }

    const supabase = getSupabase();

    // Fetch user's published posts
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('title, topic, content, views')
      .eq('user_id', userId)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) {
      return NextResponse.json({
        error: 'No published posts found. Write and publish posts to get your skill assessment.',
        code: 'NO_POSTS',
      }, { status: 404 });
    }

    // Generate AI analysis
    const rawAnalysis = await analyzeWriterSkills(posts);

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = rawAnalysis.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawAnalysis];
      analysis = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI analysis' }, { status: 500 });
    }

    // Store assessment
    const { error: upsertError } = await supabase
      .from('user_skill_assessments')
      .upsert({
        user_id: userId,
        assessment: analysis,
        career_stage: analysis.career_stage || 'novice',
        skills: analysis.skills || [],
        strengths: analysis.strengths || [],
        growth_areas: analysis.growth_areas || [],
        next_steps: analysis.next_steps || [],
        posts_analyzed: posts.length,
        assessed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) console.warn('Failed to save assessment:', upsertError);

    // Check and award badges based on post data
    await checkAndAwardBadges(userId, posts);

    return NextResponse.json({ analysis, postsAnalyzed: posts.length });
  } catch (error: any) {
    console.error('Career analysis error:', error.message);
    return NextResponse.json({ error: 'Failed to analyze career skills' }, { status: 500 });
  }
}

/**
 * GET /api/career/analyze?userId=xxx — Get stored assessment
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: assessment } = await supabase
    .from('user_skill_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('assessed_at', { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({ assessment: assessment || null });
}

async function checkAndAwardBadges(
  userId: string,
  posts: { title: string; topic: string; content: string; views: number }[]
) {
  const supabase = getSupabase();
  // Fetch badge definitions
  const { data: definitions } = await supabase
    .from('badge_definitions')
    .select('*');

  if (!definitions) return;

  // Fetch existing badges
  const { data: existing } = await supabase
    .from('user_skill_badges')
    .select('badge_id')
    .eq('user_id', userId);

  const ownedIds = new Set((existing || []).map((b) => b.badge_id));
  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const topicCounts: Record<string, number> = {};
  for (const post of posts) {
    const t = post.topic || 'General';
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  }

  const newBadges: {
    user_id: string;
    badge_id: string;
    badge_name: string;
    badge_icon: string;
    badge_category: string;
    badge_tier: string;
    description: string;
  }[] = [];

  for (const def of definitions) {
    if (ownedIds.has(def.badge_id)) continue;
    const criteria = def.criteria as Record<string, any>;
    let earned = false;

    if (criteria.posts_min && !criteria.topic) {
      earned = posts.length >= criteria.posts_min;
    } else if (criteria.views_min) {
      earned = totalViews >= criteria.views_min;
    } else if (criteria.topic && criteria.posts_min) {
      earned = (topicCounts[criteria.topic] || 0) >= criteria.posts_min;
    }

    if (earned) {
      newBadges.push({
        user_id: userId,
        badge_id: def.badge_id,
        badge_name: def.name,
        badge_icon: def.icon,
        badge_category: def.category,
        badge_tier: def.tier,
        description: def.description,
      });
    }
  }

  if (newBadges.length > 0) {
    await supabase.from('user_skill_badges').upsert(newBadges, { onConflict: 'user_id,badge_id' });
  }
}
