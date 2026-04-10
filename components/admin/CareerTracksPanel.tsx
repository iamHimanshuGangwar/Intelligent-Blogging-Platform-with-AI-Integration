"use client";

import { useState } from "react";

interface CareerTrack {
  id: string;
  name: string;
  description: string;
  icon: string;
  creatorCount: number;
  growthRate: number;
  isActive: boolean;
}

interface CareerTracksPanelProps {
  tracks: CareerTrack[];
  selectedTrack: CareerTrack | null;
  onSelectTrack: (track: CareerTrack) => void;
  onTracksUpdate: () => void;
}

export default function CareerTracksPanel({
  tracks,
  selectedTrack,
  onSelectTrack,
  onTracksUpdate,
}: CareerTracksPanelProps) {
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleDeleteTrack = async (trackId: string) => {
    try {
      await fetch(`/api/admin/career-tracks/${trackId}`, {
        method: "DELETE",
      });
      onTracksUpdate();
    } catch (error) {
      console.error("Failed to delete track:", error);
    }
  };

  return (
    <div className="col-span-12 lg:col-span-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-label">
          Active Tracks
        </span>
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {tracks.length} TOTAL
        </span>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {tracks.map((track) => (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track)}
            className={`p-6 rounded-xl border-l-4 transition-all group cursor-pointer ${
              selectedTrack?.id === track.id
                ? "bg-surface-container-high border-primary"
                : "bg-surface-container-low hover:bg-surface-container-high border-transparent"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">{track.icon || "work"}</span>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === track.id ? null : track.id);
                  }}
                  className="text-zinc-600 hover:text-primary"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {menuOpen === track.id && (
                  <div className="absolute right-0 top-8 bg-surface-container-highest border border-white/10 rounded-lg overflow-hidden z-10">
                    <button className="block w-full text-left px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5">
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteTrack(track.id);
                        setMenuOpen(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold font-headline mb-1">{track.name}</h3>
            <p className="text-sm text-on-surface-variant mb-4">{track.description}</p>

            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">group</span>
                {track.creatorCount.toLocaleString()} CREATORS
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                +{track.growthRate}% GROWTH
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
