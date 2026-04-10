import { useState, useCallback } from 'react';

/**
 * Hook for blog likes management
 */
export function useBlogLike(blogId: string) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${blogId}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikeCount(data.likesCount);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  const fetchLikes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${blogId}/like`);
      const data = await res.json();
      if (res.ok) {
        setLikeCount(data.likesCount || 0);
        setLiked(data.isLiked || false);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  return {
    liked,
    likeCount,
    loading,
    error,
    toggleLike,
    fetchLikes,
  };
}

/**
 * Hook for blog shares
 */
export function useBlogShare(blogId: string) {
  const [shareCount, setShareCount] = useState(0);
  const [platformBreakdown, setPlatformBreakdown] = useState({
    twitter: 0,
    linkedin: 0,
    facebook: 0,
    email: 0,
    direct: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sharePost = useCallback(
    async (platform: string, recipientEmail?: string, message?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blog/${blogId}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform, recipientEmail, message }),
        });
        const data = await res.json();
        if (res.ok) {
          setShareCount(data.sharesCount);
          return data;
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [blogId]
  );

  const fetchShares = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${blogId}/share`);
      const data = await res.json();
      if (res.ok) {
        setShareCount(data.sharesCount || 0);
        setPlatformBreakdown(data.platformBreakdown || {});
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  return {
    shareCount,
    platformBreakdown,
    loading,
    error,
    sharePost,
    fetchShares,
  };
}

/**
 * Hook for blog views
 */
export function useBlogViews(blogId: string) {
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackView = useCallback(
    async (timeSpentSeconds?: number, viewType?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blog/${blogId}/views`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeSpentSeconds, viewType }),
        });
        const data = await res.json();
        if (res.ok) {
          setViewCount(data.viewsCount);
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [blogId]
  );

  const fetchViews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${blogId}/views`);
      const data = await res.json();
      if (res.ok) {
        setViewCount(data.viewsCount || 0);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  return {
    viewCount,
    loading,
    error,
    trackView,
    fetchViews,
  };
}

/**
 * Hook for blog engagement stats
 */
export function useBlogStats(blogId: string) {
  const [stats, setStats] = useState({
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    viewsCount: 0,
    engagementRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${blogId}/stats`);
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  return {
    stats,
    loading,
    error,
    fetchStats,
  };
}

/**
 * Hook for user follow system
 */
export function useUserFollow(userId: string) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFollow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/${userId}/follow`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchFollowStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/${userId}/follow`);
      const data = await res.json();
      if (res.ok) {
        setIsFollowing(data.isFollowing || false);
        setFollowerCount(data.followerCount || 0);
        setFollowingCount(data.followingCount || 0);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    isFollowing,
    followerCount,
    followingCount,
    loading,
    error,
    toggleFollow,
    fetchFollowStatus,
  };
}
