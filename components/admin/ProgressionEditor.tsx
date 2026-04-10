"use client";

import { useState, useEffect, useCallback } from "react";

interface ProgressionLevel {
  id: string;
  level: number;
  name: string;
  tier: string;
  badge: string;
  perk: string;
  aiThreshold: string;
  isLocked: boolean;
}

export default function ProgressionEditor({ track }: { track: any }) {
  const [levels, setLevels] = useState<ProgressionLevel[]>([]);
  const [, setLoading] = useState(true);

  const fetchProgressionLevels = useCallback(async () => {
    if (!track?.id) return;
    try {
      const response = await fetch(`/api/admin/career-tracks/${track.id}/levels`);
      const data = await response.json();
      setLevels(data);
    } catch (error) {
      console.error("Failed to fetch progression levels:", error);
    } finally {
      setLoading(false);
    }
  }, [track?.id]);

  useEffect(() => {
    fetchProgressionLevels();
  }, [fetchProgressionLevels]);

  return (
    <div className="glass-effect p-8 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h4 className="text-2xl font-bold font-headline mb-1">Progression Levels</h4>
          <p className="text-zinc-500 text-sm">Path: {track?.name}</p>
        </div>
        <button className="text-primary hover:underline font-label text-xs uppercase tracking-widest">
          Reorder Levels
        </button>
      </div>

      <div className="relative flex flex-col gap-12">
        {/* Connecting Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-outline-variant opacity-20"></div>

        {/* Progression Levels */}
        {levels.map((level, index) => (
          <div key={level.id} className="relative flex gap-8 group">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-on-primary-fixed font-bold z-10 active-glow ${
                level.isLocked
                  ? "bg-surface-container-high border-2 border-primary/40"
                  : index === 0
                    ? "bg-primary"
                    : "bg-surface-container-high border-2 border-primary"
              }`}
            >
              {level.level}
            </div>

            <div className="flex-1 bg-surface-container-highest/40 p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all">
              <div className="flex justify-between items-center mb-4">
                <h5 className={`text-lg font-bold font-headline ${level.isLocked ? "text-zinc-400" : ""}`}>
                  {level.name}
                </h5>
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">{level.tier}</span>
              </div>

              {level.isLocked ? (
                <p className="text-xs text-zinc-600">
                  Configuration locked. Complete Level {level.level - 1} definition first.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-400 font-label uppercase">Badge & Perk</p>
                    <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg border border-white/5">
                      <span className="material-symbols-outlined text-primary text-sm">verified</span>
                      <span className="text-xs">{level.badge}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-400 font-label uppercase">AI Promo Threshold</p>
                    <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg border border-white/5">
                      <span className="material-symbols-outlined text-secondary text-sm">auto_graph</span>
                      <span className="text-xs">{level.aiThreshold}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {levels.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-sm">No progression levels configured yet.</p>
            <button className="text-primary hover:underline text-xs mt-2">Add First Level</button>
          </div>
        )}
      </div>
    </div>
  );
}
