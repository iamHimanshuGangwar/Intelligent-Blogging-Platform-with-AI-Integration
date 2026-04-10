"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { subscribeLikeUpdates } from "@/lib/like-sync";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  views: number;
  likes_count: number;
  created_at: string;
  ai_generated: boolean;
  status?: string;
}

type TabKey = "published" | "drafts" | "archived";

export default function MyPostsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("published");

  const fetchPosts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/posts?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || data || []);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const unsubscribe = subscribeLikeUpdates((payload) => {
      setPosts((current) =>
        current.map((post) =>
          post.id === payload.postId ? { ...post, likes_count: payload.likesCount } : post
        )
      );
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (response.ok) fetchPosts();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "published", label: "Published", icon: "public" },
    { key: "drafts", label: "Drafts", icon: "edit_note" },
    { key: "archived", label: "Archived", icon: "archive" },
  ];

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "published") return !p.status || p.status === "published";
    return p.status === activeTab;
  });

  return (
    <div className="px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface">
                  My <span className="text-gradient italic">Posts</span>
                </h1>
                <p className="text-sm text-on-surface-variant mt-2">
                  Manage your published articles, drafts, and archived content.
                </p>
              </div>
              <Link href="/editor" className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg font-bold text-sm hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-sm">add</span>
                New Post
              </Link>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 bg-surface-container-low rounded-xl w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Current Draft Highlight */}
            {activeTab === "drafts" && (
              <div className="mb-8 p-6 rounded-2xl bg-linear-to-r from-secondary/10 to-tertiary/5 border border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-secondary text-sm">edit_note</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Current Draft</span>
                </div>
                <h3 className="font-bold text-lg mb-1">Untitled Draft</h3>
                <p className="text-xs text-on-surface-variant">Last edited just now</p>
                <Link href="/editor" className="inline-flex items-center gap-1 mt-3 text-sm text-secondary font-bold hover:underline">
                  Continue Editing <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            )}

            {/* Post Grid */}
            {loading ? (
              <div className="text-center py-16">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-primary mx-auto mb-4"></div>
                <p className="text-on-surface-variant">Loading posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">article</span>
                <p className="text-on-surface-variant mb-4">No {activeTab} posts yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="glass-panel rounded-xl p-6 group hover:border-primary/20 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {post.ai_generated && (
                          <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full uppercase">AI</span>
                        )}
                        <span className="text-[10px] text-on-surface-variant">
                          {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/editor?id=${post.id}`} className="p-1.5 rounded-lg hover:bg-surface-container-highest">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">edit</span>
                        </Link>
                        <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg hover:bg-error/10">
                          <span className="material-symbols-outlined text-sm text-error">delete</span>
                        </button>
                      </div>
                    </div>
                    <Link href={`/editor?id=${post.id}`}>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    </Link>
                    <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        {post.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">favorite</span>
                        {post.likes_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>
    </div>
  );
}
