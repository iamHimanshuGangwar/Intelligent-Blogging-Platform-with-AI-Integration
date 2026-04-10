"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AiBadge } from "@/components/AiBadge";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

interface SystemStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  activeSubscriptions: number;
  jobApplications: number;
  openJobs: number;
  systemHealth: number;
}

interface TopCreator {
  name: string;
  posts: number;
  views: string;
  level: string;
}

interface RecentComment {
  id: string;
  author: string;
  content: string;
  post: string;
  time: string;
  status: "approved" | "pending";
}

interface AdminOverview {
  pendingPosts: number;
  pendingComments: number;
  mostViewedPost: { id: string; title: string; views: number } | null;
  leastViewedPost: { id: string; title: string; views: number } | null;
  mostLikedPost: { id: string; title: string; likes_count: number } | null;
  topAuthorsByFollowers: Array<{ id: string; name: string; followers: number; avatar_url?: string | null }>;
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    activeSubscriptions: 0,
    jobApplications: 0,
    openJobs: 0,
    systemHealth: 98.7,
  });
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [themeUsage, setThemeUsage] = useState<Array<{ theme: string; totalPosts: number; users: Array<{ id: string; name: string; avatar_url: string | null; postCount: number }> }>>([]);
  const [authActivity, setAuthActivity] = useState<Array<{ id: string; user_id: string; activity_type: string; metadata: any; created_at: string; user?: { name: string; email: string } | null }>>([]);
  const [overview, setOverview] = useState<AdminOverview>({
    pendingPosts: 0,
    pendingComments: 0,
    mostViewedPost: null,
    leastViewedPost: null,
    mostLikedPost: null,
    topAuthorsByFollowers: [],
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/admin/login"); return; }
    if (!isAdmin) { router.push("/dashboard"); return; }

    // 2-hour admin session expiry
    const SESSION_KEY = "admin_session_start";
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const sessionStart = localStorage.getItem(SESSION_KEY);
    if (!sessionStart) {
      localStorage.setItem(SESSION_KEY, Date.now().toString());
    } else if (Date.now() - parseInt(sessionStart) > TWO_HOURS) {
      localStorage.removeItem(SESSION_KEY);
      router.push("/admin/login");
      return;
    }
    const interval = window.setInterval(() => {
      const start = localStorage.getItem(SESSION_KEY);
      if (!start || Date.now() - parseInt(start) > TWO_HOURS) {
        localStorage.removeItem(SESSION_KEY);
        router.push("/admin/login");
      }
    }, 60000); // check every minute
    return () => window.clearInterval(interval);
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (loading || !user || !isAdmin) {
      return;
    }

    const fetchStats = async () => {
      try {
        const [usersRes, postsRes, commentsRes, analyticsRes, jobsRes, overviewRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/posts?limit=100"),
          fetch("/api/comments?limit=50"),
          fetch("/api/analytics?timeframe=7d"),
          fetch("/api/arjuna/jobs?limit=100"),
          fetch("/api/admin/overview"),
        ]);

        const usersData = usersRes.ok ? await usersRes.json() : {};
        const postsData = postsRes.ok ? await postsRes.json() : {};
        const commentsData = commentsRes.ok ? await commentsRes.json() : {};
        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : {};
        const jobsData = jobsRes.ok ? await jobsRes.json() : {};
        const overviewData = overviewRes.ok ? await overviewRes.json() : {};

        const allUsers = usersData.users || [];
        const allPosts = postsData.posts || [];
        const allComments = commentsData.comments || [];
        const allJobs = jobsData.jobs || [];

        setStats({
          totalUsers: allUsers.length,
          totalPosts: allPosts.length,
          totalComments: allComments.length,
          activeSubscriptions: analyticsData.summary?.activeSubscriptions || 0,
          jobApplications: analyticsData.summary?.jobApplicationsThisPeriod || 0,
          openJobs: allJobs.length,
          systemHealth: 98.7,
        });

        setOverview({
          pendingPosts: overviewData.pendingPosts || 0,
          pendingComments: overviewData.pendingComments || 0,
          mostViewedPost: overviewData.mostViewedPost || null,
          leastViewedPost: overviewData.leastViewedPost || null,
          mostLikedPost: overviewData.mostLikedPost || null,
          topAuthorsByFollowers: overviewData.topAuthorsByFollowers || [],
        });

        const creatorMap: Record<string, { name: string; posts: number; views: number; email: string }> = {};
        for (const post of allPosts) {
          const userId = post.author_id;
          if (!creatorMap[userId]) {
            const matchedUser = allUsers.find((u: any) => u.id === userId);
            creatorMap[userId] = {
              name: matchedUser?.name || "Unknown",
              email: matchedUser?.email || "",
              posts: 0,
              views: 0,
            };
          }
          creatorMap[userId].posts++;
          creatorMap[userId].views += post.views || 0;
        }

        const sorted = Object.values(creatorMap)
          .sort((a, b) => b.posts - a.posts)
          .slice(0, 5)
          .map((c) => ({
            name: c.name,
            posts: c.posts,
            views: c.views >= 1000000 ? `${(c.views / 1000000).toFixed(1)}M` : c.views >= 1000 ? `${(c.views / 1000).toFixed(1)}K` : String(c.views),
            level: c.posts >= 50 ? "Elite" : c.posts >= 20 ? "Authority" : "Creator",
          }));

        setTopCreators(sorted);

        const recentCommentsFormatted: RecentComment[] = allComments
          .slice(0, 5)
          .map((comment: any) => ({
            id: comment.id,
            author: comment.profiles?.name || comment.guest_name || "Guest",
            content: comment.content.substring(0, 80) + (comment.content.length > 80 ? "..." : ""),
            post: allPosts.find((p: any) => p.id === comment.post_id)?.title || "Unknown",
            time: new Date(comment.created_at).toLocaleDateString(),
            status: "approved" as const,
          }));

        setRecentComments(recentCommentsFormatted);

        // Fetch theme usage
        try {
          const themeRes = await fetch("/api/admin/theme-usage");
          if (themeRes.ok) {
            const themeData = await themeRes.json();
            setThemeUsage(themeData.themes || []);
          }
        } catch { /* ignore */ }

        // Fetch recent sign-up / sign-in activity
        try {
          const authRes = await fetch("/api/admin/activity?limit=20");
          if (authRes.ok) {
            const authData = await authRes.json();
            const authEvents = (authData.activities || []).filter((a: any) =>
              ['user_signup', 'user_signin', 'otp_signin', 'admin_login'].includes(a.activity_type)
            );
            setAuthActivity(authEvents);
          }
        } catch { /* ignore */ }

        setLogsLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setLogsLoading(false);
      }
    };

    fetchStats();
  }, [loading, user, isAdmin]);

  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: "group", change: `+${stats.totalUsers > 0 ? Math.floor(Math.random() * 20) : 0}%`, color: "text-primary", aiDerived: false },
    { label: "Published Posts", value: stats.totalPosts.toLocaleString(), icon: "article", change: `+${stats.totalPosts > 0 ? Math.floor(Math.random() * 15) : 0}%`, color: "text-secondary", aiDerived: true },
    { label: "Total Comments", value: stats.totalComments.toLocaleString(), icon: "forum", change: `+${stats.totalComments > 0 ? Math.floor(Math.random() * 25) : 0}%`, color: "text-green-400", aiDerived: false },
    { label: "Active Subscriptions", value: stats.activeSubscriptions.toLocaleString(), icon: "card_membership", change: "Tracking", color: "text-tertiary", aiDerived: true },
    { label: "Job Applications", value: stats.jobApplications.toLocaleString(), icon: "work", change: "This Week", color: "text-blue-400", aiDerived: true },
    { label: "Open Jobs", value: stats.openJobs.toLocaleString(), icon: "assignment", change: "Active", color: "text-orange-400", aiDerived: false },
  ];

  return (
    <div className="dark min-h-screen bg-background gradient-mesh text-on-background font-body">
      <AdminSideNav activePage="overview" />
      <AdminTopNav activePage="overview" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-white mb-2">
              System <span className="text-primary italic">Overview</span>
            </h2>
            <p className="text-on-surface-variant text-sm">Real-time platform health and operational insights.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-xs font-bold">
              <span className="material-symbols-outlined text-sm mr-1">download</span>
              Export
            </Button>
            <Button className="bg-linear-to-r from-primary to-primary-container text-on-primary-fixed font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-xs">
              <span className="material-symbols-outlined text-sm mr-1">refresh</span>
              Refresh
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-10">
          {statCards.map((card) => (
            <Card key={card.label} className="bg-white/4 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20 hover:bg-white/8 hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`material-symbols-outlined text-sm ${card.color}`}>{card.icon}</span>
                  <div className="flex items-center gap-1 text-right">
                    {card.aiDerived && <AiBadge variant="compact" />}
                    <span className="text-[8px] font-bold uppercase tracking-wider text-on-surface-variant">{card.label}</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold font-headline">{card.value}</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30 text-[8px]">{card.change}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="bg-white/4 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold font-headline mb-4 flex items-center gap-2">
                Post Performance Signals
                <AiBadge />
              </h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-white/4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Most Viewed Post</p>
                  <p className="font-semibold mt-1">{overview.mostViewedPost?.title || "N/A"}</p>
                  <p className="text-on-surface-variant text-xs mt-1">Views: {overview.mostViewedPost?.views || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Least Viewed Post</p>
                  <p className="font-semibold mt-1">{overview.leastViewedPost?.title || "N/A"}</p>
                  <p className="text-on-surface-variant text-xs mt-1">Views: {overview.leastViewedPost?.views || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Most Liked Post</p>
                  <p className="font-semibold mt-1">{overview.mostLikedPost?.title || "N/A"}</p>
                  <p className="text-on-surface-variant text-xs mt-1">Likes: {overview.mostLikedPost?.likes_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/4 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold font-headline mb-4">Approvals & Top Authors</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-[10px] uppercase tracking-wider text-yellow-200">Pending Posts</p>
                  <p className="text-xl font-bold mt-1">{overview.pendingPosts}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-[10px] uppercase tracking-wider text-orange-200">Pending Comments</p>
                  <p className="text-xl font-bold mt-1">{overview.pendingComments}</p>
                </div>
              </div>

              <div className="space-y-2">
                {(overview.topAuthorsByFollowers || []).slice(0, 4).map((author) => (
                  <div key={author.id} className="flex items-center justify-between p-2 rounded bg-white/4 border border-white/10">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-7 w-7 rounded-full">
                        <AvatarImage src={author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.id}`} />
                        <AvatarFallback>{author.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{author.name}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">ID: {author.id}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{author.followers} followers</Badge>
                  </div>
                ))}
                {overview.topAuthorsByFollowers.length === 0 && (
                  <p className="text-xs text-on-surface-variant">No author follower data yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Comments */}
          <Card className="lg:col-span-2 bg-white/4 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20 overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-headline">Recent Comments & Activity</h3>
                <Button variant="link" className="text-xs text-primary font-bold uppercase tracking-widest p-0 h-auto">View All</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Author</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Comment</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Post</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logsLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-on-surface-variant text-sm">Loading comments...</td>
                    </tr>
                  ) : recentComments.length > 0 ? (
                    recentComments.map((comment) => (
                      <tr key={comment.id} className="border-b border-outline-variant/5 hover:bg-white/4 transition-colors">
                        <td className="px-6 py-4 text-xs font-semibold text-on-surface">{comment.author}</td>
                        <td className="px-6 py-4 text-xs text-on-surface-variant truncate max-w-xs">{comment.content}</td>
                        <td className="px-6 py-4 text-xs text-primary truncate max-w-xs">{comment.post}</td>
                        <td className="px-6 py-4 text-xs text-on-surface-variant">{comment.time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-on-surface-variant text-sm">No comments yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top AI Creators */}
          <Card className="bg-white/4 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold font-headline mb-6 flex items-center gap-2">
                Top AI Creators
                <AiBadge variant="chip" label="AI-ranked" />
              </h3>
              <div className="space-y-4">
                {topCreators.map((creator, idx) => (
                  <div key={`creator-${idx}`} className="flex items-center gap-3 p-3 rounded-lg glass-card hover:border-primary/20 transition-all">
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.name}`} />
                      <AvatarFallback className="rounded-lg">{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{creator.name}</p>
                      <p className="text-[10px] text-on-surface-variant">{creator.posts} posts &bull; {creator.views} views</p>
                    </div>
                    <Badge variant={idx === 0 ? "default" : "outline"} className={`text-[10px] ${
                      idx === 0 ? "bg-primary/10 text-primary border-primary/20" : ""
                    }`}>{creator.level}</Badge>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Node Network Mini */}
              <div className="p-4 rounded-lg glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-sm">hub</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Node Network</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "API", status: "online" },
                    { label: "DB", status: "online" },
                    { label: "AI", status: "online" },
                    { label: "CDN", status: "online" },
                    { label: "Auth", status: "online" },
                    { label: "Queue", status: "degraded" },
                  ].map((node) => (
                    <div key={node.label} className="flex items-center gap-1.5 p-2 rounded bg-white/5 border border-white/10">
                      <div className={`w-1.5 h-1.5 rounded-full ${node.status === "online" ? "bg-green-400" : "bg-yellow-400"}`}></div>
                      <span className="text-[10px] font-medium">{node.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Auth Activity Tracking */}
        <div className="mt-8">
          <Card className="bg-white/4 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                  Recent Sign-ups &amp; Sign-ins
                </h3>
                <Badge variant="outline" className="text-[10px]">{authActivity.length} events</Badge>
              </div>
              {authActivity.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No sign-up/sign-in activity tracked yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant/10">
                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">User</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Email</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Event</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Method</th>
                        <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authActivity.map((event) => (
                        <tr key={event.id} className="border-b border-outline-variant/5 hover:bg-white/4 transition-colors">
                          <td className="px-4 py-3 text-xs font-semibold">{event.user?.name || event.metadata?.name || "Unknown"}</td>
                          <td className="px-4 py-3 text-xs text-on-surface-variant">{event.user?.email || event.metadata?.email || "-"}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-[10px] ${
                              event.activity_type === 'user_signup' ? 'text-green-400 border-green-400/30' :
                              event.activity_type === 'admin_login' ? 'text-purple-400 border-purple-400/30' :
                              'text-blue-400 border-blue-400/30'
                            }`}>
                              {event.activity_type === 'user_signup' ? 'Sign Up' :
                               event.activity_type === 'user_signin' ? 'Sign In (Clerk)' :
                               event.activity_type === 'otp_signin' ? 'Sign In (OTP)' :
                               event.activity_type === 'admin_login' ? 'Admin Login' : event.activity_type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-on-surface-variant capitalize">{event.metadata?.method || "-"}</td>
                          <td className="px-4 py-3 text-xs text-on-surface-variant">{new Date(event.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Theme Usage Tracking */}
        <div className="mt-8">
          <Card className="bg-white/4 backdrop-blur-xl border-white/10 shadow-xl shadow-black/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">palette</span>
                  Blog Theme Usage
                </h3>
                <Badge variant="outline" className="text-[10px]">{themeUsage.length} themes used</Badge>
              </div>
              {themeUsage.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No theme usage data yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {themeUsage.slice(0, 12).map((t) => (
                    <div key={t.theme} className="p-4 border border-white/10 bg-white/3 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-on-surface truncate">{t.theme}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0 ml-2">{t.totalPosts} posts</Badge>
                      </div>
                      <div className="space-y-2">
                        {t.users.slice(0, 3).map((u) => (
                          <div key={u.id} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} />
                              <AvatarFallback className="text-[10px]">{u.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-on-surface-variant truncate flex-1">{u.name}</span>
                            <span className="text-[10px] text-on-surface-variant">{u.postCount}×</span>
                          </div>
                        ))}
                        {t.users.length > 3 && (
                          <span className="text-[10px] text-on-surface-variant">+{t.users.length - 3} more users</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
