// ── API Paths ──────────────────────────────────────────────────────────────────

export const API = {
  POSTS: "/api/posts",
  COMMUNITY_REVIEWS: "/api/community/reviews",
  PUBLIC_STATS: "/api/public/stats",
  INNOVATION_NEWS: "/api/innovation/news",
  FORUM_TOPICS: "/api/forum/topics",
  NEWSLETTER: "/api/newsletter",
  ADMIN_POSTS: "/api/admin/posts",
  ADMIN_USERS: "/api/admin/users",
  ADMIN_OVERVIEW: "/api/admin/overview",
  ADMIN_ACTIVITY: "/api/admin/activity",
  ADMIN_MODERATION: "/api/admin/moderation",
  ADMIN_LOGIN: "/api/admin/login",
  ADMIN_RESUMES: "/api/admin/resumes",
  ADMIN_THEME_USAGE: "/api/admin/theme-usage",
  LIKES: "/api/likes",
  FOLLOWS: "/api/follows",
  COMMENTS: "/api/comments",
  ANALYTICS: "/api/analytics",
} as const;

// ── Query Keys ─────────────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  FEATURED_POSTS: ["featuredPosts"] as const,
  COMMUNITY_REVIEWS: ["communityReviews"] as const,
  PUBLIC_STATS: ["publicStats"] as const,
  RESEARCH_FEED: ["researchFeed"] as const,
  FORUM_TOPICS: ["forumTopics"] as const,
  POSTS: (params?: Record<string, string>) => ["posts", params] as const,
  POST_DETAIL: (slug: string) => ["post", slug] as const,
  ADMIN_OVERVIEW: ["adminOverview"] as const,
  ADMIN_POSTS: (params?: Record<string, string>) => ["adminPosts", params] as const,
  ADMIN_USERS: (params?: Record<string, string>) => ["adminUsers", params] as const,
  NOTIFICATIONS: ["notifications"] as const,
} as const;

// ── Pagination & Limits ────────────────────────────────────────────────────────

export const LIMITS = {
  FEATURED_POSTS: 3,
  REVIEWS: 6,
  FEED_ITEMS: 6,
  FORUM_TOPICS: 6,
  DEFAULT_PAGE_SIZE: 10,
  ADMIN_PAGE_SIZE: 20,
  MAX_SEARCH_LENGTH: 200,
} as const;

// ── Cache / Stale Times (ms) ───────────────────────────────────────────────────

export const CACHE = {
  /** 1 minute – frequently updated data */
  SHORT: 60 * 1000,
  /** 5 minutes – moderately dynamic data */
  MEDIUM: 5 * 60 * 1000,
  /** 30 minutes – rarely changing data */
  LONG: 30 * 60 * 1000,
  /** Review polling interval */
  REVIEW_POLL_INTERVAL: 30 * 1000,
} as const;
