"use client";

import { useState, useEffect, useCallback } from "react";

import { useAuth } from "@/context/AuthContext";

export default function InsightsPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<string>("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "90D" | "1Y">("90D");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const fetchAnalyticsData = useCallback(async (range: "7D" | "30D" | "90D" | "1Y") => {
    if (!user?.id) return;
    setLoadingAnalytics(true);
    try {
      const daysMap: Record<typeof range, number> = {
        "7D": 7,
        "30D": 30,
        "90D": 90,
        "1Y": 365,
      };
      const response = await fetch(`/api/analytics/user?days=${daysMap[range]}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAnalyticsData(dateRange);
  }, [dateRange, fetchAnalyticsData]);

  const fetchAIInsights = useCallback(async () => {
    setLoadingAI(true);
    try {
      const summary = analyticsData?.summary;
      const trendList = (analyticsData?.dailyData || [])
        .slice(-10)
        .map((d: any) => `Views:${d.views ?? d.daily_views ?? 0}, Likes:${d.likes ?? d.daily_likes ?? 0}, Comments:${d.comments ?? d.daily_comments ?? 0}`)
        .join(" | ");

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: `Create a concise analytics report for my blog performance. Date range: ${dateRange}. Totals: Views ${summary?.totalViews || 0}, Likes ${summary?.totalLikes || 0}, Comments ${summary?.totalComments || 0}, Shares ${summary?.totalShares || 0}, Followers ${summary?.totalNewFollowers || 0}. Recent daily trend: ${trendList}`,
          tone: "professional",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.content || data?.text || "No AI insights generated.";
        setInsights(content);
      } else {
        setInsights("AI report is currently unavailable. Please retry in a moment.");
      }
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setInsights("Failed to generate AI insights. Please try again.");
    } finally {
      setLoadingAI(false);
    }
  }, [analyticsData, dateRange]);

  const growthData = analyticsData?.dailyData?.map((d: any) => d.views || 0) || [35, 42, 38, 56, 48, 72, 65, 80, 74, 92, 88, 95];
  const maxGrowth = Math.max(...growthData);

  const trendingTopics: Array<{ topic: string; heat: number }> = analyticsData?.trendingTopics || [
    { topic: "AI-Driven Content Strategy", heat: 94 },
    { topic: "Synthetic Media Ethics", heat: 87 },
    { topic: "Career Automation", heat: 76 },
    { topic: "Generative Design Thinking", heat: 68 },
    { topic: "Professional Branding with AI", heat: 61 },
  ];

  const audienceSegments = [
    { label: "Tech Professionals", pct: 38, color: "bg-primary" },
    { label: "Content Creators", pct: 28, color: "bg-secondary" },
    { label: "Career Changers", pct: 20, color: "bg-tertiary" },
    { label: "Students", pct: 14, color: "bg-error" },
  ];

  return (
    <div className="px-4 sm:px-8 gradient-mesh">
      <div className="max-w-7xl mx-auto">
            {/* Gradient Hero Header */}
            <div className="relative mb-10 overflow-hidden rounded-3xl glass-card">
              <div className="absolute inset-0 bg-linear-to-br from-violet-950 via-[#0f0a1e] to-blue-950" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.3),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.2),transparent_60%)]" />
              <div className="relative px-8 py-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300 mb-2">Performance Dashboard</p>
                  <h1 className="font-headline text-4xl sm:text-5xl font-extrabold tracking-tighter text-white">
                    Insights & <span className="bg-linear-to-r from-violet-400 via-purple-300 to-blue-400 bg-clip-text text-transparent italic">Intelligence</span>
                  </h1>
                  <p className="text-sm text-zinc-400 mt-2 max-w-lg">
                    Deep analytics powered by AI to optimize your content strategy and career growth.
                  </p>
                </div>
                <button
                  onClick={fetchAIInsights}
                  disabled={loadingAI || loadingAnalytics}
                  className="flex items-center gap-2 px-5 py-3 bg-linear-to-r from-violet-600 to-blue-600 text-white rounded-lg font-bold text-sm hover:scale-[1.02] transition-all shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  {loadingAnalytics ? "Loading data..." : loadingAI ? "Analyzing..." : "Generate AI Report"}
                </button>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Views", value: analyticsData?.summary?.totalViews ?? 0, icon: "visibility", gradient: "from-blue-600 to-cyan-500" },
                { label: "Total Likes", value: analyticsData?.summary?.totalLikes ?? 0, icon: "favorite", gradient: "from-pink-600 to-rose-500" },
                { label: "Comments", value: analyticsData?.summary?.totalComments ?? 0, icon: "chat_bubble", gradient: "from-violet-600 to-purple-500" },
                { label: "Followers", value: analyticsData?.summary?.totalNewFollowers ?? 0, icon: "group", gradient: "from-emerald-600 to-teal-500" },
              ].map((stat) => (
                <div key={stat.label} className="glass-panel rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                  <div className={`absolute top-0 right-0 h-20 w-20 rounded-full bg-linear-to-br ${stat.gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
                  <div className="relative">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">{stat.icon}</span>
                    <p className="text-3xl font-black font-headline mt-2">{stat.value.toLocaleString()}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Growth Pulse Chart */}
            <div className="glass-panel rounded-2xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-violet-500/5 to-transparent pointer-events-none" />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Growth Pulse</span>
                  <h2 className="text-2xl font-bold font-headline mt-1">Content Performance Trend</h2>
                </div>
                <div className="flex gap-2">
                  {(["7D", "30D", "90D", "1Y"] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setDateRange(period)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        dateRange === period
                          ? "bg-linear-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/20"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative flex items-end gap-2 h-40">
                {growthData.map((val: number, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                    <div
                      className="w-full rounded-t-md transition-all duration-300 group-hover/bar:shadow-lg group-hover/bar:shadow-violet-500/20"
                      style={{ 
                        height: `${(val / maxGrowth) * 100}%`,
                        background: `linear-gradient(to top, rgba(139,92,246,0.3), rgba(99,102,241,0.7) 40%, rgba(59,130,246,0.9) 70%, rgba(34,211,238,1))`
                      }}
                    ></div>
                    <span className="text-[9px] text-on-surface-variant">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Audience Mapping */}
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold font-headline mb-4 relative">Audience Mapping</h3>
                <div className="space-y-4 relative">
                  {audienceSegments.map((seg) => (
                    <div key={seg.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium">{seg.label}</span>
                        <span className="text-on-surface-variant">{seg.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-highest rounded-full">
                        <div className={`h-full ${seg.color} rounded-full`} style={{ width: `${seg.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Content Gap Analysis */}
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform">
                <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="text-lg font-bold font-headline relative">AI Gap Analysis</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { topic: "AI Ethics Deep Dives", opportunity: "High", icon: "priority_high" },
                    { topic: "Tutorial Content", opportunity: "Medium", icon: "school" },
                    { topic: "Case Study Series", opportunity: "High", icon: "cases" },
                  ].map((gap) => (
                    <div key={gap.topic} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
                      <span className="material-symbols-outlined text-primary text-sm">{gap.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold">{gap.topic}</p>
                        <p className="text-[10px] text-on-surface-variant">Opportunity: {gap.opportunity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <div className="glass-panel rounded-xl p-6 relative overflow-hidden group hover:scale-[1.01] transition-transform">
                <div className="absolute inset-0 bg-linear-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold font-headline mb-4 relative">Trending Topics</h3>
                <div className="space-y-3 relative">
                  {trendingTopics.map((t: { topic: string; heat: number }, i: number) => (
                    <div key={t.topic} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-on-surface-variant w-5">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{t.topic}</p>
                        <div className="w-full h-1 bg-surface-container-highest rounded-full mt-1">
                          <div className="h-full bg-linear-to-r from-violet-500 via-blue-500 to-cyan-400 rounded-full" style={{ width: `${t.heat}%` }}></div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-primary">{t.heat}°</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Generated Insights */}
            {insights && (
              <div className="relative rounded-2xl p-px mb-8 bg-linear-to-br from-violet-500/50 via-blue-500/30 to-pink-500/50">
                <div className="glass-panel rounded-2xl p-8 bg-[#0f0a1e]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-violet-600 to-blue-600">
                      <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <h3 className="text-xl font-bold font-headline bg-linear-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">AI Performance Report</h3>
                  </div>
                  <div className="prose prose-invert max-w-none text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {insights}
                  </div>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
