"use client";

import { useState, useEffect } from "react";
import { AiBadge } from "@/components/AiBadge";

interface AISuggestion {
  id: string;
  name: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

export default function AIInsightsPanel() {
  const [insight, setInsight] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const fetchAIInsights = async () => {
    try {
      const [insightRes, suggestionsRes] = await Promise.all([
        fetch("/api/admin/ai-insights"),
        fetch("/api/admin/ai-suggestions"),
      ]);

      if (insightRes.ok) {
        const insightData = await insightRes.json();
        setInsight(insightData);
      }

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json();
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      console.error("Failed to fetch AI insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeTrack = async (trackName: string) => {
    try {
      const response = await fetch("/api/admin/career-tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trackName,
          description: `AI-suggested track for ${trackName}`,
          icon: "auto_awesome",
        }),
      });

      if (response.ok) {
        fetchAIInsights();
      }
    } catch (error) {
      console.error("Failed to initialize track:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* AI Prediction Card */}
      <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary font-label">
            AI Demand Insight
          </span>
          <AiBadge variant="compact" />
        </div>

        {insight ? (
          <>
            <h5 className="text-xl font-bold font-headline mb-2 italic">{insight.trend}</h5>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Our AI detected a <span className="text-white font-bold">{insight.increase}% surge</span> in &quot;
              {insight.topic}&quot; searches. We suggest adding a specialized track for {insight.category} soon.
            </p>
            <button
              onClick={() => handleInitializeTrack(insight.suggestedTrack)}
              className="mt-auto flex items-center justify-center gap-2 bg-secondary/10 text-secondary py-3 rounded-lg border border-secondary/20 font-bold text-xs uppercase tracking-widest hover:bg-secondary/20 transition-all"
            >
              Initialize Track
            </button>
          </>
        ) : (
          <p className="text-sm text-zinc-500">Loading AI insights...</p>
        )}
      </div>

      {/* Platform Needs Card */}
      <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
            insights
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary font-label">
            Path Suggestions
          </span>
          <AiBadge variant="chip" label="AI-assisted" />
        </div>

        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-start justify-between gap-3 p-3 bg-black/40 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold">{suggestion.name}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    suggestion.priority === "High" ? "bg-red-500/20 text-red-400" :
                    suggestion.priority === "Medium" ? "bg-amber-500/20 text-amber-400" :
                    "bg-zinc-500/20 text-zinc-400"
                  }`}>{suggestion.priority}</span>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-2">{suggestion.description}</p>
              </div>
              <button
                onClick={() => handleInitializeTrack(suggestion.name)}
                className="text-zinc-600 hover:text-primary transition-colors shrink-0 mt-1"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
