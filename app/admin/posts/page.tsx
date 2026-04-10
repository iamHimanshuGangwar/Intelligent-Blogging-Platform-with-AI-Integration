"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

type AdminPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  status?: string | null;
  author_id?: string | null;
  created_at: string;
  views?: number | null;
  ai_generated?: boolean | null;
  topic?: string | null;
  category?: string | null;
  profiles?: {
    id?: string;
    name?: string | null;
    avatar_url?: string | null;
  } | null;
};

const STATUS_FILTERS = ["all", "published", "draft", "archived", "pending", "scheduled"] as const;
const EDITABLE_STATUSES = ["published", "draft", "archived", "pending", "scheduled"] as const;

type EditFormState = {
  title: string;
  excerpt: string;
  topic: string;
  category: string;
  status: (typeof EDITABLE_STATUSES)[number];
  scheduled_for: string;
};

export default function AdminPostsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    title: "",
    excerpt: "",
    topic: "",
    category: "",
    status: "draft",
    scheduled_for: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [loading, user, isAdmin, router]);

  const fetchPosts = useCallback(async () => {
    try {
      setFetching(true);
      setError("");

      const params = new URLSearchParams({ limit: "100", status });
      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await fetch(`/api/admin/posts?${params.toString()}`, {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load posts");
      }

      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setFetching(false);
    }
  }, [search, status]);

  useEffect(() => {
    if (loading || !user || !isAdmin) return;
    fetchPosts();
  }, [loading, user, isAdmin, fetchPosts]);

  const openEditForm = (post: AdminPost) => {
    setEditingId(post.id);
    setEditForm({
      title: post.title,
      excerpt: post.excerpt || "",
      topic: post.topic || "",
      category: post.category || "",
      status: (EDITABLE_STATUSES.includes((post.status || "draft") as (typeof EDITABLE_STATUSES)[number])
        ? (post.status || "draft")
        : "draft") as (typeof EDITABLE_STATUSES)[number],
      scheduled_for: "",
    });
  };

  const handleDuplicate = async (post: AdminPost) => {
    try {
      setDuplicatingId(post.id);
      setError("");
      const response = await fetch(`/api/admin/posts/${post.id}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to duplicate post");
      setPosts((current) => [{ ...data.post, profiles: post.profiles }, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate post");
    } finally {
      setDuplicatingId(null);
    }
  };

  const handlePreview = async (post: AdminPost) => {
    try {
      setPreviewLoadingId(post.id);
      const response = await fetch(`/api/admin/posts/${post.id}/preview-token`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate preview");
      window.open(data.previewUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate preview");
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const closeEditForm = () => {
    setEditingId(null);
    setSavingId(null);
  };

  const applyUpdatedPost = (updatedPost: AdminPost) => {
    setPosts((current) => current.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post)));
  };

  const savePostUpdates = async (postId: string, partialStatus?: (typeof EDITABLE_STATUSES)[number]) => {
    try {
      setSavingId(postId);
      setError("");

      const payload: Record<string, string | null> = {
        title: editForm.title,
        excerpt: editForm.excerpt,
        topic: editForm.topic,
        category: editForm.category,
        status: partialStatus || editForm.status,
        scheduled_for: editForm.scheduled_for || null,
      };

      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update post");
      }

      applyUpdatedPost(data.post);
      if (!partialStatus) {
        closeEditForm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setSavingId(null);
    }
  };

  const quickStatusUpdate = async (post: AdminPost, nextStatus: (typeof EDITABLE_STATUSES)[number]) => {
    setEditForm({
      title: post.title,
      excerpt: post.excerpt || "",
      topic: post.topic || "",
      category: post.category || "",
      status: nextStatus,
      scheduled_for: "",
    });
    await savePostUpdates(post.id, nextStatus);
  };

  const handleDelete = async (post: AdminPost) => {
    const confirmed = window.confirm(`Delete \"${post.title}\" permanently? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(post.id);
      setError("");

      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete post");
      }

      setPosts((current) => current.filter((item) => item.id !== post.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    return posts.reduce(
      (acc, post) => {
        const normalizedStatus = post.status || "draft";
        acc.total += 1;
        acc.views += post.views || 0;
        if (normalizedStatus === "published") acc.published += 1;
        if (normalizedStatus === "draft") acc.drafts += 1;
        if (normalizedStatus === "pending") acc.pending += 1;
        return acc;
      },
      { total: 0, published: 0, drafts: 0, pending: 0, views: 0 }
    );
  }, [posts]);

  return (
    <div className="dark min-h-screen bg-background gradient-mesh text-on-background font-body">
      <AdminSideNav activePage="posts" />
      <AdminTopNav activePage="posts" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-white">Blog CMS</h1>
            <p className="text-sm text-on-surface-variant mt-2">
              Full post control for administrators. Review every article, inspect status, and remove content when needed.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/editor?from=admin"
              className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-primary to-primary-container px-4 py-2 text-sm font-bold text-on-primary-fixed"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Create Post
            </Link>
            <button
              onClick={fetchPosts}
              suppressHydrationWarning
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Total Posts</p>
            <p className="mt-2 text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Published</p>
            <p className="mt-2 text-2xl font-bold text-green-300">{stats.published}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Drafts</p>
            <p className="mt-2 text-2xl font-bold text-yellow-300">{stats.drafts}</p>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Total Views</p>
            <p className="mt-2 text-2xl font-bold text-blue-300">{stats.views}</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col lg:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, excerpt, topic, or category"
            suppressHydrationWarning
            className="h-11 flex-1 rounded-lg border border-white/10 bg-surface-container px-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setStatus(filter)}
                suppressHydrationWarning
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  status === filter
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {fetching ? (
          <div className="glass-panel rounded-xl p-8 text-sm text-on-surface-variant">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-sm text-on-surface-variant">No posts found for the current filter.</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="glass-panel rounded-xl p-5">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                        {post.status || "draft"}
                      </span>
                      {post.ai_generated && (
                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                          AI-generated
                        </span>
                      )}
                      {post.category && (
                        <span className="text-[11px] text-zinc-500">{post.category}</span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-white line-clamp-2">{post.title}</h2>
                    <p className="mt-2 text-sm text-on-surface-variant line-clamp-2">
                      {post.excerpt || "No excerpt available for this post yet."}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                      <span>Author: {post.profiles?.name || post.author_id || "Unknown"}</span>
                      <span>Views: {post.views || 0}</span>
                      <span>{new Date(post.created_at).toLocaleString()}</span>
                      {post.topic && <span>Topic: {post.topic}</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    {post.slug && post.status === "published" && (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-500/30 px-3 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/10"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        View
                      </Link>
                    )}
                    {post.status !== "published" && (
                      <button
                        onClick={() => handlePreview(post)}
                        disabled={previewLoadingId === post.id}
                        suppressHydrationWarning
                        className="inline-flex items-center gap-1 rounded-lg border border-purple-500/30 px-3 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/10 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-sm">preview</span>
                        {previewLoadingId === post.id ? "…" : "Preview"}
                      </button>
                    )}
                    <Link
                      href={`/admin/moderation?tab=posts&postId=${encodeURIComponent(post.id)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-yellow-500/30 px-3 py-2 text-xs font-semibold text-yellow-300 hover:bg-yellow-500/10"
                    >
                      <span className="material-symbols-outlined text-sm">fact_check</span>
                      Review
                    </Link>
                    <button
                      onClick={() => openEditForm(post)}
                      suppressHydrationWarning
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(post)}
                      disabled={duplicatingId === post.id}
                      suppressHydrationWarning
                      className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      {duplicatingId === post.id ? "Copying…" : "Duplicate"}
                    </button>
                    {post.status === "published" ? (
                      <button
                        onClick={() => quickStatusUpdate(post, "draft")}
                        disabled={savingId === post.id}
                        suppressHydrationWarning
                        className="inline-flex items-center gap-1 rounded-lg border border-orange-500/30 px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/10 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-sm">unpublished</span>
                        {savingId === post.id ? "Saving..." : "Unpublish"}
                      </button>
                    ) : (
                      <button
                        onClick={() => quickStatusUpdate(post, "published")}
                        disabled={savingId === post.id}
                        suppressHydrationWarning
                        className="inline-flex items-center gap-1 rounded-lg border border-green-500/30 px-3 py-2 text-xs font-semibold text-green-300 hover:bg-green-500/10 disabled:opacity-60"
                      >
                        <span className="material-symbols-outlined text-sm">publish</span>
                        {savingId === post.id ? "Saving..." : "Publish"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post)}
                      disabled={deletingId === post.id}
                      suppressHydrationWarning
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      {deletingId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {editingId === post.id && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-white/3 p-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <label className="block text-sm text-zinc-300">
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Title</span>
                        <input
                          value={editForm.title}
                          onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                          suppressHydrationWarning
                          className="h-11 w-full rounded-lg border border-white/10 bg-surface-container px-4 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </label>

                      <label className="block text-sm text-zinc-300">
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Status</span>
                        <select
                          value={editForm.status}
                          onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value as (typeof EDITABLE_STATUSES)[number] }))}
                          className="h-11 w-full rounded-lg border border-white/10 bg-surface-container px-4 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          {EDITABLE_STATUSES.map((option) => (
                            <option key={option} value={option} className="bg-zinc-950 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-sm text-zinc-300">
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Topic</span>
                        <input
                          value={editForm.topic}
                          onChange={(event) => setEditForm((current) => ({ ...current, topic: event.target.value }))}
                          suppressHydrationWarning
                          className="h-11 w-full rounded-lg border border-white/10 bg-surface-container px-4 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </label>

                      <label className="block text-sm text-zinc-300">
                        <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Category</span>
                        <input
                          value={editForm.category}
                          onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))}
                          suppressHydrationWarning
                          className="h-11 w-full rounded-lg border border-white/10 bg-surface-container px-4 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </label>

                      {editForm.status === "scheduled" && (
                        <label className="block text-sm text-zinc-300 lg:col-span-2">
                          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Schedule Publish Date &amp; Time</span>
                          <input
                            type="datetime-local"
                            value={editForm.scheduled_for}
                            onChange={(event) => setEditForm((current) => ({ ...current, scheduled_for: event.target.value }))}
                            suppressHydrationWarning
                            min={new Date().toISOString().slice(0, 16)}
                            className="h-11 w-full rounded-lg border border-white/10 bg-surface-container px-4 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                          />
                          <p className="mt-1 text-[11px] text-zinc-500">The post will automatically publish at this time via the cron job.</p>
                        </label>
                      )}
                    </div>

                    <label className="mt-4 block text-sm text-zinc-300">
                      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">Excerpt</span>
                      <textarea
                        value={editForm.excerpt}
                        onChange={(event) => setEditForm((current) => ({ ...current, excerpt: event.target.value }))}
                        rows={4}
                        className="w-full rounded-lg border border-white/10 bg-surface-container px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </label>

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <button
                        onClick={closeEditForm}
                        suppressHydrationWarning
                        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => savePostUpdates(post.id)}
                        disabled={savingId === post.id}
                        suppressHydrationWarning
                        className="rounded-lg bg-linear-to-r from-primary to-primary-container px-4 py-2 text-sm font-bold text-on-primary-fixed disabled:opacity-60"
                      >
                        {savingId === post.id ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}