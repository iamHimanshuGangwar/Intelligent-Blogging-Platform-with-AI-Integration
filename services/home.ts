/**
 * Home page API service layer.
 * Encapsulates all fetch calls for the landing page data.
 */

import { API, LIMITS } from "@/lib/constants";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FeaturedPost {
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  topic?: string;
  category?: string;
  cover_image_url?: string;
  profiles?: { id: string; name: string; avatar_url: string };
  created_at: string;
  views: number;
  likes_count?: number;
  comments_count?: number;
}

export interface CommunityReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  postTitle?: string;
  postSlug?: string;
  author: {
    name: string;
    avatar_url?: string;
  };
}

export interface PublicStats {
  display: {
    activeCreators: string;
    syntheticPosts: string;
    monthlyReads: string;
    industryMentors: string;
  };
}

export interface ResearchItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  category: string;
  publishedAt: string;
}

export interface ForumTopicPreview {
  id: string;
  title: string;
  reply_count: number;
  like_count: number;
  forum_categories?: {
    name: string;
    icon?: string;
  };
}

export interface FeaturedPostsResponse {
  posts: FeaturedPost[];
  total: number | null;
}

export interface ResearchFeedResponse {
  researchFeed: ResearchItem[];
  worldNews: ResearchItem[];
}

// ── Fetch Functions ────────────────────────────────────────────────────────────

export async function fetchFeaturedPosts(): Promise<FeaturedPostsResponse> {
  const res = await fetch(
    `${API.POSTS}?limit=${LIMITS.FEATURED_POSTS}&published=true`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch featured posts");
  const data = await res.json();
  const posts: FeaturedPost[] = data.posts || data || [];
  const total = data.total ?? data.pagination?.total ?? null;
  return { posts, total };
}

export async function fetchCommunityReviews(): Promise<CommunityReview[]> {
  const res = await fetch(
    `${API.COMMUNITY_REVIEWS}?limit=${LIMITS.REVIEWS}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch reviews");
  const data = await res.json();
  return data.reviews || [];
}

export async function fetchPublicStats(): Promise<PublicStats> {
  const res = await fetch(API.PUBLIC_STATS, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch public stats");
  return res.json();
}

export async function fetchResearchFeed(): Promise<ResearchFeedResponse> {
  const res = await fetch(API.INNOVATION_NEWS, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch research feed");
  const data = await res.json();
  const researchFeed = (
    (data.researchNews || data.items || []) as ResearchItem[]
  ).slice(0, LIMITS.FEED_ITEMS);
  const worldNews = ((data.worldNews || []) as ResearchItem[]).slice(
    0,
    LIMITS.FEED_ITEMS
  );
  return { researchFeed, worldNews };
}

export async function fetchForumTopics(): Promise<ForumTopicPreview[]> {
  const res = await fetch(
    `${API.FORUM_TOPICS}?limit=${LIMITS.FORUM_TOPICS}&sort=latest`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch forum topics");
  const data = await res.json();
  return (data.topics || []).slice(0, LIMITS.FORUM_TOPICS);
}

export async function subscribeNewsletter(
  email: string
): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(API.NEWSLETTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, message: data.error || "Failed to subscribe." };
  }
  return { ok: true, message: "You're subscribed! Welcome aboard." };
}
