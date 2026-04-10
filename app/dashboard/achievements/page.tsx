"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/NavBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  threshold: number;
  tier: string;
  earned: boolean;
  earned_at: string | null;
}

interface XPTransaction {
  id: string;
  amount: number;
  reason: string;
  entity_type: string;
  created_at: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url?: string;
  xp: number;
  level: number;
  streak_days: number;
}

const TIER_STYLES: Record<string, { bg: string; border: string; text: string; ring: string }> = {
  bronze: { bg: "bg-amber-900/10", border: "border-amber-700/30", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/30" },
  silver: { bg: "bg-zinc-400/10", border: "border-zinc-400/30", text: "text-zinc-500 dark:text-zinc-300", ring: "ring-zinc-400/30" },
  gold: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-600 dark:text-yellow-400", ring: "ring-yellow-500/30" },
  platinum: { bg: "bg-cyan-400/10", border: "border-cyan-400/30", text: "text-cyan-600 dark:text-cyan-300", ring: "ring-cyan-400/30" },
  diamond: { bg: "bg-violet-400/10", border: "border-violet-400/30", text: "text-violet-600 dark:text-violet-300", ring: "ring-violet-400/30" },
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  writing: { label: "Writing", icon: "edit_note" },
  engagement: { label: "Engagement", icon: "favorite" },
  social: { label: "Social", icon: "groups" },
  streak: { label: "Streaks", icon: "local_fire_department" },
  special: { label: "Special", icon: "auto_awesome" },
  general: { label: "General", icon: "emoji_events" },
};

const REASON_LABELS: Record<string, string> = {
  publish_post: "Published a post",
  receive_like: "Received a like",
  leave_comment: "Left a comment",
  forum_reply: "Forum reply",
  receive_follower: "New follower",
  daily_login: "Daily login",
  generate_dna: "Generated Writer DNA",
  ghost_reader: "Used Ghost Reader",
};

export default function AchievementsPage() {
  const { isAuthenticated } = useAuth();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState({ current: 0, next: 50, progress: 0 });
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentXP, setRecentXP] = useState<XPTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"achievements" | "leaderboard" | "activity">("achievements");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, earned: 0 });

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([
      fetch("/api/xp").then((r) => r.json()),
      fetch("/api/xp?leaderboard=true").then((r) => r.json()),
    ])
      .then(([xpData, lbData]) => {
        setXp(xpData.xp || 0);
        setLevel(xpData.level || 1);
        setLevelProgress(xpData.levelProgress || { current: 0, next: 50, progress: 0 });
        setStreak(xpData.streak_days || 0);
        setAchievements(xpData.achievements || []);
        setRecentXP(xpData.recentXP || []);
        setStats(xpData.stats || { total: 0, earned: 0 });
        setLeaderboard(lbData.leaderboard || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const filteredAch = categoryFilter === "all"
    ? achievements
    : categoryFilter === "earned"
    ? achievements.filter((a) => a.earned)
    : achievements.filter((a) => a.category === categoryFilter);

  const categories = ["all", "earned", ...Object.keys(CATEGORY_LABELS)];

  return (
    <div className="min-h-screen text-on-background bg-background hero-gradient">
      <NavBar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 px-4 sm:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-150 h-150 gradient-blob-blue rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
            Achievements & XP
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold font-headline tracking-tighter mb-4 text-on-surface">
            Level Up Your <span className="text-gradient">Journey</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Earn XP, unlock achievements, climb the leaderboard, and showcase your progress.
          </p>
        </motion.div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        {!isAuthenticated ? (
          <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10 text-center p-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 block mb-4">lock</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Sign in to track progress</h3>
            <Button className="bg-primary text-white mt-4" onClick={() => window.location.href = "/auth"}>Sign In</Button>
          </Card>
        ) : loading ? (
          <div className="space-y-6">
            <div className="h-32 rounded-2xl bg-black/5 dark:bg-white/4 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-black/5 dark:bg-white/4 animate-pulse" />)}
            </div>
          </div>
        ) : (
          <>
            {/* XP Overview Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10 mb-8 overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Level Circle */}
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-black/5 dark:text-white/10" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#xp-gradient)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${levelProgress.progress * 2.64} 264`} />
                        <defs>
                          <linearGradient id="xp-gradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-extrabold text-on-surface">{level}</span>
                        <span className="text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Level</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-on-surface mb-1">{xp.toLocaleString()} XP</h2>
                      <p className="text-sm text-on-surface-variant mb-3">
                        {levelProgress.next - xp > 0 ? `${(levelProgress.next - xp).toLocaleString()} XP to next level` : "Max level reached!"}
                      </p>
                      <div className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden max-w-sm">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelProgress.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <span className="material-symbols-outlined text-orange-500 text-lg">local_fire_department</span>
                          <span className="text-2xl font-extrabold text-on-surface">{streak}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Streak</span>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-extrabold text-on-surface">{stats.earned}</span>
                        <span className="text-on-surface-variant text-xs">/{stats.total}</span>
                        <br />
                        <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Badges</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {(["achievements", "leaderboard", "activity"] as const).map((t) => (
                <Button
                  key={t}
                  variant={tab === t ? "default" : "outline"}
                  size="sm"
                  className={tab === t ? "bg-primary text-white" : ""}
                  onClick={() => setTab(t)}
                >
                  <span className="material-symbols-outlined text-sm mr-1">
                    {t === "achievements" ? "emoji_events" : t === "leaderboard" ? "leaderboard" : "history"}
                  </span>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>

            {/* Achievements Tab */}
            {tab === "achievements" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Category Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat}
                      variant={categoryFilter === cat ? "default" : "outline"}
                      className={`cursor-pointer shrink-0 ${categoryFilter === cat ? "bg-primary text-white" : "hover:bg-primary/10"}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat === "all" ? "All" : cat === "earned" ? `Earned (${stats.earned})` : CATEGORY_LABELS[cat]?.label || cat}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAch.map((ach, i) => {
                    const style = TIER_STYLES[ach.tier] || TIER_STYLES.bronze;
                    return (
                      <motion.div
                        key={ach.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Card className={`group relative overflow-hidden ${style.bg} border ${style.border} ${ach.earned ? '' : 'opacity-50 grayscale'} hover:opacity-100 hover:grayscale-0 transition-all duration-300`}>
                          {ach.earned && (
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary`} />
                          )}
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.bg} ${ach.earned ? `ring-2 ${style.ring}` : ''}`}>
                                <span className={`material-symbols-outlined text-2xl ${style.text}`} style={{ fontVariationSettings: ach.earned ? "'FILL' 1" : "'FILL' 0" }}>
                                  {ach.icon}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-sm text-on-surface truncate">{ach.name}</h3>
                                  <Badge className={`text-[8px] shrink-0 ${style.bg} ${style.text} border-0`}>
                                    {ach.tier}
                                  </Badge>
                                </div>
                                <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{ach.description}</p>
                                <div className="flex items-center gap-2 text-[10px]">
                                  <span className="text-primary font-bold">+{ach.xp_reward} XP</span>
                                  {ach.earned && ach.earned_at && (
                                    <span className="text-on-surface-variant ml-auto">
                                      {new Date(ach.earned_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Leaderboard Tab */}
            {tab === "leaderboard" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10">
                  <CardContent className="p-0">
                    {leaderboard.length === 0 ? (
                      <div className="p-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl block mb-2">leaderboard</span>
                        No leaderboard data yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-black/5 dark:divide-white/5">
                        {leaderboard.map((entry) => (
                          <div key={entry.user_id} className="flex items-center gap-4 px-6 py-4 hover:bg-primary/5 transition-colors">
                            <span className={`w-8 text-center font-extrabold text-lg ${entry.rank <= 3 ? "text-primary" : "text-on-surface-variant"}`}>
                              {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                            </span>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold overflow-hidden shrink-0">
                              {entry.avatar_url ? (
                                <Image src={entry.avatar_url} alt={entry.name} width={40} height={40} className="w-full h-full object-cover" />
                              ) : (
                                entry.name?.charAt(0)?.toUpperCase() || "?"
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-sm text-on-surface truncate block">{entry.name}</span>
                              <span className="text-[10px] text-on-surface-variant">Level {entry.level}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-sm text-on-surface">{entry.xp.toLocaleString()}</span>
                              <span className="text-xs text-on-surface-variant ml-1">XP</span>
                            </div>
                            {entry.streak_days > 0 && (
                              <div className="flex items-center gap-0.5 text-orange-500">
                                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                                <span className="text-xs font-bold">{entry.streak_days}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Activity Tab */}
            {tab === "activity" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10">
                  <CardContent className="p-0">
                    {recentXP.length === 0 ? (
                      <div className="p-12 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl block mb-2">history</span>
                        No XP activity yet. Start writing!
                      </div>
                    ) : (
                      <div className="divide-y divide-black/5 dark:divide-white/5">
                        {recentXP.map((tx) => (
                          <div key={tx.id} className="flex items-center gap-4 px-6 py-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-bold text-sm">+{tx.amount}</span>
                            </div>
                            <div className="flex-1">
                              <span className="text-sm text-on-surface font-medium">
                                {tx.reason.startsWith("achievement:") ? `Achievement unlocked: ${tx.reason.split(":")[1]}` : REASON_LABELS[tx.reason] || tx.reason}
                              </span>
                            </div>
                            <span className="text-xs text-on-surface-variant shrink-0">
                              {new Date(tx.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
