"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AiBadge } from "@/components/AiBadge";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

export default function AnalyticsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, loading, router]);
  const [timeRange, setTimeRange] = useState("30d");
  const [platformStats, setPlatformStats] = useState({
    totalViews: 0,
    totalPosts: 0,
    aiGenerations: 0,
    avgEngagement: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    activity_type: string;
    entity_type: string | null;
    entity_id: string | null;
    created_at: string;
    user: { id: string; name: string | null; email: string | null } | null;
  }>>([]);
  const [activityTotals, setActivityTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, activityRes] = await Promise.all([
          fetch("/api/posts?limit=100"),
          fetch("/api/admin/activity?limit=30"),
        ]);
        const postsData = postsRes.ok ? await postsRes.json() : {};
        const activityData = activityRes.ok ? await activityRes.json() : {};

        const allPosts = postsData.posts || [];
        const totalViews = allPosts.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
        const totalLikes = allPosts.reduce((sum: number, p: any) => sum + (p.likes_count || 0), 0);
        const aiPosts = allPosts.filter((p: any) => p.ai_generated).length;
        const avgEngagement = allPosts.length > 0 ? Math.round((totalLikes / Math.max(totalViews, 1)) * 100) : 0;

        setPlatformStats({
          totalViews,
          totalPosts: allPosts.length,
          aiGenerations: aiPosts,
          avgEngagement,
        });

        setRecentActivity(activityData.activities || []);
        setActivityTotals(activityData.totals || {});
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      }
    };
    fetchData();
  }, []);

  // Simulated growth data
  const monthlyGrowth = [
    { month: "Jan", users: 120, posts: 340, ai: 89 },
    { month: "Feb", users: 145, posts: 420, ai: 134 },
    { month: "Mar", users: 180, posts: 510, ai: 167 },
    { month: "Apr", users: 220, posts: 580, ai: 210 },
    { month: "May", users: 310, posts: 690, ai: 298 },
    { month: "Jun", users: 380, posts: 820, ai: 356 },
  ];
  const maxPosts = Math.max(...monthlyGrowth.map((m) => m.posts));

  const careerStats = [
    { track: "AI & Machine Learning", active: 342, completion: 78 },
    { track: "Career Strategy", active: 256, completion: 65 },
    { track: "Editorial Craft", active: 198, completion: 82 },
    { track: "Industry Analysis", active: 167, completion: 71 },
    { track: "Data Science", active: 134, completion: 59 },
  ];

  const aiUsageBreakdown = [
    { type: "Content Generation", count: 4520, pct: 42 },
    { type: "Title Suggestions", count: 2340, pct: 22 },
    { type: "Tone Analysis", count: 1890, pct: 18 },
    { type: "SEO Optimization", count: 1120, pct: 10 },
    { type: "Summarization", count: 860, pct: 8 },
  ];

  const topPerforming = [
    { title: "The Future of AI in Editorial", views: "12.4K", engagement: 94, author: "Julian Sterling" },
    { title: "Career Pivots in the AI Era", views: "9.8K", engagement: 87, author: "Elena Vance" },
    { title: "Building Your AI Portfolio", views: "8.2K", engagement: 82, author: "Dr. Marcus Thorne" },
    { title: "Prompt Engineering Mastery", views: "7.5K", engagement: 79, author: "Sarah Chen" },
  ];

  return (
    <div className="dark min-h-screen bg-background gradient-mesh text-on-background font-body">
      <AdminSideNav activePage="analytics" />
      <AdminTopNav activePage="analytics" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-white mb-2">
              Platform <span className="text-primary italic">Analytics</span>
            </h2>
            <p className="text-on-surface-variant text-sm">Growth metrics, AI usage, and content performance.</p>
          </div>
          <div className="flex gap-2 bg-surface-container-high rounded-lg p-1">
            {["7d", "30d", "90d", "1y"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  timeRange === r ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Views", value: platformStats.totalViews.toLocaleString(), icon: "visibility", change: "+18%", color: "text-primary", aiDerived: false },
            { label: "Published Posts", value: platformStats.totalPosts.toLocaleString(), icon: "article", change: "+12%", color: "text-secondary", aiDerived: false },
            { label: "AI Generations", value: platformStats.aiGenerations.toLocaleString(), icon: "auto_awesome", change: "+34%", color: "text-tertiary", aiDerived: true },
            { label: "Avg Engagement", value: `${platformStats.avgEngagement}%`, icon: "trending_up", change: "+5%", color: "text-green-400", aiDerived: true },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className={`material-symbols-outlined ${s.color}`}>{s.icon}</span>
                <div className="flex items-center gap-2">
                  {s.aiDerived && <AiBadge variant="compact" />}
                  <span className="text-xs font-bold text-green-400">{s.change}</span>
                </div>
              </div>
              <span className="text-3xl font-extrabold font-headline block">{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-headline">Recent User Activity</h3>
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">Admin visibility</span>
          </div>

          {Object.keys(activityTotals).length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {Object.entries(activityTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([type, count]) => (
                  <span key={type} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] text-primary">
                    {type.replace(/_/g, " ")}: {count}
                  </span>
                ))}
            </div>
          )}

          {recentActivity.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No activity logs available yet.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-outline-variant/10 bg-surface-container-low/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.activity_type.replace(/_/g, " ")}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {(entry.user?.name || entry.user?.email || "System")} • {entry.entity_type || "entity"} {entry.entity_id || ""}
                      </p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Growth Chart */}
          <div className="lg:col-span-2 glass-panel rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-headline">Platform Growth</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-[10px] text-on-surface-variant">Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <span className="text-[10px] text-on-surface-variant">Posts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                  <span className="text-[10px] text-on-surface-variant">AI Usage</span>
                </div>
              </div>
            </div>
            <div className="flex items-end gap-3 h-48">
              {monthlyGrowth.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-40">
                    <div
                      className="flex-1 bg-primary/60 rounded-t transition-all"
                      style={{ height: `${(m.users / maxPosts) * 100}%` }}
                    ></div>
                    <div
                      className="flex-1 bg-secondary/60 rounded-t transition-all"
                      style={{ height: `${(m.posts / maxPosts) * 100}%` }}
                    ></div>
                    <div
                      className="flex-1 bg-tertiary/60 rounded-t transition-all"
                      style={{ height: `${(m.ai / maxPosts) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Usage Breakdown */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-bold font-headline mb-6">AI Usage Pulse</h3>
            <div className="space-y-4">
              {aiUsageBreakdown.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{item.type}</span>
                    <span className="text-[10px] text-on-surface-variant">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-primary to-tertiary rounded-full transition-all"
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Career Track Velocity */}
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-bold font-headline mb-6">Career Track Velocity</h3>
            <div className="space-y-4">
              {careerStats.map((c) => (
                <div key={c.track} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold truncate">{c.track}</span>
                      <span className="text-[10px] text-on-surface-variant">{c.active} users</span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-primary to-primary-container rounded-full transition-all"
                        style={{ width: `${c.completion}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary w-10 text-right">{c.completion}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10">
              <h3 className="text-lg font-bold font-headline">Top Performing Content</h3>
            </div>
            <div className="divide-y divide-outline-variant/5">
              {topPerforming.map((post, i) => (
                <div key={post.title} className="flex items-center gap-4 p-4 hover:bg-surface-container-low/50 transition-colors">
                  <span className="text-2xl font-extrabold font-headline text-on-surface-variant/30 w-8">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{post.title}</p>
                    <p className="text-[10px] text-on-surface-variant">{post.author} • {post.views} views</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${post.engagement}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-green-400">{post.engagement}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
