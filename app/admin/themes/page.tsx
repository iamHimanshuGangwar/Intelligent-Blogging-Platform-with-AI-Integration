"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { getThemeFromAny } from "@/lib/blog-themes";

const AdminSideNav = dynamic(() => import("@/components/AdminSideNav"), { ssr: false });
const AdminTopNav = dynamic(() => import("@/components/AdminTopNav"), { ssr: false });

export default function AdminThemesPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [themes, setThemes] = useState<any[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/admin/login");
      return;
    }
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    const loadThemes = async () => {
      try {
        const response = await fetch("/api/blog-themes?scope=all&includeBuiltin=false", { credentials: "include" });
        if (!response.ok) return;
        const data = await response.json();
        setThemes((data.themes || []).map((theme: any) => getThemeFromAny(theme)));
      } catch {
        // Ignore and keep current state.
      }
    };

    loadThemes();
  }, [isAdmin]);

  const updateTheme = async (id: string, payload: Record<string, unknown>) => {
    try {
      setBusyId(id);
      const response = await fetch(`/api/blog-themes/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update theme");

      setThemes((current) => current.map((item) => (item.id === id ? getThemeFromAny(data.theme) : item)));
      setFeedback("Theme updated.");
      setTimeout(() => setFeedback(""), 1500);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to update theme");
    } finally {
      setBusyId(null);
    }
  };

  const deleteTheme = async (id: string) => {
    const confirmed = window.confirm("Delete this theme permanently?");
    if (!confirmed) return;

    try {
      setBusyId(id);
      const response = await fetch(`/api/blog-themes/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete theme");

      setThemes((current) => current.filter((item) => item.id !== id));
      setFeedback("Theme deleted.");
      setTimeout(() => setFeedback(""), 1500);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to delete theme");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-on-background font-body">
      <AdminSideNav activePage="themes" />
      <AdminTopNav activePage="themes" />

      <main className="md:ml-64 pt-20 min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-white">Theme Library CRUD</h1>
            <p className="text-sm text-on-surface-variant mt-2">Manage user-created blog themes: visibility, feature flags, lifecycle, and deletion.</p>
          </header>

          {feedback && <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">{feedback}</div>}

          <div className="space-y-4">
            {themes.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-surface-container p-6 text-on-surface-variant">No custom themes found.</div>
            ) : (
              themes.map((theme) => (
                <article
                  key={theme.id}
                  className="rounded-xl border border-white/10 bg-surface-container p-4"
                  style={{ borderColor: theme.palette.border }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: theme.palette.heading }}>
                        {theme.previewImage} {theme.name}
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-1">{theme.description}</p>
                      <p className="text-[11px] text-on-surface-variant mt-1">ID: {theme.id}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => updateTheme(theme.id, { isPublic: !theme.isPublic })}
                        disabled={busyId === theme.id}
                        className="rounded-md border border-white/15 px-3 py-1.5 text-xs"
                      >
                        {theme.isPublic ? "Set Private" : "Set Public"}
                      </button>
                      <button
                        onClick={() => updateTheme(theme.id, { isFeatured: !theme.isFeatured })}
                        disabled={busyId === theme.id}
                        className="rounded-md border border-white/15 px-3 py-1.5 text-xs"
                      >
                        {theme.isFeatured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        onClick={() => updateTheme(theme.id, { status: theme.status === "archived" ? "active" : "archived" })}
                        disabled={busyId === theme.id}
                        className="rounded-md border border-white/15 px-3 py-1.5 text-xs"
                      >
                        {theme.status === "archived" ? "Activate" : "Archive"}
                      </button>
                      <button
                        onClick={() => deleteTheme(theme.id)}
                        disabled={busyId === theme.id}
                        className="rounded-md border border-red-500/30 text-red-400 px-3 py-1.5 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
