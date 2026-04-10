"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  slug: string;
  topic_count: number;
  post_count: number;
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
  forum_categories?: {
    name: string;
    slug: string;
    gradient: string;
    icon: string;
  };
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

export default function ForumPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recentTopics, setRecentTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, topicsRes] = await Promise.all([
          fetch("/api/forum/categories"),
          fetch("/api/forum/topics?limit=10&sort=latest"),
        ]);
        const catsData = catsRes.ok ? await catsRes.json() : {};
        const topicsData = topicsRes.ok ? await topicsRes.json() : {};
        setCategories(catsData.categories || []);
        setRecentTopics(topicsData.topics || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = search
    ? recentTopics.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      )
    : recentTopics;

  return (
    <div className="min-h-screen text-on-background bg-background gradient-mesh">
      <NavBar />

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 sm:px-8 pt-28 pb-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[46%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-150 h-150 gradient-blob-blue rounded-full" />
          <div className="absolute top-24 left-[16%] w-72 h-72 rounded-full gradient-blob-emerald" />
          <div className="absolute bottom-24 right-[14%] w-80 h-80 rounded-full gradient-blob-blue" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-8"
          >
            <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
            Community Forum
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-headline leading-[1.05] tracking-tighter mb-6 text-on-surface"
          >
            Ask. Answer.
            <br />
            <span className="text-gradient">Grow Together.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join the community to share knowledge, ask questions, and connect with thousands of AI enthusiasts, developers, and career builders.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <Button
                className="px-8 py-3.5 h-auto bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all"
                onClick={() => router.push("/forum/new")}
              >
                <span className="material-symbols-outlined text-sm mr-1">add</span>
                Start a Discussion
              </Button>
            ) : (
              <Button
                className="px-8 py-3.5 h-auto bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all"
                onClick={() => router.push("/auth?next=%2Fforum")}
              >
                Join the Forum
              </Button>
            )}
            <Button
              variant="outline"
              className="px-8 py-3.5 h-auto font-bold rounded-xl border-on-surface-variant/20 hover:bg-primary/5"
              onClick={() => router.push("/community")}
            >
              <span className="material-symbols-outlined text-sm mr-1">groups</span>
              Community Feed
            </Button>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 max-w-xl mx-auto w-full"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-primary via-secondary to-tertiary rounded-full opacity-0 group-hover:opacity-30 group-focus-within:opacity-50 blur-lg transition-all duration-700" />
              <div className="absolute -inset-px bg-linear-to-r from-primary/40 via-secondary/30 to-tertiary/40 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-400" />
              <div className="relative flex items-center bg-white dark:bg-surface-container-high/80 backdrop-blur-xl border border-black/5 dark:border-outline-variant/15 rounded-full overflow-hidden focus-within:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="pl-5 pr-1 flex items-center">
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-xl group-focus-within:text-primary transition-all" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                </div>
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search discussions, topics & tags..."
                  className="flex-1 bg-transparent border-none px-3 py-4 text-sm text-on-surface placeholder:text-on-surface-variant/35 outline-none font-medium tracking-wide focus-visible:ring-0 shadow-none h-auto"
                />
                <Button
                  type="button"
                  aria-label="Search"
                  className="mr-1.5 px-3 py-2.5 h-auto bg-primary text-white font-extrabold text-xs rounded-full hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 mt-16"
        >
          {[
            { value: categories.length, label: "Categories", icon: "category", gradient: "from-blue-500/10 to-cyan-500/5", border: "hover:border-primary/30", glow: "hover:shadow-primary/10" },
            { value: recentTopics.length > 0 ? `${recentTopics.length}+` : "0", label: "Discussions", icon: "chat_bubble", gradient: "from-violet-500/10 to-purple-500/5", border: "hover:border-violet-500/30", glow: "hover:shadow-violet-500/10" },
            { value: "120K+", label: "Members", icon: "group", gradient: "from-emerald-500/10 to-teal-500/5", border: "hover:border-emerald-500/30", glow: "hover:shadow-emerald-500/10" },
            { value: "4.2K+", label: "Daily Active", icon: "trending_up", gradient: "from-pink-500/10 to-rose-500/5", border: "hover:border-pink-500/30", glow: "hover:shadow-pink-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className={`relative overflow-hidden backdrop-blur-xl border border-black/5 dark:border-white/10 text-center ${stat.border} hover:bg-primary/5 transition-all duration-300 group shadow-sm hover:shadow-lg ${stat.glow} hover:-translate-y-0.5`}>
              <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-60`} />
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <CardContent className="relative p-6">
                <span className="material-symbols-outlined text-primary text-2xl block mb-2">{stat.icon}</span>
                <span className="text-3xl sm:text-4xl font-extrabold font-headline block mb-2 group-hover:text-primary transition-colors">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">{stat.label}</span>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* ── Categories Section ────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-2">Explore Topics</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold font-headline tracking-tighter">Browse Categories</h2>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-black/5 dark:bg-white/4 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link href={`/forum/category/${cat.slug}`}>
                    <Card className="group relative overflow-hidden border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/4 hover:bg-primary/5 dark:hover:bg-white/8 hover:border-primary/20 dark:hover:border-white/20 transition-all duration-300 cursor-pointer h-full hover:scale-[1.02] hover:shadow-xl">
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${cat.gradient}`} />
                      <div className={`absolute -top-8 -right-8 w-32 h-32 bg-linear-to-br ${cat.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                      <CardContent className="p-5 relative">
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${cat.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                          <span className="material-symbols-outlined text-white text-lg">{cat.icon}</span>
                        </div>
                        <h3 className="font-bold text-sm mb-1 text-on-surface group-hover:text-primary transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">
                          {cat.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">forum</span>
                            {cat.topic_count} topics
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Recent Discussions ────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-8 border-t border-black/5 dark:border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4"
          >
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-2">Latest Threads</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold font-headline tracking-tighter">Recent Discussions</h2>
            </div>
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined text-on-surface-variant/40 absolute left-3 top-1/2 -translate-y-1/2 text-lg">search</span>
              <Input
                placeholder="Filter discussions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-white/4 border-black/10 dark:border-white/10 rounded-xl focus-visible:ring-primary/30"
              />
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-black/5 dark:bg-white/4 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10">
              <CardContent className="p-16 text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">forum</span>
                <h3 className="text-lg font-bold text-on-surface mb-2">
                  {search ? "No matches found" : "No discussions yet"}
                </h3>
                <p className="text-on-surface-variant text-sm mb-6">
                  {search
                    ? "Try a different search term."
                    : "Be the first to start a conversation!"}
                </p>
                {isAuthenticated && !search && (
                  <Button
                    className="bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90"
                    onClick={() => router.push("/forum/new")}
                  >
                    <span className="material-symbols-outlined text-sm mr-1">add</span>
                    Start a Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="space-y-3"
            >
              {filtered.map((topic) => (
                <motion.div
                  key={topic.id}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link href={`/forum/topic/${topic.id}`}>
                    <Card className="group bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10 hover:bg-primary/5 dark:hover:bg-white/8 hover:border-primary/20 dark:hover:border-white/20 transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-secondary shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-black/5 dark:ring-white/10">
                            {topic.author_avatar ? (
                              <Image src={topic.author_avatar} alt={topic.author_name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              topic.author_name?.charAt(0)?.toUpperCase() || "U"
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              {topic.is_pinned && (
                                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px]">
                                  <span className="material-symbols-outlined text-[9px] mr-0.5">push_pin</span>
                                  Pinned
                                </Badge>
                              )}
                              {topic.is_solved && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px]">
                                  <span className="material-symbols-outlined text-[9px] mr-0.5">check_circle</span>
                                  Solved
                                </Badge>
                              )}
                              {topic.is_locked && (
                                <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[9px]">
                                  <span className="material-symbols-outlined text-[9px] mr-0.5">lock</span>
                                  Locked
                                </Badge>
                              )}
                              {topic.forum_categories && (
                                <Badge className={`bg-linear-to-r ${topic.forum_categories.gradient} text-white text-[9px] border-0`}>
                                  {topic.forum_categories.name}
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1 mb-1">
                              {topic.title}
                            </h3>
                            <p className="text-xs text-on-surface-variant line-clamp-1 mb-2.5">
                              {topic.content}
                            </p>

                            <div className="flex items-center gap-4 text-[10px] text-on-surface-variant flex-wrap">
                              <span className="flex items-center gap-1 font-medium">
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
                              <span className="ml-auto text-[10px] text-on-surface-variant/60">{timeAgo(topic.last_reply_at || topic.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}

              <div className="text-center pt-8">
                <Button
                  variant="outline"
                  className="px-8 py-3 h-auto font-bold rounded-xl border-on-surface-variant/20 hover:bg-primary/5"
                  onClick={() => router.push("/forum/all")}
                >
                  View All Discussions
                  <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
