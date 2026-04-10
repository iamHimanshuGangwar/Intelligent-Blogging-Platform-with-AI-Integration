"use client";

import { useState, useEffect } from "react";

interface PathStats {
  avgLevelUpTime: string;
  platformRetention: string;
}

export default function CareerPathVisualizer() {
  const [stats, setStats] = useState<PathStats | null>(null);

  useEffect(() => {
    fetchPathStats();
  }, []);

  const fetchPathStats = async () => {
    try {
      const response = await fetch("/api/admin/path-stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch path stats:", error);
    }
  };

  return (
    <div className="mt-16 w-full h-[300px] relative rounded-3xl overflow-hidden bg-surface-container-low border border-white/5">
      <div className="absolute inset-0 opacity-40 mix-blend-screen">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10"></div>

        {/* Grid Lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto ring-8 ring-primary/5">
            <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          </div>
          <div>
            <h4 className="text-xl font-bold font-headline">Path Interconnectivity Graph</h4>
            <p className="text-sm text-zinc-500">Visualizing creator migration between career tracks</p>
          </div>
        </div>
      </div>

      {/* Floating Data Points */}
      {stats && (
        <>
          <div className="absolute top-10 left-10 p-3 bg-surface-container-high rounded-lg border border-white/5 flex items-center gap-3">
            <div className="w-1 h-8 bg-primary rounded-full"></div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-label">Avg. Level Up Time</p>
              <p className="text-lg font-bold">{stats.avgLevelUpTime}</p>
            </div>
          </div>

          <div className="absolute bottom-10 right-10 p-3 bg-surface-container-high rounded-lg border border-white/5 flex items-center gap-3">
            <div className="w-1 h-8 bg-secondary rounded-full"></div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-label">Platform Retention</p>
              <p className="text-lg font-bold">{stats.platformRetention}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
