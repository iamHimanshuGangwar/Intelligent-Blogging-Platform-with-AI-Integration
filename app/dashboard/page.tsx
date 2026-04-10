"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  views: number;
  likes_count: number;
  created_at: string;
  ai_generated: boolean;
}

interface Recommendation {
  id: string;
  title: string;
  slug?: string;
  topic?: string;
  score: number;
  reason: string;
}

interface PortfolioMilestone {
  id: string;
  label: string;
  achieved: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [statistics, setStatistics] = useState({
    totalViews: 0,
    engagementRate: 0,
    totalFollowers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [portfolioMilestones, setPortfolioMilestones] = useState<PortfolioMilestone[]>([]);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [postsRes, statsRes, recommendationsRes, portfolioRes] = await Promise.all([
        fetch(`/api/posts?userId=${user.id}`),
        fetch("/api/user/stats"),
        fetch('/api/recommendations?limit=4'),
        fetch('/api/portfolio'),
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts || data || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        console.log('User stats response:', data);
        const { stats } = data;
        setStatistics({
          totalViews: stats.totalViews || 0,
          engagementRate: stats.engagementRate || 0,
          totalFollowers: stats.followersCount || 0,
        });
      }

      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        setRecommendations(data.recommendations || []);
      }

      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        setPortfolioMilestones(data.milestones || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div className="px-4 sm:px-8 gradient-mesh">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter text-on-surface leading-[0.9]">
                  Synthetic{" "}
                  <span className="text-gradient italic">Editorial</span>
                </h1>
                <p className="text-sm text-on-surface-variant mt-3 max-w-md">
                  Track your growth and harness AI-driven insights to refine your narrative authority.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/editor">
                  <Button className="bg-linear-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg font-bold text-sm gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    Draft Post
                  </Button>
                </Link>
                <Button variant="outline" className="border-outline-variant/20 bg-surface-container-high text-on-surface rounded-lg font-bold text-sm gap-2 hover:bg-surface-container-highest">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Generate Ideas
                </Button>
              </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              <Card className="glass-card-blue rounded-2xl hover:border-indigo-400/30 hover:-translate-y-0.5 transition-all">
                <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center" style={{background:"rgba(99,102,241,0.15)"}}>
                    <span className="material-symbols-outlined text-primary">visibility</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Weekly Views</span>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-extrabold font-headline text-on-surface">{(statistics.totalViews / 1000).toFixed(1)}K</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">+12%</Badge>
                  </div>
                  <div className="flex items-end gap-1 h-14">
                    {[40, 55, 35, 70, 60, 85, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-sm hover:bg-primary/30 transition-colors" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card-purple rounded-2xl hover:border-violet-400/30 hover:-translate-y-0.5 transition-all">
                <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center" style={{background:"rgba(139,92,246,0.15)"}}>
                    <span className="material-symbols-outlined text-secondary">bolt</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Engagement Rate</span>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-extrabold font-headline text-on-surface">{statistics.engagementRate}%</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">+2.4%</Badge>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] text-on-surface-variant mb-1.5">
                      <span>Reach</span><span>92%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-linear-to-r from-secondary to-tertiary rounded-full transition-all" style={{ width: "92%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card-emerald rounded-2xl hover:border-emerald-400/30 hover:-translate-y-0.5 transition-all">
                <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center" style={{background:"rgba(16,185,129,0.15)"}}>
                    <span className="material-symbols-outlined text-tertiary">group</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Followers</span>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-extrabold font-headline text-on-surface">{statistics.totalFollowers.toLocaleString()}</span>
                    <span className="text-xs font-medium text-on-surface-variant">Steady</span>
                  </div>
                  <div className="flex -space-x-2">
                    {["Felix", "Ada", "Max"].map((name) => (
                      <Avatar key={name} className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                        <AvatarFallback className="text-[10px]">{name[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="h-8 w-8 rounded-full bg-surface-container-high border-2 border-background flex items-center justify-center text-[10px] font-bold text-on-surface-variant">+1.2k</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold font-headline text-on-surface">Recent Activity</h2>
                  <Link href="/dashboard/posts">
                    <Button variant="ghost" className="text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/5 h-auto py-1">
                      View All Posts
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="glass-card rounded-xl">
                        <CardContent className="flex items-center gap-4 p-4">
                          <Skeleton className="w-12 h-12 rounded-lg bg-surface-container-high" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3 w-20 bg-surface-container-high" />
                            <Skeleton className="h-4 w-48 bg-surface-container-high" />
                            <Skeleton className="h-3 w-32 bg-surface-container-high" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : posts.length === 0 ? (
                    <Card className="glass-card rounded-2xl">
                      <CardContent className="flex flex-col items-center py-12">
                        <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">article</span>
                        </div>
                        <p className="text-on-surface-variant mb-3">No activity yet. Start writing!</p>
                        <Link href="/editor">
                          <Button className="rounded-full bg-primary text-on-primary font-semibold text-sm px-6 gap-2">
                            Create your first post
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    posts.slice(0, 4).map((post) => (
                      <Link key={post.id} href={`/editor?id=${post.id}`} className="block group">
                        <Card className="glass-card rounded-xl hover:border-primary/15 transition-all">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary text-lg">article</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <Badge className="bg-primary/10 text-primary border-0 text-[10px] mb-1 py-0 h-4">Published</Badge>
                              <h4 className="font-semibold text-sm text-on-surface truncate">{post.title}</h4>
                              <span className="text-xs text-on-surface-variant">
                                {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &bull; {post.views || 0} views
                              </span>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary text-lg transition-colors">chevron_right</span>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Career Milestones */}
              <div className="lg:col-span-2 space-y-5">
                <h2 className="text-xl font-bold font-headline text-on-surface">Career Milestones</h2>
                <Card className="glass-card rounded-2xl">
                  <CardContent className="p-5 space-y-5">
                    {portfolioMilestones.length === 0 ? (
                      <p className="text-sm text-on-surface-variant">Milestones will appear as you publish and engage.</p>
                    ) : (
                      portfolioMilestones.map((milestone, index) => (
                        <div key={milestone.id}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${milestone.achieved ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                              <span className={`material-symbols-outlined text-base ${milestone.achieved ? 'text-green-400' : 'text-primary'}`} style={{ fontVariationSettings: milestone.achieved ? "'FILL' 1" : "'FILL' 0" }}>
                                {milestone.achieved ? 'verified' : 'flag'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-on-surface">{milestone.label}</h4>
                              <Badge className={`mt-1.5 text-[10px] ${milestone.achieved ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                {milestone.achieved ? 'Completed' : 'In Progress'}
                              </Badge>
                            </div>
                          </div>
                          {index < portfolioMilestones.length - 1 ? <Separator className="bg-outline-variant/10 mt-4" /> : null}
                        </div>
                      ))
                    )}
                    <Link href="/dashboard/portfolio">
                      <Button variant="outline" className="w-full border-white/15 bg-white/2 hover:bg-white/6">
                        Open Full Portfolio
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* AI Tip */}
                <Card className="glass-card-purple rounded-2xl overflow-hidden relative group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/10 blur-3xl group-hover:bg-secondary/15 transition-all duration-500" />
                  <CardContent className="p-5 relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">AI Insight</span>
                    </div>
                    <p className="text-sm text-on-surface-variant italic leading-relaxed">
                      &ldquo;Your recent articles on &apos;Synthetic Agency&apos; are seeing 40% higher retention. Consider expanding into a 4-part series.&rdquo;
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card rounded-2xl">
                  <CardHeader className="pb-3">
                    <h3 className="font-headline text-sm font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>thumb_up</span>
                      Personalized Recommendations
                    </h3>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {recommendations.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">Engage with a few posts to unlock ranked recommendations.</p>
                    ) : (
                      recommendations.map((item) => (
                        <Link
                          key={item.id}
                          href={`/blog/${item.slug || item.id}`}
                          className="block rounded-lg border border-white/10 bg-white/2 px-3 py-2 hover:bg-white/8 hover:border-primary/25 transition-all"
                        >
                          <p className="text-sm font-semibold text-on-surface line-clamp-1">{item.title}</p>
                          <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{item.reason}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{item.topic || 'General'}</Badge>
                            <span className="text-[10px] text-on-surface-variant">Score {item.score}</span>
                          </div>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
    </div>
  );
}
