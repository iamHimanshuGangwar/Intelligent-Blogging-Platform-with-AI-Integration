import { useState, useCallback } from 'react';

export interface BlogComment {
  id: string;
  blog_draft_id: string;
  comment_text: string;
  user_id: string;
  parent_comment_id?: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  replies?: BlogComment[];
}

/**
 * Hook for blog comments
 */
export function useBlogComments(blogId: string) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/${blogId}/comments`);
      const data = await res.json();
      if (res.ok) {
        setComments(data.comments || []);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  const addComment = useCallback(
    async (commentText: string, parentCommentId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blog/${blogId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentText, parentCommentId }),
        });
        const data = await res.json();
        if (res.ok) {
          setComments((prev) => [...prev, data]);
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

  return {
    comments,
    loading,
    error,
    fetchComments,
    addComment,
  };
}

/**
 * Hook for user analytics with time range filtering
 */
export function useUserAnalytics() {
  const [analytics, setAnalytics] = useState({
    period: '7 days',
    summary: {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalNewFollowers: 0,
      averageEngagementRate: 0,
      dataPoints: 0,
    },
    dailyData: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (days: 7 | 30 | 90 | 365 = 7) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/user?days=${days}`);
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  };
}

/**
 * Hook for blog-specific analytics
 */
export function useBlogAnalytics(blogId: string) {
  const [analytics, setAnalytics] = useState({
    period: '7 days',
    stats: {
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      totalEngagement: 0,
      engagementRate: 0,
      platformBreakdown: {
        twitter: 0,
        linkedin: 0,
        facebook: 0,
        email: 0,
        direct: 0,
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (days: 7 | 30 | 90 | 365 = 7) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics/blog?blogId=${blogId}&days=${days}`);
        const data = await res.json();
        if (res.ok) {
          setAnalytics(data);
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

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  };
}

/**
 * Hook for audience demographics
 */
export function useAudienceAnalytics() {
  const [audience, setAudience] = useState({
    user_id: '',
    total_followers: 0,
    students_percentage: 0,
    professionals_percentage: 0,
    creators_percentage: 0,
    other_percentage: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAudience = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analytics/audience');
      const data = await res.json();
      if (res.ok) {
        setAudience(data.audience);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAudience = useCallback(
    async (demographics: Record<string, number>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analytics/audience', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(demographics),
        });
        const data = await res.json();
        if (res.ok) {
          setAudience(data);
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
    []
  );

  return {
    audience,
    loading,
    error,
    fetchAudience,
    updateAudience,
  };
}

/**
 * Hook for trending topics
 */
export function useTrendingTopics() {
  const [topics, setTopics] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(
    async (
      timeRange: 'day' | 'week' | 'month' = 'week',
      limit: number = 10,
      offset: number = 0
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/trending-topics?timeRange=${timeRange}&limit=${limit}&offset=${offset}`
        );
        const data = await res.json();
        if (res.ok) {
          setTopics(data.topics || []);
          setTotal(data.total || 0);
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trending-topics', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    topics,
    total,
    loading,
    error,
    fetchTopics,
    refreshTopics,
  };
}
