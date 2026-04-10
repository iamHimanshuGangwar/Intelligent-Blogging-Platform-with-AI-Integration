"use client";

import { useState, useEffect, useCallback } from "react";

import { useAuth } from "@/context/AuthContext";
import SkillBadges from "@/components/SkillBadges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Milestone {
  level: number;
  title: string;
  desc: string;
  xp: string;
  status: "completed" | "current" | "locked";
}

interface Domain {
  name: string;
  progress: number;
  articles: number;
}

const defaultMilestones: Milestone[] = [
  { level: 1, title: "Curious Novice", desc: "Published first 3 articles", xp: "0-500", status: "locked" },
  { level: 2, title: "Rising Voice", desc: "10 articles with 500+ combined views", xp: "500-2K", status: "locked" },
  { level: 3, title: "Emerging Authority", desc: "25 publications, 5K+ engagement", xp: "2K-8K", status: "locked" },
  { level: 4, title: "Thought Leader", desc: "50 articles, 20K+ views", xp: "8K-20K", status: "locked" },
  { level: 5, title: "Industry Visionary", desc: "100+ articles, verified authority status", xp: "20K+", status: "locked" },
];

export default function CareerTrackPage() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  // AI Skill Assessment state
  interface SkillAssessment {
    career_stage: string;
    skills: { name: string; level: string; confidence: number }[];
    strengths: string[];
    growth_areas: string[];
    next_steps: string[];
  }
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState("");

  const fetchCareerData = useCallback(async () => {
    try {
      const [statsRes, postsRes] = await Promise.all([
        fetch("/api/user/stats"),
        fetch(`/api/posts?userId=${user?.id}`),
      ]);

      if (statsRes.ok) {
        const { stats } = await statsRes.json();
        const posts = stats.totalPosts || 0;
        const views = stats.totalViews || 0;
        setTotalPosts(posts);
        setTotalViews(views);

        // Compute milestone status based on real data
        const updated = defaultMilestones.map((m) => {
          if (m.level === 1 && posts >= 3) return { ...m, status: "completed" as const };
          if (m.level === 2 && posts >= 10 && views >= 500) return { ...m, status: "completed" as const };
          if (m.level === 3 && posts >= 25 && views >= 5000) return { ...m, status: "completed" as const };
          if (m.level === 4 && posts >= 50 && views >= 20000) return { ...m, status: "completed" as const };
          if (m.level === 5 && posts >= 100) return { ...m, status: "completed" as const };
          return m;
        });

        // Mark the first locked one as "current"
        const firstLocked = updated.findIndex((m) => m.status === "locked");
        if (firstLocked >= 0) updated[firstLocked] = { ...updated[firstLocked], status: "current" };

        setMilestones(updated);
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        const postData = data.posts || data || [];
        const topicMap: Record<string, { count: number; views: number }> = {};
        for (const post of postData) {
          const topic = post.topic || "General";
          if (!topicMap[topic]) topicMap[topic] = { count: 0, views: 0 };
          topicMap[topic].count++;
          topicMap[topic].views += post.views || 0;
        }
        const domainList: Domain[] = Object.entries(topicMap)
          .map(([name, data]) => ({
            name,
            articles: data.count,
            progress: Math.min(100, Math.round((data.count / 20) * 100)),
          }))
          .sort((a, b) => b.articles - a.articles)
          .slice(0, 5);
        setDomains(domainList);
      }
    } catch (err) {
      console.error("Failed to fetch career data:", err);
    }
  }, [user?.id]);

  // Fetch stored AI assessment on mount
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/career/analyze?userId=${encodeURIComponent(user.id)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (data.assessment?.assessment) {
          setAssessment(data.assessment.assessment);
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const runAIAssessment = async () => {
    if (!user?.id) return;
    setAssessmentLoading(true);
    setAssessmentError("");
    try {
      const response = await fetch("/api/career/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Assessment failed");
      }
      const data = await response.json();
      setAssessment(data.analysis);
    } catch (err: any) {
      setAssessmentError(err.message || "Failed to run assessment");
    } finally {
      setAssessmentLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerData();
  }, [fetchCareerData]);

  const currentMilestone = milestones.find((m) => m.status === "current") || milestones[0];
  const completedCount = milestones.filter((m) => m.status === "completed").length;

  return (
    <div className="px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="mb-10">
              <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface">
                Career <span className="text-gradient italic">Track</span>
              </h1>
              <p className="text-sm text-on-surface-variant mt-2">
                Your progression through the AiBlog creator ecosystem.
              </p>
            </header>

            {/* Progress Overview */}
            <div className="glass-panel rounded-2xl p-8 mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Current Level</span>
                  <h2 className="text-3xl font-extrabold font-headline mt-1">
                    Level {currentMilestone.level}: {currentMilestone.title}
                  </h2>
                  <p className="text-sm text-on-surface-variant mt-1">{currentMilestone.desc}</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold text-primary font-headline">{completedCount}/{milestones.length}</span>
                  <p className="text-xs text-on-surface-variant">Milestones Completed</p>
                </div>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full">
                <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${(completedCount / milestones.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Milestone Timeline */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-bold font-headline mb-4">Progression Milestones</h3>
                {milestones.map((m, i) => (
                  <div
                    key={m.level}
                    className={`flex items-start gap-4 p-5 rounded-xl border transition-all ${
                      m.status === "current"
                        ? "bg-primary/5 border-primary/30"
                        : m.status === "completed"
                        ? "bg-surface-container-low border-outline-variant/10"
                        : "bg-surface-container-low/50 border-outline-variant/5 opacity-60"
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        m.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : m.status === "current"
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}>
                        {m.status === "completed" ? (
                          <span className="material-symbols-outlined text-sm">check</span>
                        ) : (
                          m.level
                        )}
                      </div>
                      {i < milestones.length - 1 && (
                        <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                          m.status === "completed" ? "bg-green-500/30" : "bg-outline-variant/10"
                        }`}></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm">{m.title}</h4>
                        {m.status === "current" && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">In Progress</span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant">{m.desc}</p>
                      <span className="text-[10px] text-on-surface-variant mt-1 block">{m.xp} XP</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Domain Mastery */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-lg font-bold font-headline mb-4">Domain Mastery</h3>
                  <div className="space-y-4">
                    {domains.length === 0 ? (
                      <p className="text-xs text-on-surface-variant">Publish posts with topics to see your domain mastery grow.</p>
                    ) : (
                      domains.map((d) => (
                        <div key={d.name}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-medium">{d.name}</span>
                            <span className="text-on-surface-variant">{d.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-highest rounded-full">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${d.progress}%` }}></div>
                          </div>
                          <span className="text-[10px] text-on-surface-variant">{d.articles} articles</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="glass-panel rounded-xl p-6">
                  <h3 className="text-lg font-bold font-headline mb-4">Your Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-sm">article</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">{totalPosts} Articles Published</p>
                        <p className="text-[10px] text-on-surface-variant">Total content created</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary text-sm">visibility</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">{totalViews.toLocaleString()} Total Views</p>
                        <p className="text-[10px] text-on-surface-variant">Across all publications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Skill Assessment Section */}
            <div className="glass-panel rounded-2xl p-8 mb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    AI Skill Assessment
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1">AI analyzes your published posts to identify skills
                    and recommend growth areas.</p>
                </div>
                <Button
                  onClick={runAIAssessment}
                  disabled={assessmentLoading}
                  className="bg-linear-to-r from-primary to-secondary text-white font-bold"
                >
                  {assessmentLoading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      {assessment ? "Re-analyze" : "Run Assessment"}
                    </>
                  )}
                </Button>
              </div>

              {assessmentError && (
                <p className="text-sm text-red-400 mb-4">{assessmentError}</p>
              )}

              {assessment ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Career Stage */}
                  <Card className="bg-surface-container border-none">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {assessment.career_stage === "authority" ? "workspace_premium" :
                             assessment.career_stage === "established" ? "verified" :
                             assessment.career_stage === "emerging" ? "trending_up" : "school"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Career Stage</span>
                          <h4 className="text-xl font-extrabold font-headline capitalize">{assessment.career_stage}</h4>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills Breakdown */}
                  <Card className="bg-surface-container border-none">
                    <CardContent className="p-6">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm">analytics</span>
                        Identified Skills
                      </h4>
                      <div className="space-y-2.5">
                        {(assessment.skills || []).slice(0, 6).map((skill, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium">{skill.name}</span>
                              <Badge variant="outline" className={`text-[9px] h-4 ${
                                skill.level === "expert" ? "text-yellow-400 border-yellow-400/30" :
                                skill.level === "advanced" ? "text-green-400 border-green-400/30" :
                                skill.level === "intermediate" ? "text-blue-400 border-blue-400/30" :
                                "text-zinc-400 border-zinc-400/30"
                              }`}>
                                {skill.level}
                              </Badge>
                            </div>
                            <div className="w-full h-1 bg-surface-container-highest rounded-full">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${skill.confidence}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strengths */}
                  <Card className="bg-surface-container border-none">
                    <CardContent className="p-6">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-400 text-sm">thumb_up</span>
                        Strengths
                      </h4>
                      <ul className="space-y-2">
                        {(assessment.strengths || []).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-green-400 text-xs mt-0.5">check_circle</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Growth Areas + Next Steps */}
                  <Card className="bg-surface-container border-none">
                    <CardContent className="p-6">
                      <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400 text-sm">rocket_launch</span>
                        Growth Roadmap
                      </h4>
                      <div className="space-y-3">
                        {(assessment.growth_areas || []).map((area, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
                            <span className="material-symbols-outlined text-amber-400 text-xs mt-0.5">arrow_forward</span>
                            {area}
                          </div>
                        ))}
                        {(assessment.next_steps || []).length > 0 && (
                          <>
                            <div className="border-t border-white/5 pt-3 mt-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Next Steps</span>
                            </div>
                            {(assessment.next_steps || []).map((step, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
                                <span className="text-primary font-bold">{i + 1}.</span>
                                {step}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <span className="material-symbols-outlined text-4xl mb-3 block">psychology</span>
                  <p className="text-sm">Run your first AI assessment to get personalized skill analysis and career recommendations.</p>
                </div>
              )}
            </div>

            {/* Skill Badges Section */}
            {user?.id && (
              <div className="glass-panel rounded-2xl p-8">
                <SkillBadges userId={user.id} />
              </div>
            )}
      </div>
    </div>
  );
}
