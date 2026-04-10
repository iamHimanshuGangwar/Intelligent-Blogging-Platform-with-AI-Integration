import { useState, useCallback } from 'react';

export interface BlogDraft {
  id: string;
  author_user_id: string;
  title: string | null;
  brief: string | null;
  content: string | null;
  tags: string[];
  word_count: number;
  reading_time_minutes: number;
  has_title: boolean;
  has_brief: boolean;
  has_content: boolean;
  completion_percentage: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hook for managing blog drafts
 */
export function useBlogDrafts() {
  const [drafts, setDrafts] = useState<BlogDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDraft = useCallback(
    async (data: {
      title?: string;
      brief?: string;
      content?: string;
      tags?: string[];
      wordCount?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/blog/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const draft = await res.json();
        if (res.ok) {
          setDrafts((prev) => [draft, ...prev]);
          return draft;
        } else {
          setError(draft.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchDrafts = useCallback(
    async (published: boolean = false, sortBy?: string) => {
      setLoading(true);
      setError(null);
      try {
        let url = `/api/blog/drafts?published=${published}`;
        if (sortBy) url += `&sortBy=${sortBy}`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setDrafts(data.drafts || []);
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

  const updateDraft = useCallback(
    async (
      draftId: string,
      updates: {
        title?: string;
        brief?: string;
        content?: string;
        tags?: string[];
        isPub?: boolean;
        isPublished?: boolean;
        publicationDate?: string;
      }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/blog/drafts/${draftId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        const updated = await res.json();
        if (res.ok) {
          setDrafts((prev) =>
            prev.map((d) => (d.id === draftId ? updated : d))
          );
          return updated;
        } else {
          setError(updated.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteDraft = useCallback(async (draftId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/drafts/${draftId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
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

  const getDraft = useCallback(async (draftId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/drafts/${draftId}`);
      const draft = await res.json();
      if (res.ok) {
        return draft;
      } else {
        setError(draft.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    drafts,
    loading,
    error,
    createDraft,
    fetchDrafts,
    updateDraft,
    deleteDraft,
    getDraft,
  };
}

/**
 * Hook for managing community posts
 */
export function useCommunityPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (
      sortBy: 'published_at' | 'likes' | 'engagement' = 'published_at',
      limit: number = 20,
      offset: number = 0,
      tags?: string[]
    ) => {
      setLoading(true);
      setError(null);
      try {
        let url = `/api/community/posts?sortBy=${sortBy}&limit=${limit}&offset=${offset}`;
        if (tags && tags.length > 0) {
          url += `&tags=${tags.join(',')}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts || []);
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

  return {
    posts,
    total,
    loading,
    error,
    fetchPosts,
  };
}
