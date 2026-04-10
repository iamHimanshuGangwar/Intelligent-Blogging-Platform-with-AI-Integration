import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Deterministic gradient palette for a given user ID.
// Returns a CSS `linear-gradient(...)` string so the same user always gets
// the same gradient while different users see visually distinct colours.
const USER_GRADIENT_PALETTES = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",  // indigo → violet
  "linear-gradient(135deg,#10b981,#06b6d4)",  // emerald → cyan
  "linear-gradient(135deg,#f97316,#fb923c)",  // orange → amber
  "linear-gradient(135deg,#ec4899,#f43f5e)",  // pink → rose
  "linear-gradient(135deg,#3b82f6,#6366f1)",  // blue → indigo
  "linear-gradient(135deg,#a855f7,#ec4899)",  // purple → pink
  "linear-gradient(135deg,#14b8a6,#10b981)",  // teal → emerald
  "linear-gradient(135deg,#f59e0b,#f97316)",  // amber → orange
];

export function getUserGradient(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return USER_GRADIENT_PALETTES[hash % USER_GRADIENT_PALETTES.length];
}

// Returns a solid accent colour (hex) derived from the user's gradient for
// use as a border or badge colour.
export function getUserAccentColor(userId: string): string {
  const ACCENTS = ["#6366f1","#10b981","#f97316","#ec4899","#3b82f6","#a855f7","#14b8a6","#f59e0b"];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}
