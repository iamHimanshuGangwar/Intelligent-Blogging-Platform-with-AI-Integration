import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendPublishAnnouncementEmail } from '@/lib/mailer';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Vercel Cron authenticates with the Authorization header matching CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: due, error: fetchError } = await supabase
      .from('posts')
      .select('id, title, slug, author_id, excerpt, cover_image_url, profiles(name)')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now);

    if (fetchError) {
      console.error('[cron/publish-scheduled] fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!due || due.length === 0) {
      return NextResponse.json({ published: 0, message: 'No scheduled posts due.' });
    }

    const ids = due.map((p) => p.id);

    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        approval_status: 'approved',
        published_at: now,
      })
      .in('id', ids);

    if (updateError) {
      console.error('[cron/publish-scheduled] update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Fire-and-forget newsletter announcements
    for (const post of due) {
      try {
        const { data: subscribers } = await supabase
          .from('newsletter_subscribers')
          .select('email, name');

        if (subscribers && subscribers.length > 0) {
          const authorName = post.profiles && !Array.isArray(post.profiles)
            ? (post.profiles as { name?: string }).name ?? 'AiBlog Editorial'
            : 'AiBlog Editorial';

          await Promise.allSettled(
            subscribers.map((s) =>
              sendPublishAnnouncementEmail({
                to: s.email,
                subscriberName: s.name ?? undefined,
                postTitle: post.title,
                postExcerpt: post.excerpt ?? undefined,
                postSlug: post.slug,
                coverImageUrl: post.cover_image_url ?? undefined,
                authorName,
              })
            )
          );
        }
      } catch (mailErr) {
        console.error('[cron/publish-scheduled] newsletter error for post', post.id, mailErr);
      }
    }

    return NextResponse.json({
      published: ids.length,
      postIds: ids,
      message: `Published ${ids.length} scheduled post(s).`,
    });
  } catch (err) {
    console.error('[cron/publish-scheduled] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
