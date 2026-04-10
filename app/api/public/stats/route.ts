import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cacheGetOrSet } from '@/lib/cache';

function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M+`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K+`;
  return String(value);
}

export async function GET() {
  try {
    const payload = await cacheGetOrSet('public:stats', async () => {
    const supabase = await createClient();

    const { data: postAuthors, error: postAuthorsError } = await supabase
      .from('posts')
      .select('author_id, ai_generated, views')
      .eq('status', 'published')
      .or('approval_status.eq.approved,approval_status.is.null');

    if (postAuthorsError) {
      throw new Error(postAuthorsError.message);
    }

    const uniqueAuthors = new Set((postAuthors || []).map((p) => p.author_id).filter(Boolean));
    const totalPosts = (postAuthors || []).length;
    const monthlyReads = (postAuthors || []).reduce((sum, p) => sum + (p.views || 0), 0);

    const { count: mentorCount, error: mentorError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'mentor');

    if (mentorError) {
      throw new Error(mentorError.message);
    }

    let finalMentorCount = mentorCount || 0;

    if (finalMentorCount === 0) {
      const { count: adminCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin');
      finalMentorCount = adminCount || 0;
    }

    return {
      raw: {
        activeCreators: uniqueAuthors.size,
        syntheticPosts: totalPosts,
        monthlyReads,
        industryMentors: finalMentorCount,
      },
      display: {
        activeCreators: compactNumber(uniqueAuthors.size),
        syntheticPosts: compactNumber(totalPosts),
        monthlyReads: compactNumber(monthlyReads),
        industryMentors: compactNumber(finalMentorCount),
      },
      updatedAt: new Date().toISOString(),
    };
    }, 60);

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Public stats error:', error);
    return NextResponse.json(
      {
        raw: {
          activeCreators: 0,
          syntheticPosts: 0,
          monthlyReads: 0,
          industryMentors: 0,
        },
        display: {
          activeCreators: '0',
          syntheticPosts: '0',
          monthlyReads: '0',
          industryMentors: '0',
        },
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
