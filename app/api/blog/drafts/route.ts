import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthUserId } from '@/lib/auth-helpers';

/**
 * POST /api/blog/drafts
 * Create a new blog draft
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, brief, content, tags, wordCount = 0 } = await req.json();

    const supabase = await createClient();

    // Calculate reading time (approx 200 words per minute)
    const readingTimeMinutes = Math.ceil((wordCount || content?.length || 0) / 1000);

    // Determine completion percentage
    let hasTitle = !!title;
    let hasBrief = !!brief;
    let hasContent = !!content;

    const completionPercentage = Math.round(
      ((hasTitle ? 1 : 0) + (hasBrief ? 1 : 0) + (hasContent ? 1 : 0)) / 3 * 100
    );

    const { data: draft, error } = await supabase
      .from('blog_drafts')
      .insert([
        {
          author_user_id: userId,
          title: title || null,
          brief: brief || null,
          content: content || null,
          tags: tags || [],
          word_count: wordCount,
          reading_time_minutes: readingTimeMinutes,
          has_title: hasTitle,
          has_brief: hasBrief,
          has_content: hasContent,
          completion_percentage: completionPercentage,
          is_published: false,
          published_at: null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Draft creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create draft' },
        { status: 500 }
      );
    }

    return NextResponse.json(draft, { status: 201 });
  } catch (error: any) {
    console.error('Create draft error:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/drafts
 * Get all drafts for current user
 * Query params:
 * - published: true | false (default: false - show only drafts)
 * - sortBy: created_at | updated_at | completion_percentage
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const published = req.nextUrl.searchParams.get('published') === 'true';
    const sortBy = req.nextUrl.searchParams.get('sortBy') || 'updated_at';

    const supabase = await createClient();

    let query = supabase
      .from('blog_drafts')
      .select('*')
      .eq('author_user_id', userId)
      .eq('is_published', published)
      .order(sortBy, { ascending: false });

    const { data: drafts, error } = await query;

    if (error) {
      console.error('Fetch drafts error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch drafts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      published,
      count: drafts?.length || 0,
      drafts: drafts || [],
    });
  } catch (error: any) {
    console.error('Get drafts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    );
  }
}
