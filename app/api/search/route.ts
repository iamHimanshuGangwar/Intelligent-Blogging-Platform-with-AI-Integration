/**
 * Global search API — searches across posts, user profiles, and jobs.
 * Uses Postgres full-text search (tsvector) for posts when available,
 * falls back to ILIKE for other tables.
 *
 * GET /api/search?q=<query>&type=all|posts|users|jobs&limit=10
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, getRequestIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { escapeLikePattern } from '@/lib/sanitize';

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'job';
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  // Rate limit: treat as public read
  const rateLimitResponse = await checkRateLimit(
    request,
    `search:${getRequestIdentifier(request)}`,
    RATE_LIMITS.PUBLIC_READ
  );
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = request.nextUrl;
  const rawQuery = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || 'all';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 30);

  if (!rawQuery || rawQuery.length < 2) {
    return NextResponse.json({ results: [], query: rawQuery });
  }

  const supabase = await createClient();
  const results: SearchResult[] = [];
  const safeQ = escapeLikePattern(rawQuery);

  // ── Posts ───────────────────────────────────────────────────────────────────
  if (type === 'all' || type === 'posts') {
    try {
      // Try full-text search first (requires search_vector column from migration)
      const { data: ftsPosts, error: ftsError } = await supabase
        .from('posts')
        .select('id, title, excerpt, slug, cover_image_url, topic, created_at, profiles(name)')
        .textSearch('search_vector', rawQuery, { type: 'websearch' })
        .eq('status', 'published')
        .or('approval_status.eq.approved,approval_status.is.null')
        .limit(limit)
        .order('created_at', { ascending: false });

      const posts = ftsError ? null : ftsPosts;

      // Fallback to ILIKE if FTS column doesn't exist
      const finalPosts = posts ?? await (async () => {
        const { data } = await supabase
          .from('posts')
          .select('id, title, excerpt, slug, cover_image_url, topic, created_at, profiles(name)')
          .or(`title.ilike.%${safeQ}%,excerpt.ilike.%${safeQ}%,topic.ilike.%${safeQ}%`)
          .eq('status', 'published')
          .or('approval_status.eq.approved,approval_status.is.null')
          .limit(limit)
          .order('created_at', { ascending: false });
        return data;
      })();

      for (const post of finalPosts ?? []) {
        const authorName =
          post.profiles && !Array.isArray(post.profiles)
            ? (post.profiles as { name?: string }).name : undefined;

        results.push({
          id: post.id,
          type: 'post',
          title: post.title || 'Untitled',
          description: post.excerpt || '',
          url: `/blog/${post.slug || post.id}`,
          imageUrl: post.cover_image_url ?? undefined,
          metadata: { topic: post.topic, author: authorName, createdAt: post.created_at },
        });
      }
    } catch (err) {
      console.error('[search] Posts error:', err);
    }
  }

  // ── Users / Profiles ────────────────────────────────────────────────────────
  if (type === 'all' || type === 'users') {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, bio, avatar_url, role')
        .or(`name.ilike.%${safeQ}%,bio.ilike.%${safeQ}%`)
        .neq('role', 'admin')
        .limit(Math.ceil(limit / 2));

      for (const profile of profiles ?? []) {
        results.push({
          id: profile.id,
          type: 'user',
          title: profile.name || 'Anonymous',
          description: profile.bio ? profile.bio.slice(0, 120) : '',
          url: `/dashboard?userId=${profile.id}`,
          imageUrl: profile.avatar_url ?? undefined,
        });
      }
    } catch (err) {
      console.error('[search] Profiles error:', err);
    }
  }

  // ── Jobs ────────────────────────────────────────────────────────────────────
  if (type === 'all' || type === 'jobs') {
    try {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, company, description, location, type')
        .or(`title.ilike.%${safeQ}%,company.ilike.%${safeQ}%,description.ilike.%${safeQ}%`)
        .eq('status', 'open')
        .limit(Math.ceil(limit / 2));

      for (const job of jobs ?? []) {
        results.push({
          id: job.id,
          type: 'job',
          title: job.title || 'Job Opening',
          description: `${job.company || ''} · ${job.location || ''} · ${job.type || ''}`.replace(/^·\s*/g, '').trim(),
          url: `/jobs/${job.id}`,
          metadata: { company: job.company, location: job.location, type: job.type },
        });
      }
    } catch (err) {
      console.error('[search] Jobs error:', err);
    }
  }

  return NextResponse.json({
    results,
    query: rawQuery,
    total: results.length,
  });
}
