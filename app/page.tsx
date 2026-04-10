"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/NavBar";
import {
  useFeaturedPosts,
  useCommunityReviews,
  usePublicStats,
  useResearchFeed,
  useForumTopics,
} from "@/hooks/useHomeData";
import type {
  FeaturedPost,
  ResearchItem,
} from "@/services/home";

const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  useScrollReveal();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── React Query hooks (cached, deduplicated, auto-revalidated) ────────────
  const { data: postsData } = useFeaturedPosts();
  const { data: recentReviews = [] } = useCommunityReviews();
  const { data: publicStats } = usePublicStats();
  const { data: researchData } = useResearchFeed();
  const { data: forumTopics = [] } = useForumTopics();

  const featuredPosts: FeaturedPost[] = postsData?.posts ?? [];
  const totalPostCount = postsData?.total ?? null;
  const researchFeed: ResearchItem[] = researchData?.researchFeed ?? [];
  const worldNews: ResearchItem[] = researchData?.worldNews ?? [];

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/community?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen text-on-background bg-background gradient-mesh">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-8 pt-28 pb-20">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-[46%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-150 h-150 gradient-blob-blue rounded-full"></div>
            <div className="absolute top-24 left-[16%] w-72 h-72 rounded-full gradient-blob-emerald"></div>
            <div className="absolute bottom-24 right-[14%] w-80 h-80 rounded-full gradient-blob-blue"></div>
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
              <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              AI-Powered Editorial
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold font-headline leading-[1.05] tracking-tighter mb-6 text-on-surface"
            >
              Elevate Your Blog and
              <br />
              <span className="text-gradient">Career with AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A premium digital ecosystem where generative intelligence meets professional journalism. Redefining how the world creates, learns, and builds careers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button asChild className="px-8 py-3.5 h-auto bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all">
                <Link href={mounted && isAuthenticated ? "/pricing" : "/auth?next=%2Fpricing"}>Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" className="px-8 py-3.5 h-auto font-bold rounded-xl border-on-surface-variant/20 hover:bg-primary/5">
                <Link href="/community">Join Community</Link>
              </Button>
            </motion.div>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onSubmit={handleSearch}
              className="mt-12 max-w-xl mx-auto w-full"
            >
              <div className="relative group">
                {/* Outer animated glow */}
                <div className="absolute -inset-1 bg-linear-to-r from-primary via-secondary to-tertiary rounded-full opacity-0 group-hover:opacity-30 group-focus-within:opacity-50 blur-lg transition-all duration-700"></div>
                {/* Inner border glow */}
                <div className="absolute -inset-px bg-linear-to-r from-primary/40 via-secondary/30 to-tertiary/40 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-400"></div>
                {/* Search pill */}
                <div className="relative flex items-center bg-white dark:bg-surface-container-high/80 backdrop-blur-xl border border-black/5 dark:border-outline-variant/15 rounded-full overflow-hidden focus-within:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="pl-5 pr-1 flex items-center">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-xl group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                  </div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search topics, posts & creators..."
                    className="flex-1 bg-transparent border-none px-3 py-4 text-sm text-on-surface placeholder:text-on-surface-variant/35 outline-none font-medium tracking-wide focus-visible:ring-0 shadow-none h-auto"
                  />
                  <Button
                    type="submit"
                    aria-label="Search"
                    className="mr-1.5 px-3 py-2.5 h-auto bg-primary text-white font-extrabold text-xs rounded-full hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-200"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Button>
                </div>
              </div>
              {/* Trending Tags */}
              <div className="flex gap-2 mt-5 justify-center flex-wrap">
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] self-center mr-1">Trending</span>
                {["AI & ML", "Career", "Engineering", "Design", "Writing"].map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:border-primary/50 hover:text-primary hover:bg-primary/10 hover:shadow-sm hover:shadow-primary/10 active:scale-95 transition-all duration-200"
                    onClick={() => { setSearchQuery(tag); router.push(`/community?search=${encodeURIComponent(tag)}`); }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.form>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 mt-16"
          >
            {[
              { value: publicStats?.display.activeCreators || "0", label: "Active Creators", glass: "glass-card-blue" },
              { value: publicStats?.display.syntheticPosts || "0", label: "Published Posts", glass: "glass-card-purple" },
              { value: publicStats?.display.monthlyReads || "0", label: "Monthly Reads", glass: "glass-card-emerald" },
              { value: publicStats?.display.industryMentors || "0", label: "Industry Mentors", glass: "glass-card-pink" },
            ].map((stat) => (
              <Card key={stat.label} className={`${stat.glass} relative overflow-hidden text-center transition-all duration-300 group hover:-translate-y-0.5`}>
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
                <CardContent className="relative p-6">
                  <span className="text-3xl sm:text-4xl font-extrabold font-headline block mb-2 group-hover:text-primary transition-colors">{stat.value}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">{stat.label}</span>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </section>

        {/* Featured Stories */}
        <section className="py-20 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4 reveal-on-scroll">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase block mb-2">Curated Content</span>
                <h2 className="text-4xl sm:text-5xl font-extrabold font-headline tracking-tighter">Featured Stories</h2>
              </div>
              <Button asChild variant="link" className="text-primary p-0 h-auto">
                <Link href="/community">
                  Explore All Stories <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 reveal-on-scroll">
              {featuredPosts.length > 0 ? (
                <>
                  {/* Card 1 - Large */}
                  <Link href={`/blog/${featuredPosts[0].slug || featuredPosts[0].id}`} className="relative group overflow-hidden rounded-2xl glass-card h-105 hover:border-primary/20 transition-all block">
                    {featuredPosts[0].cover_image_url && (
                      <Image
                        src={featuredPosts[0].cover_image_url}
                        alt={featuredPosts[0].title}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                      {featuredPosts[0].topic && (
                        <Badge variant="outline" className="bg-primary/20 border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">{featuredPosts[0].topic}</Badge>
                      )}
                      {featuredPosts[0].category && (
                        <Badge variant="outline" className="ml-2 bg-white/10 border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-4">{featuredPosts[0].category}</Badge>
                      )}
                      <h3 className="text-2xl font-bold font-headline mb-2 text-white">{featuredPosts[0].title}</h3>
                      <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{featuredPosts[0].excerpt}</p>
                      <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                        {featuredPosts[0].profiles && (
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={featuredPosts[0].profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${featuredPosts[0].profiles.name}`} />
                              <AvatarFallback>{featuredPosts[0].profiles.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-semibold text-white text-xs">{featuredPosts[0].profiles.name}</span>
                              <span className="block text-[10px] text-on-surface-variant">{new Date(featuredPosts[0].created_at).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                        <div className="ml-auto flex items-center gap-3 text-[11px] text-on-surface-variant/70">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings:"'FILL' 1"}}>visibility</span>{featuredPosts[0].views || 0}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings:"'FILL' 1"}}>favorite</span>{featuredPosts[0].likes_count || 0}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings:"'FILL' 1"}}>chat_bubble</span>{featuredPosts[0].comments_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Right column - stacked cards */}
                  <div className="flex flex-col gap-6">
                    {featuredPosts.slice(1, 3).map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug || post.id}`} className="relative group overflow-hidden rounded-2xl glass-card h-50 hover:border-primary/20 transition-all block">
                        {post.cover_image_url && (
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-linear-to-r from-black/80 to-transparent z-10"></div>
                        <div className="absolute inset-0 p-6 z-20 flex flex-col justify-end">
                          {post.topic && (
                            <Badge variant="outline" className="bg-primary/20 border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider mb-3 w-fit">{post.topic}</Badge>
                          )}
                          {post.category && (
                            <Badge variant="outline" className="ml-2 bg-white/10 border-white/20 text-white text-[10px] font-bold uppercase tracking-wider mb-3 w-fit">{post.category}</Badge>
                          )}
                          <h3 className="text-xl font-bold font-headline text-white">{post.title}</h3>
                          {post.profiles && (
                            <p className="text-xs text-on-surface-variant mt-1">{post.profiles.name} • {new Date(post.created_at).toLocaleDateString()}</p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-on-surface-variant/60 mt-1.5">
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings:"'FILL' 1"}}>visibility</span>{post.views || 0}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings:"'FILL' 1"}}>favorite</span>{post.likes_count || 0}</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]" style={{fontVariationSettings:"'FILL' 1"}}>chat_bubble</span>{post.comments_count || 0}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {featuredPosts.length < 3 && (
                      <div className="relative overflow-hidden rounded-2xl glass-card h-50 flex items-center justify-center">
                        <p className="text-on-surface-variant text-sm">More stories coming soon</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="col-span-2 text-center py-16">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4 block">article</span>
                  <p className="text-on-surface-variant">No stories yet. Be the first to publish!</p>
                  <Button asChild variant="link" className="mt-4 text-primary">
                    <Link href="/editor">Create a Post</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Logged-in User Insights Bar */}
        {mounted && isAuthenticated && (
          <div className="px-4 sm:px-8 pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="rounded-2xl overflow-hidden glass-card">
                <div className="px-6 py-4 flex flex-wrap items-center gap-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">Your Library</span>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500 text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>article</span>
                    <span className="text-sm font-bold text-on-surface">{totalPostCount != null ? totalPostCount : featuredPosts.length > 0 ? `${featuredPosts.length}+` : "—"} Blog Posts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>science</span>
                    <span className="text-sm font-bold text-on-surface">{researchFeed.length} Research Papers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-violet-500 text-[18px]" style={{fontVariationSettings:"'FILL' 1"}}>newspaper</span>
                    <span className="text-sm font-bold text-on-surface">Live News Feed</span>
                  </div>
                  <div className="ml-auto flex gap-3">
                    <Button asChild size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs">
                      <Link href="/community">All Posts</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 text-xs">
                      <Link href="/innovation">Research</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signal Deck: Research, News, Forum */}
        <section className="px-4 sm:px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <div
              className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8"
            >
              <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
              <div className="absolute inset-x-10 top-[46%] h-24 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
              <div className="absolute -right-16 -bottom-18 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                  Live Discovery Deck
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tighter text-on-surface">
                  World Research, News, And Forum Momentum
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-on-surface-variant/75">
                  Fresh cards stream from global research papers, world AI news, and active forum discussions. Open any card to jump directly into the source.
                </p>

                <div className="mt-7 grid grid-cols-1 xl:grid-cols-12 gap-4">
                  <div className="xl:col-span-4 rounded-2xl glass-card-blue p-5">
                    <p className="text-xs font-semibold text-primary">Quick Access</p>
                    <div className="mt-4 grid gap-3">
                      {[
                        { href: "/innovation", icon: "science", title: "Research Papers", count: researchFeed.length, hint: "Latest publications and innovation signals" },
                        { href: "/innovation", icon: "newspaper", title: "World News", count: worldNews.length, hint: "Global AI and science updates" },
                        { href: "/forum", icon: "forum", title: "Forum Topics", count: forumTopics.length, hint: "Live community threads and replies" },
                      ].map((card) => (
                        <Link
                          key={card.title}
                          href={card.href}
                          className="group relative overflow-hidden rounded-xl glass-card px-4 py-3 hover:border-primary/40 transition-all"
                        >
                          <div className="absolute inset-0 bg-linear-to-r from-primary/15 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">{card.icon}</span>
                            <div>
                              <p className="text-sm font-bold text-on-surface">{card.title}</p>
                              <p className="text-[11px] text-on-surface-variant/80">{card.count} cards live now</p>
                              <p className="text-[11px] text-on-surface-variant/60 mt-1">{card.hint}</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {researchFeed.slice(0, 3).map((item) => (
                      <Link
                        key={`research-${item.id}`}
                        href={`/innovation?tab=research&story=${encodeURIComponent(item.id)}`}
                        className="group relative overflow-hidden rounded-xl glass-card-blue p-4 hover:border-primary/40 transition-all"
                      >
                        <div className="absolute inset-0 bg-linear-to-br from-primary/15 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="relative text-[10px] uppercase tracking-[0.16em] text-primary font-semibold">Research</p>
                        <h3 className="relative mt-2 text-sm font-bold text-on-surface line-clamp-2">{item.title}</h3>
                        <p className="relative mt-2 text-xs text-on-surface-variant/80 line-clamp-2">{item.summary}</p>
                        <div className="relative mt-2 flex items-center gap-2 text-[10px] text-on-surface-variant/60">
                          {item.sourceName && <span className="truncate max-w-30">{item.sourceName}</span>}
                          {item.sourceName && item.publishedAt && <span>•</span>}
                          {item.publishedAt && <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                        </div>
                      </Link>
                    ))}

                    {worldNews.slice(0, 3).map((item) => (
                      <a
                        key={`news-${item.id}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-xl glass-card-purple p-4 hover:border-secondary/35 transition-all"
                      >
                        <div className="absolute inset-0 bg-linear-to-br from-white/8 via-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="relative text-[10px] uppercase tracking-[0.16em] text-secondary font-semibold">World News</p>
                        <h3 className="relative mt-2 text-sm font-bold text-on-surface line-clamp-2">{item.title}</h3>
                        <p className="relative mt-2 text-xs text-on-surface-variant/80 line-clamp-2">{item.summary}</p>
                        <div className="relative mt-2 flex items-center gap-2 text-[10px] text-on-surface-variant/60">
                          {item.sourceName && <span className="truncate max-w-30">{item.sourceName}</span>}
                          {item.sourceName && item.publishedAt && <span>•</span>}
                          {item.publishedAt && <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                        </div>
                      </a>
                    ))}

                    {forumTopics.slice(0, 3).map((topic) => (
                      <Link
                        key={`forum-${topic.id}`}
                        href={`/forum/topic/${topic.id}`}
                        className="group relative overflow-hidden rounded-xl glass-card-pink p-4 hover:border-tertiary/35 transition-all"
                      >
                        <div className="absolute inset-0 bg-linear-to-br from-tertiary/12 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="relative text-[10px] uppercase tracking-[0.16em] text-tertiary font-semibold flex items-center gap-1">
                          {topic.forum_categories?.icon && <span className="material-symbols-outlined text-[12px]">{topic.forum_categories.icon}</span>}
                          {topic.forum_categories?.name || "Forum Topic"}
                        </p>
                        <h3 className="relative mt-2 text-sm font-bold text-on-surface line-clamp-2">{topic.title}</h3>
                        <p className="relative mt-2 text-xs text-on-surface-variant/80">
                          {topic.reply_count} replies • {topic.like_count} likes
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Theme Showcase */}
        <section className="py-20 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto reveal-on-scroll">
              <div className="relative overflow-hidden glass-card p-6 sm:p-10 rounded-2xl">
              <div className="absolute -top-20 right-8 w-64 h-64 rounded-full bg-primary/6 blur-3xl" />
              <div className="absolute -bottom-16 left-16 w-56 h-56 rounded-full bg-secondary/5 blur-3xl" />

              <div className="relative flex items-center justify-between gap-4 flex-wrap mb-8">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.25em] text-on-surface-variant uppercase block mb-2">Theme Gallery</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tighter text-on-surface">340+ Blog Themes Across 30 Categories</h2>
                  <p className="text-sm text-on-surface-variant/70 mt-2 max-w-2xl">
                    Professional editorial palettes for every niche — from business to photography, code to culinary. Pick a theme and start writing instantly.
                  </p>
                </div>
                <Button asChild variant="outline" className="border-on-surface-variant/20 text-on-surface-variant hover:bg-primary/5">
                  <Link href="/blog-themes">View All Themes →</Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 relative">
                {[
                  { name: "Sahara Executive", cat: "Business", desc: "Warm tones for corporate storytelling and thought leadership.", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop&q=80", font: "'Playfair Display', Georgia, serif", fontLabel: "Playfair Display", accent: "#c99a5b" },
                  { name: "Neon Circuit", cat: "Technology", desc: "Futuristic neon palette for tech blogs and startup chronicles.", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=340&fit=crop&q=80", font: "'JetBrains Mono', 'Fira Code', monospace", fontLabel: "JetBrains Mono", accent: "#00f0ff" },
                  { name: "Cosmos", cat: "Science", desc: "Deep space aesthetic for research papers and scientific discovery.", image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=440&fit=crop&q=80", font: "'Space Grotesk', 'Inter', sans-serif", fontLabel: "Space Grotesk", accent: "#7c6cf0" },
                  { name: "Dark Gallery", cat: "Photography", desc: "Moody gallery layout to showcase visual portfolios and photo essays.", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=360&fit=crop&q=80", font: "'Lora', Georgia, serif", fontLabel: "Lora", accent: "#d4944c" },
                  { name: "Dracula Code", cat: "Code Space", desc: "Syntax-highlighted dark theme for developer tutorials and docs.", image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=380&fit=crop&q=80", font: "'Fira Code', monospace", fontLabel: "Fira Code", accent: "#58a6ff" },
                  { name: "Zen Garden", cat: "Wellness", desc: "Serene greens and soft tones for mindfulness and health content.", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=480&fit=crop&q=80", font: "'Source Serif 4', Georgia, serif", fontLabel: "Source Serif 4", accent: "#4ade80" },
                  { name: "Fire Kitchen", cat: "Culinary", desc: "Bold warm palette for recipes, food reviews, and culinary arts.", image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=340&fit=crop&q=80", font: "'Merriweather', Georgia, serif", fontLabel: "Merriweather", accent: "#f97316" },
                  { name: "Compass", cat: "Travel", desc: "Adventure-ready layout for travel journals and destination guides.", image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=420&fit=crop&q=80", font: "'Nunito Sans', sans-serif", fontLabel: "Nunito Sans", accent: "#38bdf8" },
                  { name: "Marble Estate", cat: "Real Estate", desc: "Luxurious tones for property showcases and architectural stories.", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=400&fit=crop&q=80", font: "'Cormorant Garamond', Georgia, serif", fontLabel: "Cormorant Garamond", accent: "#4d8ef7" },
                  { name: "Brutalist", cat: "Architecture", desc: "Raw concrete geometry for structural design and interiors.", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=440&fit=crop&q=80", font: "'Montserrat', sans-serif", fontLabel: "Montserrat", accent: "#c8b890" },
                  { name: "Runway", cat: "Fashion", desc: "Sleek editorial for haute couture and lifestyle storytelling.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=380&fit=crop&q=80", font: "'Poppins', sans-serif", fontLabel: "Poppins", accent: "#f472b6" },
                  { name: "Neon Arena", cat: "Gaming", desc: "High-energy neon for esports, game reviews, and streaming.", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=420&fit=crop&q=80", font: "'Orbitron', sans-serif", fontLabel: "Orbitron", accent: "#a855f7" },
                  { name: "Speedline", cat: "Automotive", desc: "Performance-driven layout for motorsport and car culture.", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&q=80", font: "'Rajdhani', sans-serif", fontLabel: "Rajdhani", accent: "#ef4444" },
                  { name: "Arena", cat: "Sports", desc: "Bold athletic design for training, analysis, and competition.", image: "https://images.unsplash.com/photo-1461896836934-bd45ba8c5e78?w=400&h=460&fit=crop&q=80", font: "'Barlow', sans-serif", fontLabel: "Barlow", accent: "#06b6d4" },
                  { name: "Old Growth", cat: "Environment", desc: "Eco-conscious design for conservation and sustainability.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=440&fit=crop&q=80", font: "'Libre Baskerville', Georgia, serif", fontLabel: "Libre Baskerville", accent: "#22c55e" },
                  { name: "Gradient Wave", cat: "Social", desc: "Vibrant gradients for creators, influencers, and digital content.", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=380&fit=crop&q=80", font: "'DM Sans', sans-serif", fontLabel: "DM Sans", accent: "#e040a0" },
                  { name: "Parchment Chronicle", cat: "History", desc: "Aged warm tones for historical storytelling and cultural heritage.", image: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=400&h=400&fit=crop&q=80", font: "'Crimson Pro', Georgia, serif", fontLabel: "Crimson Pro", accent: "#d4a048" },
                  { name: "Perception", cat: "Psychology", desc: "Deep purple tones for cognitive psychology and behavioral science.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=420&fit=crop&q=80", font: "'Source Serif 4', Georgia, serif", fontLabel: "Source Serif 4", accent: "#b060e0" },
                  { name: "Neural Net", cat: "AI & ML", desc: "Blue circuit aesthetic for deep learning and artificial intelligence.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=380&fit=crop&q=80", font: "'Space Grotesk', sans-serif", fontLabel: "Space Grotesk", accent: "#38bdf8" },
                  { name: "Digital Ledger", cat: "Crypto", desc: "Gold and black for Bitcoin, blockchain, and Web3 analysis.", image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=440&fit=crop&q=80", font: "'Rajdhani', sans-serif", fontLabel: "Rajdhani", accent: "#f59e0b" },
                  { name: "Capitol Report", cat: "Politics", desc: "Authoritative style for political analysis and social commentary.", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=400&fit=crop&q=80", font: "'IBM Plex Serif', Georgia, serif", fontLabel: "IBM Plex Serif", accent: "#dc2626" },
                  { name: "Growth Mindset", cat: "Self-Growth", desc: "Teal-forward theme for self-improvement and productivity.", image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=400&h=380&fit=crop&q=80", font: "'Nunito Sans', sans-serif", fontLabel: "Nunito Sans", accent: "#14b8a6" },
                  { name: "Workshop", cat: "DIY", desc: "Warm wood tones for maker projects, tutorials, and crafts.", image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=420&fit=crop&q=80", font: "'Merriweather', Georgia, serif", fontLabel: "Merriweather", accent: "#ea580c" },
                  { name: "Companion", cat: "Pets", desc: "Friendly theme for pet care, animal behavior, and vet science.", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop&q=80", font: "'Poppins', sans-serif", fontLabel: "Poppins", accent: "#84cc16" },
                  { name: "Nebula", cat: "Space", desc: "Deep cosmic purples for space exploration and astronomy.", image: "https://images.unsplash.com/photo-1462332420958-a33f540d6b5d?w=400&h=440&fit=crop&q=80", font: "'Orbitron', sans-serif", fontLabel: "Orbitron", accent: "#818cf8" },
                  { name: "Symposium", cat: "Philosophy", desc: "Elegant theme for philosophical essays and intellectual discourse.", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=380&fit=crop&q=80", font: "'Cormorant Garamond', Georgia, serif", fontLabel: "Cormorant Garamond", accent: "#a78bfa" },
                ].map((theme) => (
                  <div key={theme.name} className="group relative block overflow-hidden border bg-black/30 hover:bg-black/45 transition-all" style={{ borderColor: `${theme.accent}25` }}>
                    <div className="h-44 overflow-hidden relative">
                      <Image
                        src={theme.image}
                        alt={theme.name}
                        width={400}
                        height={440}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 to-transparent" />
                      {/* Hover overlay with description + View Detail */}
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs leading-relaxed mb-3" style={{ fontFamily: theme.font, color: `${theme.accent}dd` }}>{theme.desc}</p>
                        <span className="text-[9px] uppercase tracking-widest mb-3" style={{ color: `${theme.accent}99` }}>Font: {theme.fontLabel}</span>
                        <Link
                          href="/blog-themes"
                          className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                          style={{ borderWidth: 1, borderStyle: "solid", borderColor: `${theme.accent}80`, color: theme.accent }}
                        >
                          View Detail
                        </Link>
                      </div>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 p-3 pointer-events-none">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] block mb-0.5" style={{ color: `${theme.accent}cc` }}>{theme.cat}</span>
                      <span className="text-xs font-bold text-white leading-tight" style={{ fontFamily: theme.font }}>{theme.name}</span>
                    </div>
                    <div className="border-t px-3 py-2 text-[11px] bg-black/45" style={{ borderColor: `${theme.accent}20`, color: `${theme.accent}bb`, fontFamily: theme.font }}>
                      Open this theme in editor
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Beyond a Platform - Career Engine */}
        <section className="py-20 sm:py-28 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start reveal-on-scroll">
              <div>
                <h2 className="text-4xl sm:text-5xl font-extrabold font-headline tracking-tighter leading-[1.1] mb-8">
                  Beyond a Platform.<br />
                  A <span className="text-primary">Career Engine.</span>
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg glass-card-blue flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-lg">groups</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface mb-1">Elite Peer Network</h4>
                      <p className="text-sm text-on-surface-variant">Connect with senior editors and tech leads from the world&apos;s top firms.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg glass-card-purple flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary text-lg">auto_awesome</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface mb-1">AI-Powered Career Tracks</h4>
                      <p className="text-sm text-on-surface-variant">Personalized roadmaps generated from your writing style and audience engagement.</p>
                    </div>
                  </div>
                </div>

                <Button asChild variant="outline" className="mt-8 px-8 py-3.5 h-auto border-primary text-primary font-bold rounded-xl hover:bg-primary/10">
                  <Link href="/community">Join the Community</Link>
                </Button>
              </div>

              {/* Dynamic community review cards with curved/tilted layout */}
              <Card
                className="relative overflow-hidden glass-card border-outline-variant/10"
                style={{
                  borderRadius: "56% 44% 52% 48% / 26% 32% 68% 74%",
                  transform: "rotate(-1.4deg)",
                }}
              >
                <div className="absolute -top-8 right-6 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl" />
                <div className="absolute -bottom-10 left-6 h-28 w-28 rounded-full bg-blue-400/10 blur-2xl" />
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16 rounded-lg">
                      <AvatarImage src={recentReviews[0]?.author?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Community"} />
                      <AvatarFallback className="rounded-lg">CM</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-on-surface">{recentReviews[0]?.author?.name || "Community Member"}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-primary">Verified Community Review</p>
                    </div>
                  </div>
                  <blockquote className="text-on-surface-variant italic leading-relaxed mb-6">
                    &ldquo;{recentReviews[0]?.comment || "Community feedback will appear here as members post reviews."}&rdquo;
                  </blockquote>
                  <Separator className="mb-4" />
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-on-surface-variant">
                    <span>Reviewed {recentReviews[0]?.created_at ? new Date(recentReviews[0].created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                    <Badge variant="outline" className="text-amber-300 border-amber-400/30">
                      {"★".repeat(Math.max(1, Math.min(5, recentReviews[0]?.rating || 5)))}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {recentReviews.length > 1 && (
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {recentReviews.slice(1, 3).map((review) => (
                    <Card
                      key={review.id}
                      className="glass-card border-outline-variant/10 transition-transform"
                      style={{
                        borderRadius: "22% 78% 30% 70% / 63% 31% 69% 37%",
                        transform: review.id === recentReviews[1]?.id ? "rotate(1.6deg)" : "rotate(-1.1deg)",
                      }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-on-surface">{review.author?.name || 'Community Member'}</p>
                          <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-300">{'★'.repeat(Math.max(1, Math.min(5, review.rating || 1)))}</Badge>
                        </div>
                        <p className="text-sm text-on-surface-variant line-clamp-3">{review.comment}</p>
                        {review.postSlug && (
                          <Link href={`/blog/${review.postSlug}`} className="mt-3 inline-block text-xs text-primary hover:underline">
                            Read: {review.postTitle || 'View post'}
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}