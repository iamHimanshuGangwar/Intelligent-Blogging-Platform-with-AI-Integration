"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/NavBar";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Footer = dynamic(() => import("@/components/Footer"));

interface BlogPost {
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
  ai_generated?: boolean;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        published: "true",
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/posts?${params}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Blog</h1>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            Explore the latest articles from our community of creators.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-10">
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-container border-outline-variant"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-on-surface-variant">
            <p className="text-lg">No posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug || post.id}`}
                className="group glass-panel rounded-xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="relative h-44 bg-surface-container">
                  {post.cover_image_url ? (
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant/30">
                      <span className="material-symbols-outlined text-5xl">article</span>
                    </div>
                  )}
                  {post.topic && (
                    <Badge className="absolute top-3 left-3 bg-primary/90 text-on-primary text-[10px]">
                      {post.topic}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                    {post.excerpt || "No excerpt available."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback className="text-[10px]">
                          {(post.profiles?.name || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] text-on-surface-variant">
                        {post.profiles?.name || "Unknown"}
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-surface-container-high text-on-surface-variant disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-on-surface-variant">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase bg-surface-container-high text-on-surface-variant disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
