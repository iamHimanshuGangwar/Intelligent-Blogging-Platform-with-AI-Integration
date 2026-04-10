import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

type RecommendationItem = {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  topic?: string;
  cover_image_url?: string;
  views: number;
  likes_count: number;
  score: number;
  reason: string;
  profiles?: { id: string; name: string; avatar_url?: string } | null;
};

function computeReason(topic: string | undefined, interestTopics: Set<string>, views: number) {
  if (topic && interestTopics.has(topic.toLowerCase())) return `Matches your ${topic} interest`;
  if (views > 1000) return 'Trending in the community';
  return 'Recommended for your growth';
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get('limit') || 6), 1), 20);

    const authUserId = await getAuthUserId(request);

    const { data: publishedPosts, error: postsError } = await supabase
      .from('posts')
      .select('id,title,slug,excerpt,topic,cover_image_url,views,likes_count,author_id,profiles(id,name,avatar_url),created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(120);

    if (postsError) {
      return NextResponse.json({ error: postsError.message }, { status: 400 });
    }

    const posts = (publishedPosts || []) as any[];

    if (!authUserId) {
      const trending = posts
        .sort((a, b) => (b.views + (b.likes_count || 0) * 4) - (a.views + (a.likes_count || 0) * 4))
        .slice(0, limit)
        .map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          topic: post.topic,
          cover_image_url: post.cover_image_url,
          views: post.views || 0,
          likes_count: post.likes_count || 0,
          score: post.views + (post.likes_count || 0) * 4,
          reason: 'Popular with readers',
          profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
        }));

      return NextResponse.json({ recommendations: trending, personalized: false });
    }

    const [{ data: likes }, { data: comments }, { data: myPosts }] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', authUserId),
      supabase.from('comments').select('post_id').eq('user_id', authUserId),
      supabase.from('posts').select('id,topic').eq('author_id', authUserId).limit(120),
    ]);

    const likedIds = new Set((likes || []).map((l) => l.post_id));
    const commentedIds = new Set((comments || []).map((c) => c.post_id));

    const postById = new Map(posts.map((p) => [p.id, p]));
    const interestTopics = new Set<string>();

    for (const id of likedIds) {
      const p = postById.get(id);
      if (p?.topic) interestTopics.add(String(p.topic).toLowerCase());
    }

    for (const id of commentedIds) {
      const p = postById.get(id);
      if (p?.topic) interestTopics.add(String(p.topic).toLowerCase());
    }

    for (const p of myPosts || []) {
      if (p.topic) interestTopics.add(String(p.topic).toLowerCase());
    }

    const recommendations: RecommendationItem[] = posts
      .filter((p) => p.author_id !== authUserId)
      .map((post) => {
        const topic = post.topic ? String(post.topic).toLowerCase() : undefined;
        const topicScore = topic && interestTopics.has(topic) ? 45 : 0;
        const popularityScore = Math.min(35, Math.floor((post.views || 0) / 100) + Math.floor((post.likes_count || 0) / 4));
        const freshnessScore = 20;
        const score = topicScore + popularityScore + freshnessScore;

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          topic: post.topic,
          cover_image_url: post.cover_image_url,
          views: post.views || 0,
          likes_count: post.likes_count || 0,
          score,
          reason: computeReason(post.topic, interestTopics, post.views || 0),
          profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({ recommendations, personalized: true });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
