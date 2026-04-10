/**
 * React Query hooks for the home page.
 * Provides automatic caching, background revalidation, and deduplication.
 */

import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS, CACHE } from "@/lib/constants";
import {
  fetchFeaturedPosts,
  fetchCommunityReviews,
  fetchPublicStats,
  fetchResearchFeed,
  fetchForumTopics,
} from "@/services/home";

export function useFeaturedPosts() {
  return useQuery({
    queryKey: QUERY_KEYS.FEATURED_POSTS,
    queryFn: fetchFeaturedPosts,
    staleTime: CACHE.SHORT,
  });
}

export function useCommunityReviews() {
  return useQuery({
    queryKey: QUERY_KEYS.COMMUNITY_REVIEWS,
    queryFn: fetchCommunityReviews,
    staleTime: CACHE.SHORT,
    refetchInterval: CACHE.REVIEW_POLL_INTERVAL,
    refetchIntervalInBackground: false,
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: QUERY_KEYS.PUBLIC_STATS,
    queryFn: fetchPublicStats,
    staleTime: CACHE.LONG,
  });
}

export function useResearchFeed() {
  return useQuery({
    queryKey: QUERY_KEYS.RESEARCH_FEED,
    queryFn: fetchResearchFeed,
    staleTime: CACHE.MEDIUM,
  });
}

export function useForumTopics() {
  return useQuery({
    queryKey: QUERY_KEYS.FORUM_TOPICS,
    queryFn: fetchForumTopics,
    staleTime: CACHE.MEDIUM,
  });
}
