"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SkillBadge {
  badge_id: string;
  name: string;
  icon: string;
  category: string;
  tier: string;
  description: string;
  earned: boolean;
  earned_at: string | null;
}

interface BadgeStats {
  total: number;
  earned: number;
}

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  bronze: { bg: "bg-amber-900/20", border: "border-amber-700/40", text: "text-amber-400", glow: "shadow-amber-500/10" },
  silver: { bg: "bg-zinc-400/10", border: "border-zinc-400/30", text: "text-zinc-300", glow: "shadow-zinc-400/10" },
  gold: { bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-400", glow: "shadow-yellow-500/20" },
  platinum: { bg: "bg-cyan-400/15", border: "border-cyan-400/40", text: "text-cyan-300", glow: "shadow-cyan-400/20" },
};

const CATEGORY_LABELS: Record<string, string> = {
  writing: "Writing",
  engagement: "Engagement",
  expertise: "Expertise",
  special: "Special",
};

export default function SkillBadges({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<SkillBadge[]>([]);
  const [stats, setStats] = useState<BadgeStats>({ total: 0, earned: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/career/badges?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setBadges(data.all || []);
        setStats(data.stats || { total: 0, earned: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const filteredBadges = filter === "all"
    ? badges
    : filter === "earned"
    ? badges.filter((b) => b.earned)
    : badges.filter((b) => b.category === filter);

  const categories = ["all", "earned", ...Object.keys(CATEGORY_LABELS)];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-white/5 rounded-lg animate-pulse w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            military_tech
          </span>
          <div>
            <h3 className="text-lg font-bold font-headline">Skill Badges</h3>
            <p className="text-xs text-on-surface-variant">
              {stats.earned} of {stats.total} earned
            </p>
          </div>
        </div>
        <div className="w-24 h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
            style={{ width: `${stats.total > 0 ? (stats.earned / stats.total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              filter === cat
                ? "bg-primary/20 text-primary"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            }`}
          >
            {cat === "all" ? "All" : cat === "earned" ? "Earned" : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredBadges.map((badge) => {
          const tier = TIER_COLORS[badge.tier] || TIER_COLORS.bronze;
          return (
            <Card
              key={badge.badge_id}
              className={`border transition-all ${
                badge.earned
                  ? `${tier.bg} ${tier.border} ${tier.glow} shadow-lg`
                  : "bg-white/2 border-white/5 opacity-40 grayscale"
              }`}
            >
              <CardContent className="p-4 text-center">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                  badge.earned ? `${tier.bg} ${tier.border} border` : "bg-white/5"
                }`}>
                  <span className={`material-symbols-outlined ${badge.earned ? tier.text : "text-zinc-600"}`} style={badge.earned ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {badge.icon}
                  </span>
                </div>
                <h4 className={`text-xs font-bold mb-0.5 ${badge.earned ? "text-on-surface" : "text-zinc-600"}`}>
                  {badge.name}
                </h4>
                <p className="text-[10px] text-on-surface-variant leading-tight">{badge.description}</p>
                {badge.earned && badge.earned_at && (
                  <Badge variant="outline" className={`mt-2 text-[8px] ${tier.text} ${tier.border}`}>
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </Badge>
                )}
                {!badge.earned && (
                  <Badge variant="outline" className="mt-2 text-[8px] text-zinc-600 border-zinc-700">
                    Locked
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <p className="text-sm text-zinc-500 text-center py-8">
          {filter === "earned" ? "No badges earned yet. Keep writing!" : "No badges in this category."}
        </p>
      )}
    </div>
  );
}
