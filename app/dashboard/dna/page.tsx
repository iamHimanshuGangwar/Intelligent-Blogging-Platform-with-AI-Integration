"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

interface DNAProfile {
  vocabulary_richness: number;
  tone_consistency: number;
  topic_diversity: number;
  emotional_range: number;
  readability: number;
  storytelling: number;
  analytical_depth: number;
  engagement_power: number;
  writing_style: string;
  famous_writer_match: string;
  match_explanation: string;
  ai_summary: string;
  posts_analyzed: number;
  generated_at: string;
}

const AXES = [
  { key: "vocabulary_richness", label: "Vocabulary", icon: "dictionary", color: "#6366f1" },
  { key: "tone_consistency", label: "Tone", icon: "record_voice_over", color: "#8b5cf6" },
  { key: "topic_diversity", label: "Diversity", icon: "category", color: "#a855f7" },
  { key: "emotional_range", label: "Emotion", icon: "mood", color: "#d946ef" },
  { key: "readability", label: "Readability", icon: "menu_book", color: "#ec4899" },
  { key: "storytelling", label: "Story", icon: "auto_stories", color: "#f43f5e" },
  { key: "analytical_depth", label: "Analysis", icon: "analytics", color: "#3b82f6" },
  { key: "engagement_power", label: "Engagement", icon: "trending_up", color: "#10b981" },
];

function RadarChart({ data, size = 320 }: { data: DNAProfile; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;
    const n = AXES.length;

    ctx.clearRect(0, 0, size, size);

    // Draw grid rings
    for (let ring = 1; ring <= 5; ring++) {
      const r = (radius * ring) / 5;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(99, 102, 241, ${ring === 5 ? 0.3 : 0.1})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw data polygon
    const values = AXES.map((a) => ((data as any)[a.key] || 0) / 100);

    // Fill
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
      const r = radius * values[idx];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.3)");
    gradient.addColorStop(1, "rgba(139, 92, 246, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = (Math.PI * 2 * idx) / n - Math.PI / 2;
      const r = radius * values[idx];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "rgba(99, 102, 241, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = radius * values[i];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = AXES[i].color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw labels
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const labelR = radius + 24;
      const x = cx + labelR * Math.cos(angle);
      const y = cy + labelR * Math.sin(angle);
      ctx.fillStyle = "rgba(156, 163, 175, 0.9)";
      ctx.fillText(AXES[i].label, x, y);
    }
  }, [data, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="mx-auto" />;
}

export default function WriterDNAPage() {
  const { isAuthenticated } = useAuth();
  const [dna, setDna] = useState<DNAProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetch("/api/writer-dna")
      .then((r) => r.json())
      .then((d) => setDna(d.dna || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const generate = async () => {
    setGenerating(true);
    setError("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      const res = await fetch("/api/writer-dna", {
        method: "POST",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDna(data.dna);
    } catch (e: any) {
      if (e.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(e.message);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="text-on-background">
      {/* Hero */}
      <section className="relative pb-16 px-4 sm:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-150 h-150 gradient-blob-blue rounded-full" />
          <div className="absolute top-24 left-[16%] w-72 h-72 rounded-full gradient-blob-emerald" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
            Writer DNA
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold font-headline tracking-tighter mb-4 text-on-surface">
            Your Writing <span className="text-gradient">DNA Profile</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto mb-8">
            AI analyzes your posts to reveal your unique writing fingerprint — vocabulary richness, tone, storytelling power, and more.
          </p>
        </motion.div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        {!isAuthenticated ? (
          <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10 text-center p-16">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 block mb-4">lock</span>
            <h3 className="text-xl font-bold text-on-surface mb-2">Sign in to view your DNA</h3>
            <p className="text-on-surface-variant mb-6">You need to be logged in with published posts.</p>
            <Button className="bg-primary text-white" onClick={() => window.location.href = "/auth"}>Sign In</Button>
          </Card>
        ) : loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 rounded-2xl bg-black/5 dark:bg-white/4 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-black/5 dark:bg-white/4 animate-pulse" />
              ))}
            </div>
          </div>
        ) : !dna ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10 p-16 max-w-xl mx-auto">
              <span className="material-symbols-outlined text-6xl text-primary/40 block mb-4">fingerprint</span>
              <h3 className="text-2xl font-bold text-on-surface mb-3">Discover Your Writing DNA</h3>
              <p className="text-on-surface-variant mb-8">
                Our AI will analyze your published posts and generate a unique writing fingerprint showing your strengths, style, and famous-writer match.
              </p>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <Button
                className="bg-primary text-white font-bold px-8 py-3 h-auto rounded-xl shadow-lg"
                onClick={generate}
                disabled={generating}
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing your posts…
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm mr-2">auto_awesome</span>
                    Generate My DNA
                  </>
                )}
              </Button>
              {generating && (
                <p className="text-xs text-on-surface-variant mt-3">This may take up to a minute while AI reads your posts.</p>
              )}
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Radar Chart */}
              <div className="lg:col-span-3">
                <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10 overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-on-surface">DNA Radar</h2>
                        <p className="text-xs text-on-surface-variant">{dna.posts_analyzed} posts analyzed</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={generate} disabled={generating} className="text-xs">
                        <span className="material-symbols-outlined text-xs mr-1">refresh</span>
                        Regenerate
                      </Button>
                    </div>
                    <RadarChart data={dna} size={360} />
                  </CardContent>
                </Card>
              </div>

              {/* Writing Style Card */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="glass-card-blue border-primary/20 overflow-hidden">
                  <CardContent className="p-6">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs mb-3">Your Style</Badge>
                    <h3 className="text-3xl font-extrabold text-on-surface mb-2">{dna.writing_style}</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{dna.ai_summary}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="material-symbols-outlined text-2xl text-amber-500">auto_awesome</span>
                      <div>
                        <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Famous Writer Match</p>
                        <h4 className="text-xl font-bold text-on-surface">{dna.famous_writer_match}</h4>
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{dna.match_explanation}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10">
                  <CardContent className="p-6">
                    <h4 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wider">Score Breakdown</h4>
                    <div className="space-y-3">
                      {AXES.map((axis) => {
                        const val = (dna as any)[axis.key] || 0;
                        return (
                          <div key={axis.key} className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-sm" style={{ color: axis.color }}>{axis.icon}</span>
                            <span className="text-xs text-on-surface-variant w-20 shrink-0">{axis.label}</span>
                            <div className="flex-1 h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${val}%` }}
                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ background: axis.color }}
                              />
                            </div>
                            <span className="text-xs font-bold text-on-surface w-8 text-right">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
