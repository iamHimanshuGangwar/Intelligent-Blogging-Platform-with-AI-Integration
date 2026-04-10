"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PersonaReview {
  id?: string;
  persona: string;
  feedback: string;
  rating: number;
  strengths: string[];
  weaknesses: string[];
}

const PERSONA_META: Record<string, { icon: string; color: string; desc: string }> = {
  "The Student": { icon: "school", color: "text-blue-500", desc: "Curious learner seeking clarity" },
  "The CEO": { icon: "business_center", color: "text-amber-500", desc: "Time-starved executive wanting ROI" },
  "The Journalist": { icon: "newspaper", color: "text-emerald-500", desc: "Critical eye for facts & structure" },
  "The Skeptic": { icon: "psychology", color: "text-red-500", desc: "Tough crowd, hard to impress" },
  "The Superfan": { icon: "favorite", color: "text-pink-500", desc: "Enthusiastic supporter" },
};

export default function GhostReaderPanel({ postId }: { postId: string }) {
  const [reviews, setReviews] = useState<PersonaReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Load cached reviews on mount
  useEffect(() => {
    if (!postId) return;
    fetch(`/api/ghost-reader?postId=${postId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews?.length) {
          setReviews(data.reviews);
          setFetched(true);
        }
      })
      .catch(() => {});
  }, [postId]);

  const runGhostReader = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ghost-reader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to run Ghost Reader");
      }
      const data = await res.json();
      setReviews(data.reviews || []);
      setFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <section className="mt-12 pt-10 border-t border-outline-variant/10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">auto_stories</span>
            Ghost Reader AI
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            See how 5 different AI personas would react to your post
          </p>
        </div>
        <Button
          onClick={runGhostReader}
          disabled={loading}
          className="bg-gradient-to-r from-secondary to-primary text-white font-bold gap-2"
        >
          <span className="material-symbols-outlined text-sm">{loading ? "hourglass_top" : "auto_awesome"}</span>
          {loading ? "Analyzing..." : fetched ? "Re-analyze" : "Get AI Feedback"}
        </Button>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </p>
      )}

      {/* Summary */}
      {fetched && reviews.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10">
            <CardContent className="p-4 flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-on-surface">{avgRating}</span>
                <span className="text-on-surface-variant text-sm">/10</span>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Avg Rating</p>
              </div>
              <div className="flex-1 flex gap-2 flex-wrap">
                {reviews.map((r) => {
                  const meta = PERSONA_META[r.persona] || { icon: "person", color: "text-primary", desc: "" };
                  return (
                    <Badge key={r.persona} variant="outline" className="gap-1 cursor-pointer hover:bg-primary/5" onClick={() => setExpanded(expanded === r.persona ? null : r.persona)}>
                      <span className={`material-symbols-outlined text-xs ${meta.color}`}>{meta.icon}</span>
                      {r.persona.replace("The ", "")}
                      <span className="font-bold">{r.rating}/10</span>
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-black/5 dark:bg-white/4 animate-pulse" />
          ))}
        </div>
      )}

      {/* Persona Cards */}
      {!loading && fetched && (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {reviews.map((review, i) => {
              const meta = PERSONA_META[review.persona] || { icon: "person", color: "text-primary", desc: "" };
              const isOpen = expanded === review.persona;
              return (
                <motion.div
                  key={review.persona}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  layout
                  className={isOpen ? "sm:col-span-2" : ""}
                >
                  <Card
                    className="group cursor-pointer bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10 hover:border-primary/20 transition-all"
                    onClick={() => setExpanded(isOpen ? null : review.persona)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center`}>
                          <span className={`material-symbols-outlined text-xl ${meta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-on-surface">{review.persona}</h3>
                            <Badge variant="outline" className="text-[10px]">{review.rating}/10</Badge>
                          </div>
                          <p className="text-[11px] text-on-surface-variant">{meta.desc}</p>
                        </div>
                        <span className={`material-symbols-outlined text-sm text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""}`}>expand_more</span>
                      </div>

                      <p className={`text-sm text-on-surface-variant leading-relaxed ${isOpen ? "" : "line-clamp-3"}`}>
                        {review.feedback}
                      </p>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                              <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 mb-2 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">thumb_up</span>Strengths
                                </h4>
                                <ul className="space-y-1">
                                  {review.strengths?.map((s, j) => (
                                    <li key={j} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                                      <span className="text-emerald-500 mt-0.5 shrink-0">+</span>{s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-2 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">thumb_down</span>Weaknesses
                                </h4>
                                <ul className="space-y-1">
                                  {review.weaknesses?.map((w, j) => (
                                    <li key={j} className="text-xs text-on-surface-variant flex items-start gap-1.5">
                                      <span className="text-red-500 mt-0.5 shrink-0">-</span>{w}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetched && (
        <Card className="bg-white/60 dark:bg-white/4 border border-black/5 dark:border-white/10 text-center p-12">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-3">auto_stories</span>
          <h3 className="text-lg font-bold text-on-surface mb-1">Summon the Ghost Readers</h3>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Five AI personas will read your post and give unique feedback — from a curious student to a tough skeptic.
          </p>
        </Card>
      )}
    </section>
  );
}
