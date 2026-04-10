import { createHmac } from 'crypto';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { renderMarkdownBlocks } from '@/lib/markdown';

export const dynamic = 'force-dynamic';

function verifyPreviewToken(token: string): string | null {
  try {
    const secret = process.env.PREVIEW_SECRET || process.env.NEXTAUTH_SECRET || 'aiblog-preview-secret';
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return null;
    const [postId, expiresAt, sig] = parts;
    if (Date.now() > Number(expiresAt)) return null;
    const expected = createHmac('sha256', secret).update(`${postId}:${expiresAt}`).digest('hex');
    if (sig !== expected) return null;
    return postId;
  } catch {
    return null;
  }
}

type Props = { searchParams: Promise<{ token?: string }> };

export default async function PreviewPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) notFound();

  const postId = verifyPreviewToken(token);
  if (!postId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Preview link expired</h1>
          <p className="text-zinc-400">This preview link is no longer valid. Ask an admin to generate a new one.</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('id, title, content, excerpt, cover_image_url, topic, category, status, created_at, profiles(id, name, avatar_url)')
    .eq('id', postId)
    .maybeSingle();

  if (!post) notFound();

  const authorName =
    post.profiles && !Array.isArray(post.profiles)
      ? (post.profiles as { name?: string }).name ?? 'Unknown Author'
      : 'Unknown Author';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-black">
        PREVIEW — This post is not yet published (status: {post.status})
      </div>

      <main className="mx-auto max-w-3xl px-4 py-16">
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full rounded-2xl object-cover mb-10 max-h-96"
          />
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {post.topic && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
              {post.topic}
            </span>
          )}
          {post.category && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
              {post.category}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">{post.title}</h1>

        {post.excerpt && (
          <p className="text-lg text-zinc-400 mb-8 leading-relaxed">{post.excerpt}</p>
        )}

        <div className="mb-10 flex items-center gap-3 text-sm text-zinc-500">
          <span>By {authorName}</span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>

        <article className="prose prose-invert max-w-none">
          {renderMarkdownBlocks(post.content || '')}
        </article>
      </main>
    </div>
  );
}
