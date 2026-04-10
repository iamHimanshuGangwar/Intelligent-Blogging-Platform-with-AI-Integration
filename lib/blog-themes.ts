export type BlogBlockVariant = "minimal" | "soft" | "editorial" | "glow" | "terminal";

export type BlogThemeSource = "builtin" | "custom";

export interface BlogThemePalette {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  heading: string;
  accent: string;
  border: string;
  codeBackground: string;
  codeText: string;
  blockquoteBackground: string;
  tableHeaderBackground: string;
}

export interface BlogThemeConfig {
  palette: BlogThemePalette;
  blockVariant: BlogBlockVariant;
  fontClass: string;
}

export interface BlogThemeRecord {
  id: string;
  name: string;
  description?: string | null;
  preview_icon?: string | null;
  created_by?: string | null;
  creator_name?: string | null;
  is_public?: boolean | null;
  is_featured?: boolean | null;
  status?: "active" | "archived" | null;
  theme_config?: Partial<BlogThemeConfig> | null;
}

export interface BlogTheme {
  id: string;
  name: string;
  description: string;
  previewImage: string;
  source: BlogThemeSource;
  fontClass: string;
  blockVariant: BlogBlockVariant;
  palette: BlogThemePalette;
  bgClass: string;
  textClass: string;
  headingClass: string;
  linkClass: string;
  codeBlockClass: string;
  blockquoteClass: string;
  cardClass: string;
  coverOverlayClass: string;
  accentClass: string;
  proseClass: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  creatorId?: string | null;
  creatorName?: string | null;
  status?: "active" | "archived";
}

const makeTheme = (theme: Omit<BlogTheme, "source">): BlogTheme => ({
  ...theme,
  source: "builtin",
});

export const BLOG_THEMES: BlogTheme[] = [
  makeTheme({
    id: "default",
    name: "Default Dark",
    description: "Clean dark theme with blue accents",
    previewImage: "🌑",
    fontClass: "font-body",
    blockVariant: "soft",
    palette: { background: "#0e0e0e", surface: "#1a1a1a", text: "#d4d4d8", mutedText: "#a1a1aa", heading: "#ffffff", accent: "#85adff", border: "#3f3f46", codeBackground: "#161616", codeText: "#dbeafe", blockquoteBackground: "#0f1d33", tableHeaderBackground: "#171717" },
    bgClass: "bg-background",
    textClass: "text-on-surface-variant",
    headingClass: "text-on-surface",
    linkClass: "text-primary hover:text-primary/80",
    codeBlockClass: "bg-surface-container border border-outline-variant/20",
    blockquoteClass: "border-l-4 border-primary/40 bg-primary/5 pl-4 py-2 italic",
    cardClass: "bg-surface-container-low border-outline-variant/15",
    coverOverlayClass: "from-transparent via-transparent to-background",
    accentClass: "text-primary",
    proseClass: "prose prose-invert prose-lg",
  }),
  makeTheme({
    id: "midnight-purple",
    name: "Midnight Purple",
    description: "Deep purple tones with violet accents",
    previewImage: "🔮",
    fontClass: "font-body",
    blockVariant: "glow",
    palette: { background: "#0d0a1a", surface: "#17102a", text: "#ede9fe", mutedText: "#c4b5fd", heading: "#faf5ff", accent: "#a855f7", border: "#5b21b6", codeBackground: "#160f2b", codeText: "#e9d5ff", blockquoteBackground: "#22103c", tableHeaderBackground: "#1e1336" },
    bgClass: "bg-[#0d0a1a]",
    textClass: "text-purple-100/80",
    headingClass: "text-purple-50",
    linkClass: "text-violet-400 hover:text-violet-300",
    codeBlockClass: "bg-[#1a1030] border border-violet-500/20",
    blockquoteClass: "border-l-4 border-violet-500/50 bg-violet-500/5 pl-4 py-2 italic",
    cardClass: "bg-[#140f26] border-violet-500/15",
    coverOverlayClass: "from-transparent via-transparent to-[#0d0a1a]",
    accentClass: "text-violet-400",
    proseClass: "prose prose-invert prose-lg prose-violet",
  }),
  makeTheme({
    id: "forest-green",
    name: "Forest Green",
    description: "Nature-inspired green & earth tones",
    previewImage: "🌿",
    fontClass: "font-body",
    blockVariant: "soft",
    palette: { background: "#0a1a0f", surface: "#102316", text: "#d1fae5", mutedText: "#a7f3d0", heading: "#ecfdf5", accent: "#34d399", border: "#065f46", codeBackground: "#102017", codeText: "#d1fae5", blockquoteBackground: "#0e2618", tableHeaderBackground: "#0f2115" },
    bgClass: "bg-[#0a1a0f]",
    textClass: "text-emerald-100/80",
    headingClass: "text-emerald-50",
    linkClass: "text-emerald-400 hover:text-emerald-300",
    codeBlockClass: "bg-[#0f2618] border border-emerald-500/20",
    blockquoteClass: "border-l-4 border-emerald-500/50 bg-emerald-500/5 pl-4 py-2 italic",
    cardClass: "bg-[#0d1f14] border-emerald-500/15",
    coverOverlayClass: "from-transparent via-transparent to-[#0a1a0f]",
    accentClass: "text-emerald-400",
    proseClass: "prose prose-invert prose-lg prose-emerald",
  }),
  makeTheme({
    id: "warm-sunset",
    name: "Warm Sunset",
    description: "Golden amber tones with warm glow",
    previewImage: "🌅",
    fontClass: "font-body",
    blockVariant: "editorial",
    palette: { background: "#1a120a", surface: "#24180d", text: "#fef3c7", mutedText: "#fde68a", heading: "#fffbeb", accent: "#f59e0b", border: "#92400e", codeBackground: "#251809", codeText: "#fde68a", blockquoteBackground: "#2a1909", tableHeaderBackground: "#2a1909" },
    bgClass: "bg-[#1a120a]",
    textClass: "text-amber-100/80",
    headingClass: "text-amber-50",
    linkClass: "text-amber-400 hover:text-amber-300",
    codeBlockClass: "bg-[#261a0f] border border-amber-500/20",
    blockquoteClass: "border-l-4 border-amber-500/50 bg-amber-500/5 pl-4 py-2 italic",
    cardClass: "bg-[#1f150d] border-amber-500/15",
    coverOverlayClass: "from-transparent via-transparent to-[#1a120a]",
    accentClass: "text-amber-400",
    proseClass: "prose prose-invert prose-lg prose-amber",
  }),
  makeTheme({
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Deep sea blue with cyan highlights",
    previewImage: "🌊",
    fontClass: "font-body",
    blockVariant: "minimal",
    palette: { background: "#0a0f1a", surface: "#0f1628", text: "#cffafe", mutedText: "#a5f3fc", heading: "#ecfeff", accent: "#22d3ee", border: "#155e75", codeBackground: "#10182a", codeText: "#cffafe", blockquoteBackground: "#0d1d30", tableHeaderBackground: "#0f1829" },
    bgClass: "bg-[#0a0f1a]",
    textClass: "text-cyan-100/80",
    headingClass: "text-cyan-50",
    linkClass: "text-cyan-400 hover:text-cyan-300",
    codeBlockClass: "bg-[#0f1826] border border-cyan-500/20",
    blockquoteClass: "border-l-4 border-cyan-500/50 bg-cyan-500/5 pl-4 py-2 italic",
    cardClass: "bg-[#0d1520] border-cyan-500/15",
    coverOverlayClass: "from-transparent via-transparent to-[#0a0f1a]",
    accentClass: "text-cyan-400",
    proseClass: "prose prose-invert prose-lg prose-cyan",
  }),
  makeTheme({
    id: "rose-garden",
    name: "Rose Garden",
    description: "Elegant pink & rose tones",
    previewImage: "🌹",
    fontClass: "font-body",
    blockVariant: "soft",
    palette: { background: "#1a0a12", surface: "#240f19", text: "#ffe4e6", mutedText: "#fda4af", heading: "#fff1f2", accent: "#fb7185", border: "#9f1239", codeBackground: "#260f18", codeText: "#ffe4e6", blockquoteBackground: "#2b0f19", tableHeaderBackground: "#2c0f1a" },
    bgClass: "bg-[#1a0a12]",
    textClass: "text-rose-100/80",
    headingClass: "text-rose-50",
    linkClass: "text-rose-400 hover:text-rose-300",
    codeBlockClass: "bg-[#260f18] border border-rose-500/20",
    blockquoteClass: "border-l-4 border-rose-500/50 bg-rose-500/5 pl-4 py-2 italic",
    cardClass: "bg-[#1f0d15] border-rose-500/15",
    coverOverlayClass: "from-transparent via-transparent to-[#1a0a12]",
    accentClass: "text-rose-400",
    proseClass: "prose prose-invert prose-lg prose-rose",
  }),
  makeTheme({
    id: "minimal-light",
    name: "Minimal Light",
    description: "Clean light background with dark text",
    previewImage: "☀️",
    fontClass: "font-body",
    blockVariant: "minimal",
    palette: { background: "#f8f6f3", surface: "#ffffff", text: "#374151", mutedText: "#6b7280", heading: "#111827", accent: "#2563eb", border: "#d1d5db", codeBackground: "#f0ede8", codeText: "#1f2937", blockquoteBackground: "#eef2ff", tableHeaderBackground: "#f3f4f6" },
    bgClass: "bg-[#f8f6f3]",
    textClass: "text-[#374151]",
    headingClass: "text-[#111827]",
    linkClass: "text-blue-600 hover:text-blue-500",
    codeBlockClass: "bg-[#f0ede8] border border-gray-300",
    blockquoteClass: "border-l-4 border-gray-400 bg-gray-100 pl-4 py-2 italic text-gray-600",
    cardClass: "bg-white border-gray-200",
    coverOverlayClass: "from-transparent via-transparent to-[#f8f6f3]",
    accentClass: "text-blue-600",
    proseClass: "prose prose-lg",
  }),
  makeTheme({
    id: "newspaper",
    name: "Newspaper",
    description: "Classic serif newspaper layout",
    previewImage: "📰",
    fontClass: "font-serif",
    blockVariant: "editorial",
    palette: { background: "#faf8f4", surface: "#fffdf8", text: "#333333", mutedText: "#5f5f5f", heading: "#111111", accent: "#8b4513", border: "#caa27d", codeBackground: "#f0ede8", codeText: "#3b2f2f", blockquoteBackground: "#f5f0e8", tableHeaderBackground: "#f0e7db" },
    bgClass: "bg-[#faf8f4]",
    textClass: "text-[#333] leading-[1.9]",
    headingClass: "text-[#111] font-serif",
    linkClass: "text-[#8b4513] hover:text-[#a0522d] underline",
    codeBlockClass: "bg-[#f0ede8] border border-[#d4c9b8]",
    blockquoteClass: "border-l-4 border-[#8b4513] bg-[#f5f0e8] pl-4 py-2 italic text-[#555] font-serif",
    cardClass: "bg-[#faf8f4] border-[#d4c9b8]",
    coverOverlayClass: "from-transparent via-transparent to-[#faf8f4]",
    accentClass: "text-[#8b4513]",
    proseClass: "prose prose-lg prose-stone",
  }),
  makeTheme({
    id: "neon-cyber",
    name: "Neon Cyber",
    description: "Cyberpunk neon with glitch aesthetic",
    previewImage: "⚡",
    fontClass: "font-mono",
    blockVariant: "glow",
    palette: { background: "#0a0a0f", surface: "#0f0f1a", text: "#00ff88", mutedText: "#7dffc6", heading: "#00ff88", accent: "#ff00ff", border: "#00a86b", codeBackground: "#0f0f1a", codeText: "#c4b5fd", blockquoteBackground: "#1a0f20", tableHeaderBackground: "#121220" },
    bgClass: "bg-[#0a0a0f]",
    textClass: "text-[#00ff88]/90",
    headingClass: "text-[#00ff88]",
    linkClass: "text-[#ff00ff] hover:text-[#ff66ff]",
    codeBlockClass: "bg-[#0f0f1a] border border-[#00ff88]/30",
    blockquoteClass: "border-l-4 border-[#ff00ff]/60 bg-[#ff00ff]/5 pl-4 py-2 italic text-[#00ff88]/70",
    cardClass: "bg-[#0a0a14] border-[#00ff88]/20",
    coverOverlayClass: "from-transparent via-transparent to-[#0a0a0f]",
    accentClass: "text-[#00ff88]",
    proseClass: "prose prose-invert prose-lg",
  }),
  makeTheme({
    id: "terminal",
    name: "Terminal",
    description: "Retro terminal with monospace text",
    previewImage: "💻",
    fontClass: "font-mono",
    blockVariant: "terminal",
    palette: { background: "#000000", surface: "#061206", text: "#4ade80", mutedText: "#86efac", heading: "#bbf7d0", accent: "#4ade80", border: "#166534", codeBackground: "#071607", codeText: "#dcfce7", blockquoteBackground: "#091909", tableHeaderBackground: "#0a160a" },
    bgClass: "bg-black",
    textClass: "text-green-400/90 font-mono",
    headingClass: "text-green-300 font-mono",
    linkClass: "text-green-300 hover:text-green-200 underline",
    codeBlockClass: "bg-[#0a1a0a] border border-green-500/30",
    blockquoteClass: "border-l-4 border-green-500/50 bg-green-500/5 pl-4 py-2 italic text-green-400/70 font-mono",
    cardClass: "bg-[#0a0f0a] border-green-500/20",
    coverOverlayClass: "from-transparent via-transparent to-black",
    accentClass: "text-green-400",
    proseClass: "prose prose-invert prose-lg prose-green",
  }),
];

const BUILTIN_THEME_MAP = new Map(BLOG_THEMES.map((theme) => [theme.id, theme]));

export const FONT_OPTIONS = [
  { value: "font-body", label: "Modern Sans" },
  { value: "font-serif", label: "Editorial Serif" },
  { value: "font-mono", label: "Terminal Mono" },
];

export const BLOCK_VARIANTS: Array<{ value: BlogBlockVariant; label: string; description: string }> = [
  { value: "minimal", label: "Minimal", description: "Thin borders and low chrome" },
  { value: "soft", label: "Soft", description: "Rounded surfaces with tinted callouts" },
  { value: "editorial", label: "Editorial", description: "Magazine-style hierarchy and quotes" },
  { value: "glow", label: "Glow", description: "Accent glow for code and pull quotes" },
  { value: "terminal", label: "Terminal", description: "Square, sharp, retro console framing" },
];

export function isBuiltinTheme(id: string | null | undefined): boolean {
  return !!id && BUILTIN_THEME_MAP.has(id);
}

export function getThemeById(id: string): BlogTheme {
  return BUILTIN_THEME_MAP.get(id) || BLOG_THEMES[0];
}

function mergePalette(base: BlogThemePalette, incoming?: Partial<BlogThemePalette> | null): BlogThemePalette {
  return { ...base, ...(incoming || {}) };
}

export function hydrateCustomTheme(record: BlogThemeRecord): BlogTheme {
  const fallback = BLOG_THEMES[0];
  const config = record.theme_config || {};
  const palette = mergePalette(fallback.palette, config.palette);

  // Generate Tailwind arbitrary-value classes from the custom palette
  // so they override the default theme's CSS-variable-based classes
  const bg = palette.background;
  const txt = palette.text;
  const heading = palette.heading;
  const accent = palette.accent;
  const border = palette.border;
  const surface = palette.surface;
  const codeBg = palette.codeBackground;
  const bqBg = palette.blockquoteBackground;

  return {
    ...fallback,
    id: record.id,
    name: record.name,
    description: record.description || "Custom user-made blog theme",
    previewImage: record.preview_icon || "🎨",
    source: "custom",
    fontClass: config.fontClass || fallback.fontClass,
    blockVariant: config.blockVariant || fallback.blockVariant,
    palette,
    bgClass: `bg-[${bg}]`,
    textClass: `text-[${txt}]`,
    headingClass: `text-[${heading}]`,
    linkClass: `text-[${accent}] hover:opacity-80`,
    codeBlockClass: `bg-[${codeBg}] border border-[${border}]/30`,
    blockquoteClass: `border-l-4 border-[${accent}]/50 bg-[${bqBg}] pl-4 py-2 italic`,
    cardClass: `bg-[${surface}] border-[${border}]/20`,
    coverOverlayClass: `from-transparent via-transparent to-[${bg}]`,
    accentClass: `text-[${accent}]`,
    proseClass: "prose prose-invert prose-lg",
    isPublic: Boolean(record.is_public),
    isFeatured: Boolean(record.is_featured),
    creatorId: record.created_by || null,
    creatorName: record.creator_name || null,
    status: record.status || "active",
  };
}

export function getThemeFromAny(input?: string | BlogThemeRecord | BlogTheme | null): BlogTheme {
  if (!input) return BLOG_THEMES[0];
  if (typeof input === "string") return getThemeById(input);
  if ("source" in input && "palette" in input) return input as BlogTheme;
  return hydrateCustomTheme(input as BlogThemeRecord);
}

export function makeThemePreviewStyle(theme: BlogTheme): Record<string, string> {
  return {
    backgroundColor: theme.palette.background,
    color: theme.palette.text,
    borderColor: theme.palette.border,
  };
}

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function sanitizeThemeConfig(input?: Partial<BlogThemeConfig> | null): BlogThemeConfig {
  const fallback = BLOG_THEMES[0];
  const palette: Partial<BlogThemePalette> = input?.palette || {};
  const safeColor = (value: string | undefined, fallbackColor: string) => {
    if (!value) return fallbackColor;
    return HEX_COLOR.test(value.trim()) ? value.trim() : fallbackColor;
  };

  const fontClass = FONT_OPTIONS.some((option) => option.value === input?.fontClass)
    ? (input?.fontClass as string)
    : fallback.fontClass;

  const blockVariant = BLOCK_VARIANTS.some((variant) => variant.value === input?.blockVariant)
    ? (input?.blockVariant as BlogBlockVariant)
    : fallback.blockVariant;

  return {
    fontClass,
    blockVariant,
    palette: {
      background: safeColor(palette.background, fallback.palette.background),
      surface: safeColor(palette.surface, fallback.palette.surface),
      text: safeColor(palette.text, fallback.palette.text),
      mutedText: safeColor(palette.mutedText, fallback.palette.mutedText),
      heading: safeColor(palette.heading, fallback.palette.heading),
      accent: safeColor(palette.accent, fallback.palette.accent),
      border: safeColor(palette.border, fallback.palette.border),
      codeBackground: safeColor(palette.codeBackground, fallback.palette.codeBackground),
      codeText: safeColor(palette.codeText, fallback.palette.codeText),
      blockquoteBackground: safeColor(palette.blockquoteBackground, fallback.palette.blockquoteBackground),
      tableHeaderBackground: safeColor(palette.tableHeaderBackground, fallback.palette.tableHeaderBackground),
    },
  };
}

export function getThemeCollections(records: BlogThemeRecord[] = []): BlogTheme[] {
  return [...BLOG_THEMES, ...records.map(hydrateCustomTheme)];
}
