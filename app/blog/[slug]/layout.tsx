import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

// Revalidate blog post pages every 60 seconds (ISR)
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, content, cover_image_url, topic, created_at, profiles(name)')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .eq('approval_status', 'approved')
    .single();

  if (!post) {
    return { title: 'Post Not Found | AiBlog' };
  }

  const title = `${post.title} | AiBlog`;
  const description =
    post.excerpt ||
    (post.content || '')
      .replace(/<[^>]+>/g, '')
      .replace(/[#*`_~[\](){}|>]/g, '')
      .trim()
      .slice(0, 160) ||
    'Read this article on AiBlog.';
  const image = post.cover_image_url || '/og-image.png';
  const canonicalUrl = `https://aiblog.dev/blog/${slug}`;
  const authorName =
    post.profiles && !Array.isArray(post.profiles)
      ? (post.profiles as { name?: string }).name ?? 'AiBlog Editorial'
      : 'AiBlog Editorial';

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description,
    image,
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: 'AiBlog',
      logo: { '@type': 'ImageObject', url: 'https://aiblog.dev/logo.png' },
    },
    datePublished: post.created_at,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    keywords: post.topic ?? undefined,
  });

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
      publishedTime: post.created_at ?? undefined,
      authors: [authorName],
      tags: post.topic ? [post.topic] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    other: {
      'script:ld+json': jsonLd,
    },
  };
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

