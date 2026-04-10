"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });
const CareerTracksPanel = dynamic(() => import("@/components/admin/CareerTracksPanel"), { ssr: false });
const ProgressionEditor = dynamic(() => import("@/components/admin/ProgressionEditor"), { ssr: false });
const AIInsightsPanel = dynamic(() => import("@/components/admin/AIInsightsPanel"), { ssr: false });
const CareerPathVisualizer = dynamic(() => import("@/components/admin/CareerPathVisualizer"), { ssr: false });

function mapTrack(t: any) {
  return {
    ...t,
    creatorCount: t.creator_count ?? t.creatorCount ?? 0,
    growthRate: t.growth_rate ?? t.growthRate ?? 0,
    isActive: t.is_active ?? t.isActive ?? true,
  };
}

export default function CareerPathsPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [showNewTrack, setShowNewTrack] = useState(false);
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackDesc, setNewTrackDesc] = useState("");
  const [newTrackIcon, setNewTrackIcon] = useState("work");
  const [saving, setSaving] = useState(false);

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

  const fetchCareerTracks = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/career-tracks");
      if (!response.ok) return;
      const data = await response.json();
      const mapped = Array.isArray(data) ? data.map(mapTrack) : [];
      setTracks(mapped);
      if (mapped.length > 0 && !selectedTrack) setSelectedTrack(mapped[0]);
    } catch (error) {
      console.error("Failed to fetch career tracks:", error);
    }
  }, [selectedTrack]);

  useEffect(() => {
    fetchCareerTracks();
  }, [fetchCareerTracks]);

  const handleCreateTrack = async () => {
    if (!newTrackName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/career-tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTrackName, description: newTrackDesc, icon: newTrackIcon }),
      });
      if (res.ok) {
        setShowNewTrack(false);
        setNewTrackName("");
        setNewTrackDesc("");
        setNewTrackIcon("work");
        await fetchCareerTracks();
      }
    } catch (error) {
      console.error("Failed to create track:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleExportSchema = () => {
    const schema = {
      exportedAt: new Date().toISOString(),
      tracks: tracks.map(({ id, name, description, icon, creatorCount, growthRate, isActive }) => ({
        id, name, description, icon, creatorCount, growthRate, isActive,
      })),
    };
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-schema-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveConfig = async () => {
    if (!selectedTrack) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/career-tracks/${selectedTrack.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedTrack.name,
          description: selectedTrack.description,
          icon: selectedTrack.icon,
          is_active: selectedTrack.isActive,
        }),
      });
      await fetchCareerTracks();
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background gradient-mesh text-on-background font-body">
      <AdminSideNav activePage="career-paths" />
      <AdminTopNav activePage="career-paths" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h2 className="text-5xl font-extrabold font-headline tracking-tighter text-white mb-2">
              Career <span className="text-primary italic">Architecture</span>
            </h2>
            <p className="text-on-surface-variant text-sm">
              Define milestones, perks, and AI-driven growth metrics for creator progression.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportSchema}
              className="px-5 py-2.5 bg-surface-container-high border border-outline-variant/20 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all"
            >
              <span className="material-symbols-outlined text-sm mr-1 align-middle">download</span>
              Export Schema
            </button>
            <button
              onClick={() => setShowNewTrack(true)}
              className="px-5 py-2.5 bg-linear-to-r from-primary to-primary-container text-on-primary-fixed rounded-lg text-xs font-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined text-sm mr-1 align-middle">add</span>
              New Track
            </button>
          </div>
        </div>

        {/* New Track Modal */}
        {showNewTrack && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-8 max-w-md w-full space-y-4">
              <h3 className="text-xl font-bold font-headline">Create New Track</h3>
              <div>
                <label className="text-xs text-zinc-400 font-label uppercase block mb-1">Track Name</label>
                <input
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  placeholder="e.g. Technical Writer"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-label uppercase block mb-1">Description</label>
                <textarea
                  value={newTrackDesc}
                  onChange={(e) => setNewTrackDesc(e.target.value)}
                  placeholder="Describe this career track..."
                  rows={3}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-zinc-600 focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-label uppercase block mb-1">Icon (Material Symbol)</label>
                <input
                  value={newTrackIcon}
                  onChange={(e) => setNewTrackIcon(e.target.value)}
                  placeholder="e.g. code, auto_stories, analytics"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-zinc-600 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowNewTrack(false)}
                  className="px-5 py-2 text-on-surface-variant text-xs font-bold hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTrack}
                  disabled={saving || !newTrackName.trim()}
                  className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Track"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Career Tracks Sidebar */}
          <CareerTracksPanel
            tracks={tracks}
            selectedTrack={selectedTrack}
            onSelectTrack={setSelectedTrack}
            onTracksUpdate={fetchCareerTracks}
          />

          {/* Progression Editor Area */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {selectedTrack && <ProgressionEditor track={selectedTrack} />}

            {/* AI Insights & Recommendations */}
            <AIInsightsPanel />

            {/* Config Action Bar */}
            <div className="glass-panel rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <p className="text-xs text-on-surface-variant">
                  Unsaved changes detected in
                  <span className="text-white font-bold ml-1">{selectedTrack?.name || "Career Track"}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchCareerTracks}
                  className="px-5 py-2 text-on-surface-variant text-xs font-bold hover:text-on-surface transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Career Path Visualizer */}
        <CareerPathVisualizer />
      </main>
    </div>
  );
}
