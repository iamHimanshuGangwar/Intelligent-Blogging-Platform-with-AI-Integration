"use client";

import { cn } from "@/lib/utils";

interface AiBadgeProps {
  label?: string;
  variant?: "default" | "compact" | "chip";
  className?: string;
}

/**
 * AiBadge — indicates that a metric or section is AI-derived or AI-assisted.
 * variant="default"  → "AI Insights" badge with glow
 * variant="compact"  → tiny "AI" pill
 * variant="chip"     → "AI-assisted" full chip
 */
export function AiBadge({ label, variant = "default", className }: AiBadgeProps) {
  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider",
          "bg-linear-to-r from-violet-500/20 to-blue-500/20 text-violet-300 border border-violet-500/30",
          className
        )}
      >
        <span className="material-symbols-outlined text-[8px]">auto_awesome</span>
        AI
      </span>
    );
  }

  if (variant === "chip") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold",
          "bg-linear-to-r from-violet-500/15 to-blue-500/15 text-violet-300 border border-violet-500/25",
          className
        )}
      >
        <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
        {label || "AI-assisted"}
      </span>
    );
  }

  // default
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
        "bg-linear-to-r from-violet-500/20 to-blue-500/20 text-violet-300 border border-violet-500/30",
        "shadow-sm shadow-violet-500/10",
        className
      )}
    >
      <span className="material-symbols-outlined text-[9px]">auto_awesome</span>
      {label || "AI Insights"}
    </span>
  );
}
