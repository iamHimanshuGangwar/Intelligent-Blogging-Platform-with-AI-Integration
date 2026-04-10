"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import NavBar from "@/components/NavBar";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  slug: string;
  topic_count: number;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  is_pinned: boolean;
  is_solved: boolean;
  is_locked: boolean;
  reply_count: number;
  like_count: number;
  view_count: number;
  tags: string[];
  last_reply_at: string;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

type SortOption = "latest" | "popular" | "unanswered";

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.categorySlug as string;
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!slug) return;
    const fetchCategory = async () => {
      const res = await fetch("/api/forum/categories");
      if (res.ok) {
        const data = await res.json();
        const cat = data.categories?.find((c: ForumCategory) => c.slug === slug);
        setCategory(cat || null);
      }
    };
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const fetchTopics = async () => {
      try {
        const res = await fetch(`/api/forum/topics?category=${slug}&sort=${sort}&page=${page}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics || []);
          setTotalPages(data.totalPages || 1);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [slug, sort, page]);

  if (!loading && !category) {
    return (
      <div className="min-h-screen bg-background gradient-mesh text-on-background">
        <NavBar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant">forum</span>
          <p className="text-on-surface-variant">Category not found.</p>
          <Button onClick={() => router.push("/forum")}>Back to Forum</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background gradient-mesh text-on-background">
      <NavBar />

      {/* Category Header */}
      {category && (
        <section className="relative overflow-hidden pt-24 pb-12 px-6">
          <div className={`absolute inset-0 -z-10 bg-linear-to-br ${category.gradient} opacity-5`} />
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
              <Link href="/forum" className="hover:text-primary transition-colors">Forum</Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span>{category.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${category.gradient} flex items-center justify-center shadow-xl`}>
                <span className="material-symbols-outlined text-white text-2xl">{category.icon}</span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold font-headline">{category.name}</h1>
                <p className="text-on-surface-variant text-sm mt-1">{category.description}</p>
              </div>
              <div className="ml-auto">
                {isAuthenticated ? (
                  <Button
                    className={`bg-linear-to-r ${category.gradient} text-white font-bold shadow-lg hover:scale-105 transition-all border-0`}
                    onClick={() => router.push(`/forum/new?category=${category.id}`)}
                  >
                    <span className="material-symbols-outlined text-sm mr-1">add</span>
                    New Topic
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/auth?next=%2Fforum")}>
                    Sign in to Post
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="max-w-5xl mx-auto px-6 pb-20">
        {/* Sort Tabs */}
        <div className="flex gap-2 mb-6">
          {(["latest", "popular", "unanswered"] as SortOption[]).map((s) => (
            <Button
              key={s}
              variant={sort === s ? "default" : "outline"}
              size="sm"
              className="capitalize"
              onClick={() => { setSort(s); setPage(1); }}
            >
              {s}
            </Button>
          ))}
        </div>

        {/* Topics */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/4 animate-pulse" />
            ))}
          </div>
        ) : topics.length === 0 ? (
          <Card className="bg-white/4 border-white/10">
            <CardContent className="p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3 block">forum</span>
              <p className="text-on-surface-variant mb-4">No topics in this category yet.</p>
              {isAuthenticated && (
                <Button
                  onClick={() => router.push(`/forum/new?category=${category?.id}`)}
                  className="bg-primary text-on-primary"
                >
                  Start the First Discussion
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {topics.map((topic) => (
                <Link key={topic.id} href={`/forum/topic/${topic.id}`}>
                  <Card className="group bg-white/4 border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary to-secondary shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                          {topic.author_avatar ? (
                            <Image src={topic.author_avatar} alt={topic.author_name} width={36} height={36} className="w-full h-full object-cover" />
                          ) : (
                            topic.author_name?.charAt(0)?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {topic.is_pinned && (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[9px]">
                                <span className="material-symbols-outlined text-[9px] mr-0.5">push_pin</span> Pinned
                              </Badge>
                            )}
                            {topic.is_solved && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-[9px]">
                                <span className="material-symbols-outlined text-[9px] mr-0.5">check_circle</span> Solved
                              </Badge>
                            )}
                            {topic.is_locked && (
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[9px]">
                                <span className="material-symbols-outlined text-[9px] mr-0.5">lock</span> Locked
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1 mb-1">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">{topic.content}</p>
                          {topic.tags && topic.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap mb-2">
                              {topic.tags.slice(0, 4).map((tag) => (
                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/6 text-on-surface-variant">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-[10px] text-on-surface-variant flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">person</span>
                              {topic.author_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">chat_bubble_outline</span>
                              {topic.reply_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">favorite_outline</span>
                              {topic.like_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[10px]">visibility</span>
                              {topic.view_count}
                            </span>
                            <span className="ml-auto">{timeAgo(topic.last_reply_at || topic.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-on-surface-variant">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

    </div>
  );
}
