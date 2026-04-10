/* ────────────────────────────────────────────────────────────
   Per-category visual identity:
   Each category gets a unique Unsplash hero image, display
   font, gradient accent, and pattern overlay.
   ──────────────────────────────────────────────────────────── */

export type CardVariant = "classic" | "magazine" | "terminal" | "polaroid" | "glassmorphic" | "brutalist" | "editorial" | "neon" | "minimal" | "cinematic" | "notebook" | "postcard" | "vinyl" | "recipe" | "passport";

export interface CategoryStyle {
  heroImage: string;
  fontFamily: string;
  fontLabel: string;
  gradientFrom: string;
  gradientVia: string;
  accentColor: string;
  pattern: string;
  cardVariant: CardVariant;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "market-business": {
    heroImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Playfair Display', Georgia, serif",
    fontLabel: "Playfair Display",
    gradientFrom: "rgba(120,80,20,0.85)",
    gradientVia: "rgba(40,30,10,0.75)",
    accentColor: "#c99a5b",
    pattern: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(201,154,91,0.03) 10px, rgba(201,154,91,0.03) 20px)",
    cardVariant: "classic",
  },
  "real-estate": {
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontLabel: "Cormorant Garamond",
    gradientFrom: "rgba(20,60,100,0.85)",
    gradientVia: "rgba(10,25,50,0.75)",
    accentColor: "#4d8ef7",
    pattern: "repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(77,142,247,0.02) 20px, rgba(77,142,247,0.02) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(77,142,247,0.02) 20px, rgba(77,142,247,0.02) 21px)",
    cardVariant: "polaroid",
  },
  "science": {
    heroImage: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontLabel: "Space Grotesk",
    gradientFrom: "rgba(60,20,120,0.85)",
    gradientVia: "rgba(20,10,50,0.75)",
    accentColor: "#7c6cf0",
    pattern: "radial-gradient(circle, rgba(124,108,240,0.04) 1px, transparent 1px)",
    cardVariant: "glassmorphic",
  },
  "technology": {
    heroImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop&q=80",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontLabel: "JetBrains Mono",
    gradientFrom: "rgba(10,80,50,0.85)",
    gradientVia: "rgba(5,30,20,0.75)",
    accentColor: "#00f0ff",
    pattern: "linear-gradient(0deg, rgba(0,240,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px)",
    cardVariant: "terminal",
  },
  "social-media": {
    heroImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=400&fit=crop&q=80",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    fontLabel: "DM Sans",
    gradientFrom: "rgba(120,20,80,0.85)",
    gradientVia: "rgba(50,10,40,0.75)",
    accentColor: "#e040a0",
    pattern: "radial-gradient(ellipse at 30% 50%, rgba(224,64,160,0.06), transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(100,60,240,0.06), transparent 50%)",
    cardVariant: "neon",
  },
  "code-space": {
    heroImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
    fontLabel: "Fira Code",
    gradientFrom: "rgba(30,30,30,0.92)",
    gradientVia: "rgba(13,17,23,0.85)",
    accentColor: "#58a6ff",
    pattern: "linear-gradient(0deg, rgba(88,166,255,0.015) 1px, transparent 1px)",
    cardVariant: "terminal",
  },
  "photography": {
    heroImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Lora', Georgia, serif",
    fontLabel: "Lora",
    gradientFrom: "rgba(60,30,10,0.85)",
    gradientVia: "rgba(20,14,8,0.75)",
    accentColor: "#d4944c",
    pattern: "radial-gradient(circle at 50% 50%, rgba(212,148,76,0.04) 0%, transparent 60%)",
    cardVariant: "polaroid",
  },
  "architecture": {
    heroImage: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Montserrat', 'Space Grotesk', sans-serif",
    fontLabel: "Montserrat",
    gradientFrom: "rgba(40,40,35,0.88)",
    gradientVia: "rgba(18,18,16,0.8)",
    accentColor: "#c8b890",
    pattern: "repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(200,184,144,0.02) 40px, rgba(200,184,144,0.02) 41px)",
    cardVariant: "brutalist",
  },
  "typography": {
    heroImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Crimson Pro', 'Playfair Display', Georgia, serif",
    fontLabel: "Crimson Pro",
    gradientFrom: "rgba(80,50,20,0.85)",
    gradientVia: "rgba(30,20,10,0.75)",
    accentColor: "#a08060",
    pattern: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(160,128,96,0.015) 3px, rgba(160,128,96,0.015) 4px)",
    cardVariant: "editorial",
  },
  "about-portfolio": {
    heroImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Inter', sans-serif",
    fontLabel: "Inter",
    gradientFrom: "rgba(20,30,80,0.85)",
    gradientVia: "rgba(10,14,40,0.75)",
    accentColor: "#5890e0",
    pattern: "radial-gradient(circle at 80% 20%, rgba(88,144,224,0.06), transparent 50%)",
    cardVariant: "minimal",
  },
  "health-wellness": {
    heroImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontLabel: "Source Serif 4",
    gradientFrom: "rgba(20,80,60,0.85)",
    gradientVia: "rgba(10,40,30,0.75)",
    accentColor: "#4ade80",
    pattern: "radial-gradient(circle at 50% 80%, rgba(74,222,128,0.06), transparent 60%)",
    cardVariant: "magazine",
  },
  "food-culinary": {
    heroImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Merriweather', Georgia, serif",
    fontLabel: "Merriweather",
    gradientFrom: "rgba(100,30,10,0.85)",
    gradientVia: "rgba(40,14,5,0.75)",
    accentColor: "#f97316",
    pattern: "radial-gradient(circle at 30% 60%, rgba(249,115,22,0.06), transparent 50%)",
    cardVariant: "recipe",
  },
  "travel-adventure": {
    heroImage: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Nunito Sans', sans-serif",
    fontLabel: "Nunito Sans",
    gradientFrom: "rgba(20,50,100,0.85)",
    gradientVia: "rgba(10,20,50,0.75)",
    accentColor: "#38bdf8",
    pattern: "radial-gradient(ellipse at 60% 40%, rgba(56,189,248,0.06), transparent 50%)",
    cardVariant: "postcard",
  },
  "education-learning": {
    heroImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&q=80",
    fontFamily: "'IBM Plex Serif', Georgia, serif",
    fontLabel: "IBM Plex Serif",
    gradientFrom: "rgba(60,40,20,0.85)",
    gradientVia: "rgba(30,18,10,0.75)",
    accentColor: "#fbbf24",
    pattern: "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(251,191,36,0.015) 4px, rgba(251,191,36,0.015) 5px)",
    cardVariant: "notebook",
  },
  "music-entertainment": {
    heroImage: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Outfit', sans-serif",
    fontLabel: "Outfit",
    gradientFrom: "rgba(80,10,60,0.85)",
    gradientVia: "rgba(30,5,25,0.75)",
    accentColor: "#ec4899",
    pattern: "radial-gradient(ellipse at 20% 60%, rgba(236,72,153,0.08), transparent 50%), radial-gradient(ellipse at 80% 40%, rgba(139,92,246,0.06), transparent 50%)",
    cardVariant: "vinyl",
  },
  "fashion-lifestyle": {
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Poppins', sans-serif",
    fontLabel: "Poppins",
    gradientFrom: "rgba(100,20,60,0.85)",
    gradientVia: "rgba(40,10,30,0.75)",
    accentColor: "#f472b6",
    pattern: "radial-gradient(ellipse at 50% 30%, rgba(244,114,182,0.06), transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(168,85,247,0.04), transparent 40%)",
    cardVariant: "magazine",
  },
  "gaming-esports": {
    heroImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Orbitron', sans-serif",
    fontLabel: "Orbitron",
    gradientFrom: "rgba(20,10,60,0.90)",
    gradientVia: "rgba(10,5,30,0.80)",
    accentColor: "#a855f7",
    pattern: "linear-gradient(45deg, rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(-45deg, rgba(168,85,247,0.03) 1px, transparent 1px)",
    cardVariant: "neon",
  },
  "automotive": {
    heroImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Rajdhani', sans-serif",
    fontLabel: "Rajdhani",
    gradientFrom: "rgba(30,20,10,0.88)",
    gradientVia: "rgba(15,10,5,0.80)",
    accentColor: "#ef4444",
    pattern: "repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(239,68,68,0.02) 30px, rgba(239,68,68,0.02) 31px)",
    cardVariant: "cinematic",
  },
  "sports-fitness": {
    heroImage: "https://images.unsplash.com/photo-1461896836934-bd45ba8c5e78?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Barlow', sans-serif",
    fontLabel: "Barlow",
    gradientFrom: "rgba(10,40,80,0.85)",
    gradientVia: "rgba(5,20,40,0.75)",
    accentColor: "#06b6d4",
    pattern: "radial-gradient(circle at 70% 30%, rgba(6,182,212,0.06), transparent 50%)",
    cardVariant: "brutalist",
  },
  "environment-nature": {
    heroImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Libre Baskerville', Georgia, serif",
    fontLabel: "Libre Baskerville",
    gradientFrom: "rgba(10,50,20,0.85)",
    gradientVia: "rgba(5,25,10,0.75)",
    accentColor: "#22c55e",
    pattern: "radial-gradient(circle at 40% 60%, rgba(34,197,94,0.06), transparent 50%), radial-gradient(circle at 70% 30%, rgba(16,185,129,0.04), transparent 40%)",
    cardVariant: "passport",
  },
  "history-heritage": {
    heroImage: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Crimson Pro', Georgia, serif",
    fontLabel: "Crimson Pro",
    gradientFrom: "rgba(80,50,20,0.85)",
    gradientVia: "rgba(35,22,10,0.75)",
    accentColor: "#d4a048",
    pattern: "repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(212,160,72,0.015) 6px, rgba(212,160,72,0.015) 7px)",
    cardVariant: "editorial",
  },
  "psychology-mind": {
    heroImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontLabel: "Source Serif 4",
    gradientFrom: "rgba(60,20,80,0.85)",
    gradientVia: "rgba(25,10,38,0.75)",
    accentColor: "#b060e0",
    pattern: "radial-gradient(circle at 50% 50%, rgba(176,96,224,0.05), transparent 55%)",
    cardVariant: "magazine",
  },
  "ai-machine-learning": {
    heroImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    fontLabel: "Space Grotesk",
    gradientFrom: "rgba(10,30,60,0.88)",
    gradientVia: "rgba(5,15,35,0.80)",
    accentColor: "#38bdf8",
    pattern: "linear-gradient(0deg, rgba(56,189,248,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.02) 1px, transparent 1px)",
    cardVariant: "terminal",
  },
  "blockchain-crypto": {
    heroImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Rajdhani', sans-serif",
    fontLabel: "Rajdhani",
    gradientFrom: "rgba(20,10,50,0.90)",
    gradientVia: "rgba(10,5,30,0.82)",
    accentColor: "#f59e0b",
    pattern: "linear-gradient(60deg, rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(-60deg, rgba(245,158,11,0.03) 1px, transparent 1px)",
    cardVariant: "neon",
  },
  "politics-society": {
    heroImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=400&fit=crop&q=80",
    fontFamily: "'IBM Plex Serif', Georgia, serif",
    fontLabel: "IBM Plex Serif",
    gradientFrom: "rgba(50,20,20,0.85)",
    gradientVia: "rgba(25,10,10,0.75)",
    accentColor: "#dc2626",
    pattern: "repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(220,38,38,0.02) 28px, rgba(220,38,38,0.02) 29px)",
    cardVariant: "classic",
  },
  "personal-development": {
    heroImage: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Nunito Sans', sans-serif",
    fontLabel: "Nunito Sans",
    gradientFrom: "rgba(20,60,80,0.85)",
    gradientVia: "rgba(10,30,40,0.75)",
    accentColor: "#14b8a6",
    pattern: "radial-gradient(circle at 60% 40%, rgba(20,184,166,0.06), transparent 50%)",
    cardVariant: "minimal",
  },
  "diy-crafts": {
    heroImage: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Merriweather', Georgia, serif",
    fontLabel: "Merriweather",
    gradientFrom: "rgba(80,50,30,0.85)",
    gradientVia: "rgba(35,22,14,0.75)",
    accentColor: "#ea580c",
    pattern: "radial-gradient(circle at 30% 70%, rgba(234,88,12,0.06), transparent 50%)",
    cardVariant: "postcard",
  },
  "pets-animals": {
    heroImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Poppins', sans-serif",
    fontLabel: "Poppins",
    gradientFrom: "rgba(40,60,20,0.85)",
    gradientVia: "rgba(18,28,10,0.75)",
    accentColor: "#84cc16",
    pattern: "radial-gradient(circle at 70% 60%, rgba(132,204,22,0.06), transparent 50%)",
    cardVariant: "polaroid",
  },
  "space-astronomy": {
    heroImage: "https://images.unsplash.com/photo-1462332420958-a33f540d6b5d?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Orbitron', sans-serif",
    fontLabel: "Orbitron",
    gradientFrom: "rgba(5,5,30,0.92)",
    gradientVia: "rgba(2,2,18,0.85)",
    accentColor: "#818cf8",
    pattern: "radial-gradient(circle at 50% 50%, rgba(129,140,248,0.04) 1px, transparent 1px)",
    cardVariant: "cinematic",
  },
  "philosophy-ideas": {
    heroImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=400&fit=crop&q=80",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontLabel: "Cormorant Garamond",
    gradientFrom: "rgba(40,30,50,0.88)",
    gradientVia: "rgba(20,15,28,0.80)",
    accentColor: "#a78bfa",
    pattern: "radial-gradient(ellipse at 40% 40%, rgba(167,139,250,0.05), transparent 55%)",
    cardVariant: "glassmorphic",
  },
};

/* ────────────────────────────────────────────────────────────
   Block-template categories with curated sample themes
   ──────────────────────────────────────────────────────────── */
export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  preview: { bg: string; surface: string; text: string; accent: string; heading: string; muted: string };
  font: string;
  tags: string[];
  image: string;
  sampleTitle?: string;
  sampleExcerpt?: string;
}

export interface TemplateCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  templates: BlockTemplate[];
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "market-business",
    title: "Market & Business",
    subtitle: "Professional templates for commerce, finance and enterprise storytelling",
    icon: "trending_up",
    templates: [
      { id: "biz-sahara", name: "Sahara Executive", description: "Warm earthy tones for corporate narratives", icon: "☀️", preview: { bg: "#1a150e", surface: "#241e14", text: "#d4c9b0", accent: "#c99a5b", heading: "#f5e6cc", muted: "#9c8b70" }, font: "'Playfair Display', serif", tags: ["editorial", "warm"], image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=340&fit=crop&q=80", sampleTitle: "Q4 Earnings Surpass Expectations", sampleExcerpt: "The quarterly report reveals a 23% increase in revenue driven by strategic market expansion across emerging economies..." },
      { id: "biz-slate", name: "Slate Pro", description: "Clean slate grays for data-driven reports", icon: "📊", preview: { bg: "#0f1114", surface: "#181b20", text: "#c8ccd4", accent: "#6b8aff", heading: "#eef0f4", muted: "#7c8290" }, font: "'Space Grotesk', sans-serif", tags: ["minimal", "data"], image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&q=80", sampleTitle: "Data-Driven Market Analysis", sampleExcerpt: "Comprehensive analysis of market trends using machine learning models reveals shifts in consumer spending patterns..." },
      { id: "biz-emerald", name: "Emerald Ledger", description: "Financial green with trust signals", icon: "💰", preview: { bg: "#0a120e", surface: "#12201a", text: "#b8d4c8", accent: "#3dd68c", heading: "#e0f4ea", muted: "#6b9a82" }, font: "'Inter', sans-serif", tags: ["finance", "trust"], image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600&h=340&fit=crop&q=80", sampleTitle: "Sustainable Investment Portfolio", sampleExcerpt: "ESG-focused funds have demonstrated consistent returns while maintaining ethical investment standards across global markets..." },
      { id: "biz-noir", name: "Noir Quarterly", description: "High-contrast dark editorial for premium brands", icon: "🖤", preview: { bg: "#0a0a0a", surface: "#141414", text: "#c8c8c8", accent: "#ffffff", heading: "#ffffff", muted: "#6e6e6e" }, font: "'Playfair Display', serif", tags: ["premium", "minimal"], image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=340&fit=crop&q=80", sampleTitle: "The Future of Luxury Markets", sampleExcerpt: "An in-depth exploration of how digital transformation is reshaping luxury consumer behavior and brand positioning..." },
      { id: "biz-midnight", name: "Midnight Bloomberg", description: "Dark terminal aesthetic for financial analytics", icon: "📈", preview: { bg: "#080c14", surface: "#101824", text: "#a0b8d4", accent: "#00d4aa", heading: "#e0ecff", muted: "#506888" }, font: "'JetBrains Mono', monospace", tags: ["finance", "terminal"], image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=340&fit=crop&q=80", sampleTitle: "Real-Time Market Signals Dashboard", sampleExcerpt: "Algorithmic trading strategies powered by machine learning models detect micro-patterns across 47 global exchanges..." },
      { id: "biz-ivory", name: "Ivory Report", description: "Premium light-on-dark report styling", icon: "📄", preview: { bg: "#0c0a08", surface: "#181410", text: "#d8d0c0", accent: "#c8a870", heading: "#f4ece0", muted: "#907850" }, font: "'Playfair Display', serif", tags: ["report", "elegant"], image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=340&fit=crop&q=80", sampleTitle: "Annual Shareholder Report 2025", sampleExcerpt: "A comprehensive review of organizational performance, strategic initiatives, and projected growth trajectories for stakeholders..." },
      { id: "biz-copper", name: "Copper Street", description: "Rich copper and gold tones for Wall Street narratives", icon: "🏦", preview: { bg: "#0e0a06", surface: "#1a1408", text: "#d4c4a0", accent: "#d4884c", heading: "#f0e0c0", muted: "#9c8458" }, font: "'Lora', serif", tags: ["wall-street", "warm"], image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&h=340&fit=crop&q=80", sampleTitle: "Copper Futures and Commodity Trends", sampleExcerpt: "Global supply chain disruptions create unprecedented opportunities in base metal futures as renewable energy demand accelerates..." },
      { id: "biz-graph", name: "Graphite Analytics", description: "Cool gray analytical dashboard style", icon: "📉", preview: { bg: "#0e0f12", surface: "#171920", text: "#b0b8c8", accent: "#7090d0", heading: "#dce0ec", muted: "#5c6478" }, font: "'Space Grotesk', sans-serif", tags: ["analytics", "data"], image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop&q=80", sampleTitle: "Predictive Analytics in Retail Banking", sampleExcerpt: "Machine learning models achieve 89% accuracy in predicting customer churn, enabling proactive retention strategies..." },
    ],
  },
  {
    id: "real-estate",
    title: "Real Estate",
    subtitle: "Elegant layouts for property showcases and architectural stories",
    icon: "apartment",
    templates: [
      { id: "re-marble", name: "Marble Estate", description: "Luxurious cream tones for property showcases", icon: "🏛️", preview: { bg: "#14110e", surface: "#1e1a14", text: "#d6ccb8", accent: "#c9a96e", heading: "#f2e8d6", muted: "#998c74" }, font: "'Lora', serif", tags: ["luxury", "warm"], image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=340&fit=crop&q=80", sampleTitle: "Penthouse Living on Fifth Avenue", sampleExcerpt: "Floor-to-ceiling windows frame panoramic skyline views in this meticulously designed 4,200 sq ft penthouse residence..." },
      { id: "re-skyline", name: "Skyline Modern", description: "Cool blues for urban developments", icon: "🏙️", preview: { bg: "#0c1018", surface: "#141a24", text: "#b8c8e0", accent: "#4d8ef7", heading: "#e0ecff", muted: "#6880a0" }, font: "'Space Grotesk', sans-serif", tags: ["modern", "urban"], image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=340&fit=crop&q=80", sampleTitle: "Urban Development: Smart Cities 2025", sampleExcerpt: "How IoT infrastructure and sustainable architecture converge to create the next generation of intelligent urban spaces..." },
      { id: "re-villa", name: "Villa Rustica", description: "Mediterranean warmth for resort properties", icon: "🏡", preview: { bg: "#18120c", surface: "#221a12", text: "#d4c0a0", accent: "#d4783c", heading: "#f0dcc4", muted: "#a08860" }, font: "'Lora', serif", tags: ["rustic", "resort"], image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=340&fit=crop&q=80", sampleTitle: "Coastal Estate with Private Cove", sampleExcerpt: "Nestled along the Mediterranean coast, this restored 18th-century villa offers 12 acres of terraced gardens and olive groves..." },
      { id: "re-penthouse", name: "Penthouse Dark", description: "Ultra-premium dark aesthetic for luxury penthouses", icon: "🌃", preview: { bg: "#080808", surface: "#121212", text: "#c0c0c0", accent: "#d4b896", heading: "#f0f0f0", muted: "#585858" }, font: "'Playfair Display', serif", tags: ["luxury", "dark"], image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=340&fit=crop&q=80", sampleTitle: "Exclusive Penthouse Collection — Park Avenue", sampleExcerpt: "Curated selections of Manhattan's most prestigious penthouse residences featuring private terraces and panoramic skyline views..." },
      { id: "re-coastal", name: "Coastal Breeze", description: "Serene ocean blues for beachfront properties", icon: "🏖️", preview: { bg: "#0a1018", surface: "#121c28", text: "#b0c8e4", accent: "#48a8d8", heading: "#e0f0ff", muted: "#5878a0" }, font: "'Inter', sans-serif", tags: ["coastal", "modern"], image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=340&fit=crop&q=80", sampleTitle: "Malibu Beachfront — Direct Ocean Access", sampleExcerpt: "Wake up to the sound of waves in this architectural masterpiece featuring floor-to-ceiling glass and infinity pool overlooking the Pacific..." },
      { id: "re-forest", name: "Forest Lodge", description: "Deep green tones for mountain and forest homes", icon: "🌲", preview: { bg: "#0a100a", surface: "#141e14", text: "#b0c8b0", accent: "#4c9c5c", heading: "#d8f0d8", muted: "#5c8060" }, font: "'Lora', serif", tags: ["nature", "mountain"], image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=340&fit=crop&q=80", sampleTitle: "Mountain Retreat — 40 Acres of Old Growth Forest", sampleExcerpt: "A hand-crafted timber lodge nestled among towering Douglas firs, offering complete privacy with modern sustainable amenities..." },
      { id: "re-gold", name: "Golden Gate", description: "San Francisco-inspired warm gold and fog tones", icon: "🌁", preview: { bg: "#100c08", surface: "#1c1610", text: "#d4c8b0", accent: "#e0a040", heading: "#f4e8d0", muted: "#988c6c" }, font: "'Space Grotesk', sans-serif", tags: ["urban", "warm"], image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=340&fit=crop&q=80", sampleTitle: "Victorian Townhome — Painted Ladies District", sampleExcerpt: "Meticulously restored 1890s Victorian featuring original crown molding, bay windows, and a modern chef's kitchen with Bay views..." },
    ],
  },
  {
    id: "science",
    title: "Science & Research",
    subtitle: "Academic and research-forward templates for scientific content",
    icon: "science",
    templates: [
      { id: "sci-lab", name: "Lab Report", description: "Clinical precision for research publications", icon: "🔬", preview: { bg: "#0e1014", surface: "#161a20", text: "#c0c8d6", accent: "#44a4ff", heading: "#e4ecfa", muted: "#7080a0" }, font: "'Space Grotesk', sans-serif", tags: ["academic", "clean"], image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=340&fit=crop&q=80", sampleTitle: "CRISPR-Cas9 Gene Editing Breakthrough", sampleExcerpt: "Novel delivery mechanisms achieve 94% efficiency in targeted gene modification, opening new frontiers in therapeutic applications..." },
      { id: "sci-cosmos", name: "Cosmos", description: "Deep space theme for astronomy and astrophysics", icon: "🌌", preview: { bg: "#060810", surface: "#0e1220", text: "#b0bcd8", accent: "#7c6cf0", heading: "#dce0ff", muted: "#5860a0" }, font: "'Space Grotesk', sans-serif", tags: ["space", "deep"], image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=340&fit=crop&q=80", sampleTitle: "New Exoplanet Discovered in Habitable Zone", sampleExcerpt: "The James Webb Space Telescope captures spectral data revealing atmospheric composition consistent with potential biosignatures..." },
      { id: "sci-bio", name: "BioGreen", description: "Natural tones for biology and life sciences", icon: "🧬", preview: { bg: "#0a100c", surface: "#121c16", text: "#b0d4bc", accent: "#34c870", heading: "#d8f4e0", muted: "#5c9870" }, font: "'Inter', sans-serif", tags: ["biology", "nature"], image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&h=340&fit=crop&q=80", sampleTitle: "Mycelium Networks and Forest Communication", sampleExcerpt: "Underground fungal networks facilitate nutrient exchange between trees, revealing a complex symbiotic communication system..." },
      { id: "sci-chem", name: "Periodic", description: "Element-inspired layout for chemistry content", icon: "⚗️", preview: { bg: "#10100a", surface: "#1a1a12", text: "#c8c8b0", accent: "#e0c040", heading: "#f0f0d8", muted: "#888870" }, font: "'JetBrains Mono', monospace", tags: ["chemistry", "data"], image: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&h=340&fit=crop&q=80", sampleTitle: "Synthesizing Novel Catalysts for Clean Energy", sampleExcerpt: "Transition metal oxide catalysts demonstrate unprecedented electrochemical efficiency in hydrogen fuel cell applications..." },
      { id: "sci-quantum", name: "Quantum Field", description: "Purple-blue quantum physics aesthetic", icon: "⚛️", preview: { bg: "#08061a", surface: "#100e28", text: "#b8b0e4", accent: "#8060f0", heading: "#e0d8ff", muted: "#5848a0" }, font: "'Space Grotesk', sans-serif", tags: ["quantum", "physics"], image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=340&fit=crop&q=80", sampleTitle: "Quantum Entanglement at Room Temperature", sampleExcerpt: "Breakthrough experiment demonstrates persistent quantum coherence in macroscopic systems, challenging decoherence theory..." },
      { id: "sci-ocean", name: "Marine Lab", description: "Deep ocean blue for marine biology", icon: "🐋", preview: { bg: "#060c14", surface: "#0c1620", text: "#a0c0dc", accent: "#2898d4", heading: "#d0e8ff", muted: "#4878a0" }, font: "'Inter', sans-serif", tags: ["marine", "ocean"], image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=340&fit=crop&q=80", sampleTitle: "Deep Sea Bioluminescence Mapping Project", sampleExcerpt: "Autonomous submersibles catalog over 3,000 new species of bioluminescent organisms in the Mariana Trench ecosystem..." },
      { id: "sci-neuro", name: "Neural Network", description: "Brain-inspired purple and pink for neuroscience", icon: "🧠", preview: { bg: "#100818", surface: "#1a1024", text: "#d0b8e8", accent: "#c850b8", heading: "#f0d8ff", muted: "#8050a0" }, font: "'Space Grotesk', sans-serif", tags: ["neuro", "brain"], image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=340&fit=crop&q=80", sampleTitle: "Mapping the Connectome: Neural Pathways Decoded", sampleExcerpt: "Advanced diffusion tensor imaging reveals previously unknown neural circuits connecting memory formation and emotional processing..." },
      { id: "sci-astro", name: "Astrophysics", description: "Dark cosmic with gold accents for astronomy", icon: "✨", preview: { bg: "#04040c", surface: "#0c0c18", text: "#a8b0c8", accent: "#d4a840", heading: "#e8ecff", muted: "#484c6c" }, font: "'Space Grotesk', sans-serif", tags: ["astronomy", "cosmic"], image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=600&h=340&fit=crop&q=80", sampleTitle: "First Direct Image of Exoplanet Atmosphere", sampleExcerpt: "Webb telescope spectroscopy reveals water vapor, carbon dioxide, and methane in a super-Earth's atmosphere 120 light-years away..." },
    ],
  },
  {
    id: "technology",
    title: "Technology",
    subtitle: "Modern templates for tech blogs, startups and product launches",
    icon: "memory",
    templates: [
      { id: "tech-neon", name: "Neon Circuit", description: "Cyberpunk-inspired with electric accents", icon: "⚡", preview: { bg: "#0a0a14", surface: "#12121e", text: "#c0c0e0", accent: "#00f0ff", heading: "#e0e0ff", muted: "#6060a0" }, font: "'JetBrains Mono', monospace", tags: ["cyber", "neon"], image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=340&fit=crop&q=80", sampleTitle: "Edge Computing Changes Everything", sampleExcerpt: "Distributed processing at the network edge reduces latency to sub-millisecond levels, enabling real-time AI inference..." },
      { id: "tech-silicon", name: "Silicon Valley", description: "Startup-clean with vibrant primary colors", icon: "🚀", preview: { bg: "#0c0e14", surface: "#141820", text: "#c0cce0", accent: "#5b8def", heading: "#e4ecff", muted: "#6878a0" }, font: "'Space Grotesk', sans-serif", tags: ["startup", "clean"], image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=340&fit=crop&q=80", sampleTitle: "Series B: Scaling Infrastructure at Speed", sampleExcerpt: "How modern startups leverage serverless architecture and microservices to scale from prototype to millions of users..." },
      { id: "tech-carbon", name: "Carbon Fiber", description: "Dark premium tech aesthetic", icon: "💎", preview: { bg: "#0c0c0c", surface: "#161616", text: "#b8b8b8", accent: "#a0a0a0", heading: "#e8e8e8", muted: "#606060" }, font: "'Inter', sans-serif", tags: ["dark", "premium"], image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=340&fit=crop&q=80", sampleTitle: "The Silent Revolution in Chip Design", sampleExcerpt: "3nm process technology and chiplet architecture are redefining what's possible in high-performance computing hardware..." },
      { id: "tech-matrix", name: "Matrix Terminal", description: "Green-on-black terminal aesthetic", icon: "💻", preview: { bg: "#000800", surface: "#001200", text: "#30d050", accent: "#50ff70", heading: "#80ff90", muted: "#208030" }, font: "'JetBrains Mono', monospace", tags: ["terminal", "retro"], image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=340&fit=crop&q=80", sampleTitle: "$ ./deploy --production --scale=auto", sampleExcerpt: "Building zero-downtime deployment pipelines with blue-green strategies and automated rollback mechanisms for critical systems..." },
      { id: "tech-rust", name: "Rust CLI", description: "Warm orange Rust-inspired terminal theme", icon: "🦀", preview: { bg: "#0c0806", surface: "#1a1210", text: "#d4b8a0", accent: "#e06020", heading: "#f0d8c0", muted: "#906040" }, font: "'JetBrains Mono', monospace", tags: ["rust", "systems"], image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&h=340&fit=crop&q=80", sampleTitle: "Memory Safety Without Garbage Collection", sampleExcerpt: "How Rust's ownership model and borrow checker guarantee thread safety at compile time, eliminating entire classes of bugs..." },
      { id: "tech-ai", name: "AI Studio", description: "Deep violet for artificial intelligence and ML", icon: "🤖", preview: { bg: "#0a0614", surface: "#140e22", text: "#c4b8e4", accent: "#9060e8", heading: "#e4d8ff", muted: "#6848a8" }, font: "'Space Grotesk', sans-serif", tags: ["ai", "ml"], image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop&q=80", sampleTitle: "Transformer Architectures Beyond Language", sampleExcerpt: "Vision transformers and multimodal models achieve state-of-the-art results across 14 benchmark tasks with unified attention..." },
      { id: "tech-cloud", name: "Cloud Native", description: "Sky blue for cloud computing and DevOps", icon: "☁️", preview: { bg: "#080e18", surface: "#101a28", text: "#b0c8e8", accent: "#38a8e8", heading: "#d8ecff", muted: "#5080a8" }, font: "'Inter', sans-serif", tags: ["cloud", "devops"], image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop&q=80", sampleTitle: "Kubernetes at Scale: 10,000 Node Clusters", sampleExcerpt: "Lessons learned from operating massive Kubernetes deployments with automated scaling, self-healing, and zero-touch operations..." },
      { id: "tech-devops", name: "Pipeline Green", description: "CI/CD pipeline green for DevOps content", icon: "🔄", preview: { bg: "#060c08", surface: "#0e1a10", text: "#a8d4b0", accent: "#30c850", heading: "#d0f4d8", muted: "#408c50" }, font: "'JetBrains Mono', monospace", tags: ["cicd", "devops"], image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=340&fit=crop&q=80", sampleTitle: "GitOps: The Future of Infrastructure", sampleExcerpt: "Declarative infrastructure management with Git as the single source of truth enables reproducible, auditable deployments..." },
    ],
  },
  {
    id: "social-media",
    title: "Social Media",
    subtitle: "Vibrant templates for creators, influencers and digital content",
    icon: "share",
    templates: [
      { id: "sm-gradient", name: "Gradient Wave", description: "Bold gradients inspired by social platforms", icon: "🌈", preview: { bg: "#14081e", surface: "#1e1028", text: "#d0c0e8", accent: "#e040a0", heading: "#f0d8ff", muted: "#8060a8" }, font: "'Inter', sans-serif", tags: ["bold", "vibrant"], image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=340&fit=crop&q=80", sampleTitle: "Going Viral: The Science of Shareability", sampleExcerpt: "Understanding the psychological triggers that make content irresistible to share across digital platforms and communities..." },
      { id: "sm-creator", name: "Creator Studio", description: "Clean and modern for content creators", icon: "🎬", preview: { bg: "#0e0e14", surface: "#181820", text: "#c4c4d8", accent: "#f04040", heading: "#eceef4", muted: "#7070a0" }, font: "'Inter', sans-serif", tags: ["creator", "modern"], image: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=600&h=340&fit=crop&q=80", sampleTitle: "Creator Economy: Monetization Guide", sampleExcerpt: "From sponsorships to digital products, a comprehensive breakdown of revenue streams available to modern content creators..." },
      { id: "sm-pastel", name: "Pastel Pop", description: "Soft pastel tones for lifestyle content", icon: "🍬", preview: { bg: "#16101a", surface: "#201824", text: "#d8c8e4", accent: "#c088e0", heading: "#f0e4ff", muted: "#9070a8" }, font: "'Lora', serif", tags: ["pastel", "lifestyle"], image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&h=340&fit=crop&q=80", sampleTitle: "Mindful Living in the Digital Age", sampleExcerpt: "Balancing screen time with intentional offline experiences — a guide to digital wellness and authentic lifestyle content..." },
      { id: "sm-story", name: "Story Mode", description: "Instagram story-inspired mobile-first design", icon: "📱", preview: { bg: "#120814", surface: "#1e101e", text: "#d8c0e0", accent: "#f04880", heading: "#f8d4ff", muted: "#9060a0" }, font: "'Inter', sans-serif", tags: ["stories", "mobile"], image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=340&fit=crop&q=80", sampleTitle: "The Science Behind Viral Stories", sampleExcerpt: "Ephemeral content drives 3x more engagement than feed posts — analyzing the psychology of FOMO-driven social consumption..." },
      { id: "sm-thread", name: "Thread View", description: "Clean threaded conversation layout", icon: "🧵", preview: { bg: "#0c0c10", surface: "#16161c", text: "#c0c0d0", accent: "#4ca8f0", heading: "#e4e4f0", muted: "#606078" }, font: "'Inter', sans-serif", tags: ["threads", "minimal"], image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=340&fit=crop&q=80", sampleTitle: "Building in Public: A Thread", sampleExcerpt: "Documenting the journey from zero to 50K followers through authentic sharing, vulnerability, and consistent value creation..." },
      { id: "sm-reel", name: "Reel Maker", description: "Short-form video creator energy", icon: "🎥", preview: { bg: "#080410", surface: "#140c1c", text: "#c8b8e0", accent: "#e844d0", heading: "#f4d4ff", muted: "#7850a0" }, font: "'Space Grotesk', sans-serif", tags: ["video", "reels"], image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=340&fit=crop&q=80", sampleTitle: "Reels Algorithm Decoded: What Actually Works", sampleExcerpt: "Data analysis of 100,000 viral reels reveals the optimal posting cadence, hook timing, and audio trends for maximum reach..." },
      { id: "sm-podcast", name: "Podcast Studio", description: "Dark cozy theme for audio content creators", icon: "🎙️", preview: { bg: "#0c0808", surface: "#181210", text: "#d4c4b8", accent: "#e08040", heading: "#f0e0d4", muted: "#8c7060" }, font: "'Lora', serif", tags: ["podcast", "audio"], image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=340&fit=crop&q=80", sampleTitle: "Long-Form Audio: The Renaissance of Depth", sampleExcerpt: "Why 3-hour podcast episodes outperform 5-minute clips in listener retention, brand loyalty, and advertiser revenue metrics..." },
    ],
  },
  {
    id: "code-space",
    title: "Code Space",
    subtitle: "Developer-focused templates for technical writing and documentation",
    icon: "code",
    templates: [
      { id: "cs-vscode", name: "VS Code Dark", description: "Familiar dark IDE aesthetic for developers", icon: "🔧", preview: { bg: "#1e1e1e", surface: "#252526", text: "#d4d4d4", accent: "#569cd6", heading: "#dcdcaa", muted: "#808080" }, font: "'JetBrains Mono', monospace", tags: ["ide", "familiar"], image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=340&fit=crop&q=80", sampleTitle: "Building a Custom Language Server", sampleExcerpt: "Step-by-step tutorial on implementing LSP for your domain-specific language with intelligent code completion and diagnostics..." },
      { id: "cs-github", name: "GitHub Dimmed", description: "GitHub's dimmed theme for documentation", icon: "🐙", preview: { bg: "#0d1117", surface: "#161b22", text: "#c9d1d9", accent: "#58a6ff", heading: "#f0f6fc", muted: "#8b949e" }, font: "'JetBrains Mono', monospace", tags: ["github", "docs"], image: "https://images.unsplash.com/photo-1647166545674-ce28ce93bdca?w=600&h=340&fit=crop&q=80", sampleTitle: "Open Source Maintainer's Handbook", sampleExcerpt: "Best practices for managing issues, reviewing PRs, and fostering a welcoming community around your open source project..." },
      { id: "cs-dracula", name: "Dracula Code", description: "Popular Dracula color scheme for code blogs", icon: "🧛", preview: { bg: "#282a36", surface: "#2d2f3d", text: "#f8f8f2", accent: "#ff79c6", heading: "#bd93f9", muted: "#6272a4" }, font: "'JetBrains Mono', monospace", tags: ["dracula", "popular"], image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=340&fit=crop&q=80", sampleTitle: "Functional Programming Patterns in TypeScript", sampleExcerpt: "Monads, functors, and algebraic data types — practical functional programming techniques for production TypeScript codebases..." },
      { id: "cs-solarized", name: "Solarized Night", description: "Warm solarized tones for readable code", icon: "🌗", preview: { bg: "#002b36", surface: "#073642", text: "#839496", accent: "#b58900", heading: "#fdf6e3", muted: "#586e75" }, font: "'JetBrains Mono', monospace", tags: ["solarized", "readable"], image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&h=340&fit=crop&q=80", sampleTitle: "Algorithms Illustrated: A Visual Guide", sampleExcerpt: "Interactive visualizations of sorting, graph traversal, and dynamic programming algorithms with complexity analysis..." },
      { id: "cs-monokai", name: "Monokai Pro", description: "Classic Monokai scheme beloved by developers", icon: "🌟", preview: { bg: "#272822", surface: "#2e2e28", text: "#f8f8f2", accent: "#f92672", heading: "#a6e22e", muted: "#75715e" }, font: "'JetBrains Mono', monospace", tags: ["monokai", "classic"], image: "https://images.unsplash.com/photo-1607799279861-4dd421887fc5?w=600&h=340&fit=crop&q=80", sampleTitle: "Design Patterns in Modern JavaScript", sampleExcerpt: "Practical implementations of Observer, Factory, and Strategy patterns using ES2024 features and real-world examples..." },
      { id: "cs-nord", name: "Nord Theme", description: "Arctic cool Nord palette for clean code blogs", icon: "❄️", preview: { bg: "#2e3440", surface: "#3b4252", text: "#d8dee9", accent: "#88c0d0", heading: "#eceff4", muted: "#4c566a" }, font: "'JetBrains Mono', monospace", tags: ["nord", "arctic"], image: "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=600&h=340&fit=crop&q=80", sampleTitle: "Building CLI Tools with Go", sampleExcerpt: "From argument parsing to interactive TUI components — a comprehensive guide to creating professional command-line applications..." },
      { id: "cs-onedark", name: "One Dark", description: "Atom One Dark inspired editor theme", icon: "🌑", preview: { bg: "#282c34", surface: "#2c313c", text: "#abb2bf", accent: "#61afef", heading: "#e5c07b", muted: "#5c6370" }, font: "'JetBrains Mono', monospace", tags: ["atom", "onedark"], image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=340&fit=crop&q=80", sampleTitle: "React Server Components Deep Dive", sampleExcerpt: "Understanding the rendering pipeline, data fetching patterns, and streaming architecture behind server-first React applications..." },
      { id: "cs-catppuccin", name: "Catppuccin Mocha", description: "Warm pastel Catppuccin colors for friendly code posts", icon: "😺", preview: { bg: "#1e1e2e", surface: "#252536", text: "#cdd6f4", accent: "#f5c2e7", heading: "#f5e0dc", muted: "#585b70" }, font: "'JetBrains Mono', monospace", tags: ["catppuccin", "pastel"], image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=340&fit=crop&q=80", sampleTitle: "Neovim from Scratch: A Complete Setup Guide", sampleExcerpt: "Building a productive Neovim configuration with LSP, treesitter, and telescope for a fully customized editing experience..." },
    ],
  },
  {
    id: "photography",
    title: "Photography",
    subtitle: "Showcase visual storytelling with image-first layouts",
    icon: "photo_camera",
    templates: [
      { id: "ph-gallery", name: "Dark Gallery", description: "Pitch-black background to let images shine", icon: "📷", preview: { bg: "#080808", surface: "#111111", text: "#c0c0c0", accent: "#ffffff", heading: "#ffffff", muted: "#555555" }, font: "'Lora', serif", tags: ["gallery", "minimal"], image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=340&fit=crop&q=80", sampleTitle: "Chasing Light: Iceland in Winter", sampleExcerpt: "Aurora borealis over glacial lagoons — a 30-day expedition capturing the ethereal beauty of the Icelandic winter landscape..." },
      { id: "ph-journal", name: "Photo Journal", description: "Warm tones for travel and documentary photography", icon: "📸", preview: { bg: "#140e08", surface: "#1e1610", text: "#d4c4a8", accent: "#d4944c", heading: "#f0e0c8", muted: "#907858" }, font: "'Lora', serif", tags: ["journal", "warm"], image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=340&fit=crop&q=80", sampleTitle: "Street Portraits of Havana", sampleExcerpt: "Candid encounters in the vibrant streets of Old Havana, where every face tells a story of resilience and cultural pride..." },
      { id: "ph-mono", name: "Monochrome", description: "B&W aesthetic for minimalist portfolio", icon: "◻️", preview: { bg: "#0c0c0c", surface: "#181818", text: "#a0a0a0", accent: "#d0d0d0", heading: "#e8e8e8", muted: "#585858" }, font: "'Inter', sans-serif", tags: ["bw", "portfolio"], image: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=600&h=340&fit=crop&q=80", sampleTitle: "Geometry in Architecture: A B&W Study", sampleExcerpt: "Minimalist compositions exploring the interplay of light, shadow, and geometric form in contemporary architecture..." },
      { id: "ph-sepia", name: "Sepia Archive", description: "Vintage sepia tones for film photography archives", icon: "📜", preview: { bg: "#12100a", surface: "#1c1810", text: "#c8b898", accent: "#b89060", heading: "#e8d8c0", muted: "#887858" }, font: "'Crimson Pro', serif", tags: ["vintage", "sepia"], image: "https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?w=600&h=340&fit=crop&q=80", sampleTitle: "The Lost Darkrooms of Brooklyn", sampleExcerpt: "Documenting the last remaining analog photo labs where silver gelatin prints are hand-processed in century-old equipment..." },
      { id: "ph-film", name: "Film Grain", description: "Analogue film look with warm grain texture", icon: "🎥", preview: { bg: "#100c08", surface: "#1a1610", text: "#d0c4a8", accent: "#c8a468", heading: "#f0e4c8", muted: "#908060" }, font: "'Lora', serif", tags: ["film", "analog"], image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&h=340&fit=crop&q=80", sampleTitle: "Kodak Portra 400: A Love Letter", sampleExcerpt: "Why this legendary color negative film stock continues to define portrait and wedding photography thirty years after its debut..." },
      { id: "ph-neon", name: "Neon Nights", description: "Electric neon for urban night photography", icon: "🌃", preview: { bg: "#080410", surface: "#100a18", text: "#c8b8e0", accent: "#e840c0", heading: "#f0d4ff", muted: "#6840a0" }, font: "'Space Grotesk', sans-serif", tags: ["neon", "urban"], image: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&h=340&fit=crop&q=80", sampleTitle: "Tokyo After Dark: Neon Reflections", sampleExcerpt: "Rain-soaked Shinjuku alleys transform into a kaleidoscope of reflected neon, creating surreal compositions at every turn..." },
      { id: "ph-nature", name: "Nature Canvas", description: "Earth greens and browns for nature photography", icon: "🌿", preview: { bg: "#0a0e08", surface: "#141c10", text: "#b8ccac", accent: "#5cac48", heading: "#d8eccc", muted: "#688054" }, font: "'Lora', serif", tags: ["nature", "earth"], image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=340&fit=crop&q=80", sampleTitle: "Macro Photography: Hidden Worlds", sampleExcerpt: "Extreme close-up photography reveals the intricate geometry of dewdrops, insect wings, and pollen structures invisible to the naked eye..." },
    ],
  },
  {
    id: "architecture",
    title: "Architecture & Design",
    subtitle: "Structural elegance for design, interiors and built environment",
    icon: "architecture",
    templates: [
      { id: "ar-brutalist", name: "Brutalist Concrete", description: "Raw concrete textures and bold geometry", icon: "🏗️", preview: { bg: "#121210", surface: "#1c1c18", text: "#b8b8a8", accent: "#c8b890", heading: "#e8e8d8", muted: "#787868" }, font: "'Space Grotesk', sans-serif", tags: ["brutalist", "raw"], image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=340&fit=crop&q=80", sampleTitle: "Brutalism Revival: Form Follows Function", sampleExcerpt: "How a new generation of architects are reinterpreting béton brut for sustainable, community-centered public buildings..." },
      { id: "ar-bauhaus", name: "Bauhaus", description: "Primary colors and geometric precision", icon: "🔺", preview: { bg: "#0e0e10", surface: "#181820", text: "#c0c0c8", accent: "#e03030", heading: "#f0f0f4", muted: "#686870" }, font: "'Space Grotesk', sans-serif", tags: ["geometric", "bold"], image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=600&h=340&fit=crop&q=80", sampleTitle: "Bauhaus at 100: Design That Endures", sampleExcerpt: "Tracing the lasting influence of the Bauhaus movement on modern product design, typography, and spatial planning..." },
      { id: "ar-interior", name: "Interior Luxe", description: "Soft warm palette for interior design showcases", icon: "🛋️", preview: { bg: "#16120e", surface: "#201a14", text: "#d0c4b0", accent: "#b8946c", heading: "#ece0cc", muted: "#90806a" }, font: "'Lora', serif", tags: ["interior", "luxury"], image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=340&fit=crop&q=80", sampleTitle: "Wabi-Sabi: The Beauty of Imperfection", sampleExcerpt: "Embracing natural materials, organic textures, and the Japanese philosophy of finding beauty in imperfection and transience..." },
      { id: "ar-glass", name: "Glass Facade", description: "Cool teal reflections for modern glass architecture", icon: "🏢", preview: { bg: "#060e14", surface: "#0e1a22", text: "#a0c4d8", accent: "#30b8d0", heading: "#d4ecf8", muted: "#4888a0" }, font: "'Space Grotesk', sans-serif", tags: ["glass", "modern"], image: "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=600&h=340&fit=crop&q=80", sampleTitle: "Curtain Wall Engineering: Light and Structure", sampleExcerpt: "How parametric modeling and advanced glazing technology enable impossible geometries in contemporary facade design..." },
      { id: "ar-concrete", name: "Raw Concrete", description: "Minimal concrete gray for structural content", icon: "🧱", preview: { bg: "#101010", surface: "#1a1a1a", text: "#b0b0b0", accent: "#909090", heading: "#d8d8d8", muted: "#606060" }, font: "'Space Grotesk', sans-serif", tags: ["concrete", "minimal"], image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=340&fit=crop&q=80", sampleTitle: "Concrete Canopies: Structural Art", sampleExcerpt: "Shell structures and folded plates demonstrate how reinforced concrete achieves sculptural beauty through engineering precision..." },
      { id: "ar-timber", name: "Timber Frame", description: "Warm wood tones for sustainable building", icon: "🪵", preview: { bg: "#100c08", surface: "#1c1610", text: "#d0c0a8", accent: "#c09050", heading: "#ecdcc4", muted: "#88744c" }, font: "'Lora', serif", tags: ["wood", "sustainable"], image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&h=340&fit=crop&q=80", sampleTitle: "Mass Timber: The Skyscraper Revolution", sampleExcerpt: "Cross-laminated timber enables 18-story wooden buildings with carbon-negative footprints, reshaping urban construction paradigms..." },
      { id: "ar-museum", name: "Museum Gallery", description: "Clean gallery aesthetic for exhibition content", icon: "🏛️", preview: { bg: "#0a0a0e", surface: "#141418", text: "#b8b8c4", accent: "#c8c0a8", heading: "#e4e4ec", muted: "#606068" }, font: "'Inter', sans-serif", tags: ["gallery", "clean"], image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&h=340&fit=crop&q=80", sampleTitle: "Exhibition Design: Curating Space and Light", sampleExcerpt: "The invisible art of museum lighting, spatial flow, and interpretive design that transforms artifacts into immersive experiences..." },
    ],
  },
  {
    id: "typography",
    title: "Typography & Editorial",
    subtitle: "Type-focused layouts celebrating the art of letters",
    icon: "text_fields",
    templates: [
      { id: "ty-broadsheet", name: "Broadsheet", description: "Classic newspaper broadsheet layout", icon: "📰", preview: { bg: "#12100e", surface: "#1c1814", text: "#c8c0b0", accent: "#a08060", heading: "#f0e8d8", muted: "#807060" }, font: "'Crimson Pro', serif", tags: ["newspaper", "classic"], image: "https://images.unsplash.com/photo-1504711434969-e33886168d9c?w=600&h=340&fit=crop&q=80", sampleTitle: "The Art of Long-Form Journalism", sampleExcerpt: "In an era of hot takes and 280 characters, long-form journalism continues to thrive as readers hunger for depth and nuance..." },
      { id: "ty-swiss", name: "Swiss Grid", description: "International typographic style inspired by Swiss design", icon: "🇨🇭", preview: { bg: "#fafafa", surface: "#f0f0f0", text: "#222222", accent: "#e03030", heading: "#000000", muted: "#666666" }, font: "'Space Grotesk', sans-serif", tags: ["swiss", "grid"], image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop&q=80", sampleTitle: "Helvetica: The World's Most Famous Font", sampleExcerpt: "From New York subway signage to Fortune 500 logos, how one typeface became the universal language of modern design..." },
      { id: "ty-literary", name: "Literary Review", description: "Elegant serif for literary essays and reviews", icon: "📖", preview: { bg: "#10100c", surface: "#1a1814", text: "#c8c4b8", accent: "#988060", heading: "#e8e4d8", muted: "#7c766a" }, font: "'Crimson Pro', serif", tags: ["literary", "elegant"], image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=340&fit=crop&q=80", sampleTitle: "On Reading in the Age of Distraction", sampleExcerpt: "A meditation on the declining art of deep reading and why physical books still matter in our hyperconnected world..." },
      { id: "ty-gothic", name: "Gothic Press", description: "Dark gothic blackletter-inspired editorial", icon: "🧛", preview: { bg: "#080608", surface: "#121014", text: "#b8b0c0", accent: "#a050a0", heading: "#e0d4e8", muted: "#584864" }, font: "'Playfair Display', serif", tags: ["gothic", "dark"], image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&h=340&fit=crop&q=80", sampleTitle: "The Art of the Macabre in Modern Literature", sampleExcerpt: "How contemporary gothic fiction subverts traditional horror tropes to explore societal anxieties and cultural transformation..." },
      { id: "ty-typewriter", name: "Typewriter", description: "Monospace typewriter nostalgia aesthetic", icon: "⌨️", preview: { bg: "#0e0c08", surface: "#181610", text: "#c4c0b0", accent: "#a09880", heading: "#e4e0d4", muted: "#787060" }, font: "'JetBrains Mono', monospace", tags: ["typewriter", "retro"], image: "https://images.unsplash.com/photo-1504691342899-4d92b50853e1?w=600&h=340&fit=crop&q=80", sampleTitle: "Letters Never Sent: A Collection", sampleExcerpt: "Epistolary fragments and unsent correspondence exploring the space between intention and expression in human communication..." },
      { id: "ty-artdeco", name: "Art Deco", description: "Gold on black Art Deco geometric style", icon: "🔶", preview: { bg: "#080808", surface: "#121210", text: "#c8c4a8", accent: "#d4a840", heading: "#f0e8c8", muted: "#706840" }, font: "'Playfair Display', serif", tags: ["artdeco", "gold"], image: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=600&h=340&fit=crop&q=80", sampleTitle: "The Roaring Twenties: Design Renaissance", sampleExcerpt: "Geometric symmetry, lavish ornamentation, and bold color: how Art Deco defined a century of visual culture and architecture..." },
      { id: "ty-magazine", name: "Magazine Spread", description: "Bold magazine editorial with large type", icon: "📰", preview: { bg: "#0a0a0e", surface: "#141418", text: "#c0c0d0", accent: "#e04040", heading: "#f0f0f8", muted: "#585860" }, font: "'Space Grotesk', sans-serif", tags: ["magazine", "bold"], image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&h=340&fit=crop&q=80", sampleTitle: "The Cover Story: Designing Impact", sampleExcerpt: "Behind the scenes of magazine cover design — from concept sketches to final press, every decision shapes public perception..." },
    ],
  },
  {
    id: "about-portfolio",
    title: "About & Portfolio",
    subtitle: "Personal brand templates for about pages and portfolio showcases",
    icon: "person",
    templates: [
      { id: "ab-personal", name: "Personal Brand", description: "Clean personal brand for professionals", icon: "👤", preview: { bg: "#0c0e14", surface: "#141820", text: "#c0c8d8", accent: "#5890e0", heading: "#e4ecff", muted: "#6878a0" }, font: "'Inter', sans-serif", tags: ["personal", "clean"], image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=340&fit=crop&q=80", sampleTitle: "About Me: Building at the Intersection", sampleExcerpt: "Software engineer, writer, and open source contributor — building tools that bridge the gap between code and creativity..." },
      { id: "ab-creative", name: "Creative Folio", description: "Bold creative portfolio with accent pops", icon: "🎨", preview: { bg: "#0e0814", surface: "#180e20", text: "#d0c0e4", accent: "#a050e0", heading: "#f0daff", muted: "#7850a0" }, font: "'Playfair Display', serif", tags: ["creative", "bold"], image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=340&fit=crop&q=80", sampleTitle: "Selected Works: 2020-2025", sampleExcerpt: "A curated collection of brand identities, editorial layouts, and interactive experiences crafted for visionary clients..." },
      { id: "ab-resume", name: "Resume Dark", description: "Professional resume-style dark layout", icon: "📋", preview: { bg: "#0e0e10", surface: "#181820", text: "#c0c0c8", accent: "#50a0d0", heading: "#e8ecf0", muted: "#6870a0" }, font: "'Space Grotesk', sans-serif", tags: ["resume", "professional"], image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=340&fit=crop&q=80", sampleTitle: "Experience & Technical Expertise", sampleExcerpt: "Full-stack developer with 8+ years of experience shipping production systems at scale across fintech and healthcare domains..." },
      { id: "ab-dev", name: "Developer Portfolio", description: "Tech-focused portfolio with terminal accents", icon: "👨‍💻", preview: { bg: "#0c0c10", surface: "#14141c", text: "#b8b8d0", accent: "#50c8a8", heading: "#e0e0f0", muted: "#585878" }, font: "'JetBrains Mono', monospace", tags: ["developer", "tech"], image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=340&fit=crop&q=80", sampleTitle: "Projects: Open Source & Production", sampleExcerpt: "From VS Code extensions to distributed systems — a showcase of projects that solve real problems at scale..." },
      { id: "ab-designer", name: "Design Folio", description: "Pink-purple tones for design portfolios", icon: "🎨", preview: { bg: "#100818", surface: "#1a1024", text: "#d0b8e4", accent: "#d060b0", heading: "#f0d4ff", muted: "#7850a0" }, font: "'Playfair Display', serif", tags: ["design", "creative"], image: "https://images.unsplash.com/photo-1561070791-36c11767b26a?w=600&h=340&fit=crop&q=80", sampleTitle: "Selected Works: Visual Identity Design", sampleExcerpt: "Brand systems, packaging, and digital experiences crafted with attention to craft, empathy, and cultural resonance..." },
      { id: "ab-writer", name: "Writer Page", description: "Clean serif layout for author bios and writing", icon: "✏️", preview: { bg: "#0e0c0a", surface: "#1a1614", text: "#c8c0b4", accent: "#a08060", heading: "#e8e0d4", muted: "#7c7264" }, font: "'Crimson Pro', serif", tags: ["writer", "author"], image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=340&fit=crop&q=80", sampleTitle: "About the Author", sampleExcerpt: "Award-winning journalist and essayist covering technology, culture, and the human stories behind innovation and change..." },
      { id: "ab-startup", name: "Startup Founder", description: "Bold modern layout for startup founders", icon: "🚀", preview: { bg: "#08080c", surface: "#121218", text: "#c0c0d4", accent: "#6080f0", heading: "#e4e4f4", muted: "#505078" }, font: "'Space Grotesk', sans-serif", tags: ["startup", "founder"], image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=340&fit=crop&q=80", sampleTitle: "Building the Future: My Journey", sampleExcerpt: "From a dorm room prototype to a Series C company — lessons in product-market fit, team building, and relentless execution..." },
    ],
  },
  {
    id: "health-wellness",
    title: "Health & Wellness",
    subtitle: "Calming templates for fitness, nutrition, mindfulness and medical content",
    icon: "spa",
    templates: [
      { id: "hw-zen", name: "Zen Garden", description: "Calm green meditation-inspired layout", icon: "🧘", preview: { bg: "#0a100c", surface: "#121c16", text: "#b0ccb8", accent: "#4ade80", heading: "#d4f0dc", muted: "#5c8868" }, font: "'Lora', serif", tags: ["zen", "calm"], image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=340&fit=crop&q=80", sampleTitle: "The Neuroscience of Meditation", sampleExcerpt: "fMRI studies reveal how 8 weeks of mindfulness practice physically restructures the prefrontal cortex and amygdala..." },
      { id: "hw-vitality", name: "Vitality", description: "Energetic coral and orange for fitness content", icon: "🏃", preview: { bg: "#120808", surface: "#1c1010", text: "#d4b8b0", accent: "#f06848", heading: "#f4d8d0", muted: "#985848" }, font: "'Space Grotesk', sans-serif", tags: ["fitness", "energy"], image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=340&fit=crop&q=80", sampleTitle: "HIIT vs Steady-State: The Science", sampleExcerpt: "Comparative metabolic analysis shows high-intensity intervals burn 40% more fat in half the time with sustained afterburn effects..." },
      { id: "hw-ocean", name: "Ocean Calm", description: "Deep soothing blue for relaxation content", icon: "🌊", preview: { bg: "#060c14", surface: "#0e1820", text: "#a8c4dc", accent: "#3898d0", heading: "#d0e4f8", muted: "#4878a0" }, font: "'Lora', serif", tags: ["calm", "water"], image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&h=340&fit=crop&q=80", sampleTitle: "Blue Mind: Water and Mental Health", sampleExcerpt: "Proximity to water bodies reduces cortisol by 20% and activates the parasympathetic nervous system for deep relaxation..." },
      { id: "hw-herb", name: "Herbal", description: "Earth green tones for natural wellness", icon: "🌿", preview: { bg: "#0c100a", surface: "#161e12", text: "#b8ccac", accent: "#68a848", heading: "#d8eccc", muted: "#608048" }, font: "'Crimson Pro', serif", tags: ["herbal", "natural"], image: "https://images.unsplash.com/photo-1515023115894-bacee0b8c48b?w=600&h=340&fit=crop&q=80", sampleTitle: "Adaptogens: Ancient Herbs, Modern Science", sampleExcerpt: "Clinical trials validate ashwagandha, rhodiola, and reishi mushroom for stress reduction, immune support, and cognitive function..." },
      { id: "hw-sunset", name: "Golden Hour", description: "Warm sunset glow for yoga and mindfulness", icon: "🌅", preview: { bg: "#14100a", surface: "#1e1812", text: "#d4c4a8", accent: "#e0a040", heading: "#f0dcc0", muted: "#988460" }, font: "'Lora', serif", tags: ["yoga", "warm"], image: "https://images.unsplash.com/photo-1506126279646-a697353d3166?w=600&h=340&fit=crop&q=80", sampleTitle: "Morning Rituals: The Golden Hour Blueprint", sampleExcerpt: "How a structured 60-minute morning practice combining breathwork, movement, and journaling transforms daily performance..." },
      { id: "hw-clinical", name: "Clinical Clean", description: "Professional blue-white for medical content", icon: "🏥", preview: { bg: "#0a0e14", surface: "#121a24", text: "#b0c0d8", accent: "#4490e0", heading: "#d8e4f8", muted: "#506888" }, font: "'Inter', sans-serif", tags: ["medical", "clean"], image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=340&fit=crop&q=80", sampleTitle: "mRNA Vaccines: A New Era in Medicine", sampleExcerpt: "How lipid nanoparticle delivery systems enabled rapid vaccine development and opened the door to personalized cancer therapeutics..." },
      { id: "hw-yoga", name: "Yoga Flow", description: "Soft purple and lavender for spiritual wellness", icon: "💜", preview: { bg: "#0e0a14", surface: "#18121e", text: "#c8b8d8", accent: "#a070c8", heading: "#e4d4f0", muted: "#705888" }, font: "'Lora', serif", tags: ["yoga", "spiritual"], image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=340&fit=crop&q=80", sampleTitle: "Pranayama: The Science of Breath", sampleExcerpt: "How controlled breathing techniques regulate the vagus nerve, lower blood pressure, and induce states of deep calm and clarity..." },
    ],
  },
  {
    id: "food-culinary",
    title: "Food & Culinary",
    subtitle: "Delicious templates for recipes, restaurant reviews and food storytelling",
    icon: "restaurant",
    templates: [
      { id: "food-fire", name: "Fire Kitchen", description: "Warm red and orange for cooking content", icon: "🔥", preview: { bg: "#120808", surface: "#1c0e0e", text: "#d4b8a8", accent: "#e05830", heading: "#f4d4c4", muted: "#984838" }, font: "'Playfair Display', serif", tags: ["cooking", "bold"], image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=340&fit=crop&q=80", sampleTitle: "Open-Flame Techniques: From Yakitori to Asado", sampleExcerpt: "Master the art of live-fire cooking with techniques from Japanese robata grills to Argentine open-pit barbecue traditions..." },
      { id: "food-farm", name: "Farm to Table", description: "Earth green organic tones for sustainable food", icon: "🥬", preview: { bg: "#0c100a", surface: "#141e10", text: "#b8c8a8", accent: "#5ca040", heading: "#d8eccc", muted: "#608048" }, font: "'Lora', serif", tags: ["organic", "farm"], image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=340&fit=crop&q=80", sampleTitle: "Regenerative Agriculture: Feeding the Future", sampleExcerpt: "How small-scale farmers use cover cropping, rotational grazing, and no-till methods to restore soil health while growing food..." },
      { id: "food-patisserie", name: "Pâtisserie", description: "Soft pink and cream for pastry and baking", icon: "🧁", preview: { bg: "#140e10", surface: "#1e1618", text: "#d4c0c4", accent: "#d07080", heading: "#f0d8dc", muted: "#906068" }, font: "'Playfair Display', serif", tags: ["pastry", "elegant"], image: "https://images.unsplash.com/photo-1486427944544-d2c246c4df6e?w=600&h=340&fit=crop&q=80", sampleTitle: "The Art of French Lamination", sampleExcerpt: "Temperature-controlled butter lamination techniques for achieving 729 flaky layers in classic puff pastry and croissant dough..." },
      { id: "food-spice", name: "Spice Market", description: "Rich warm spice-inspired earthy palette", icon: "🫚", preview: { bg: "#120c06", surface: "#1c1408", text: "#d4c098", accent: "#c87830", heading: "#f0dcc0", muted: "#907040" }, font: "'Crimson Pro', serif", tags: ["spice", "warm"], image: "https://images.unsplash.com/photo-1596040033229-a9821eec3c51?w=600&h=340&fit=crop&q=80", sampleTitle: "The Silk Road: A Spice Journey", sampleExcerpt: "Tracing the origins of cardamom, saffron, and sumac from ancient trade routes to modern kitchens around the world..." },
      { id: "food-sushi", name: "Omakase", description: "Japanese minimal dark for fine dining", icon: "🍣", preview: { bg: "#0a0a0c", surface: "#141416", text: "#b8b8c0", accent: "#c8a080", heading: "#e4e4ec", muted: "#585860" }, font: "'Inter', sans-serif", tags: ["japanese", "minimal"], image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=340&fit=crop&q=80", sampleTitle: "Omakase: The Art of Trust", sampleExcerpt: "Inside Tokyo's most exclusive sushi counters where itamae craft 20-course tasting menus using fish aged for up to 30 days..." },
      { id: "food-wine", name: "Wine Cellar", description: "Deep bordeaux tones for wine and beverage content", icon: "🍷", preview: { bg: "#100808", surface: "#1a1010", text: "#d4b8b8", accent: "#a03848", heading: "#f0d4d4", muted: "#884050" }, font: "'Playfair Display', serif", tags: ["wine", "luxury"], image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=340&fit=crop&q=80", sampleTitle: "Burgundy: Terroir and Time", sampleExcerpt: "How limestone soil, elevation, and centuries of winemaking tradition converge to produce the most coveted Pinot Noir in the world..." },
      { id: "food-street", name: "Street Food", description: "Vibrant colorful theme for street food culture", icon: "🌮", preview: { bg: "#100a08", surface: "#1a1210", text: "#d4c4a8", accent: "#e08830", heading: "#f0dcc0", muted: "#907848" }, font: "'Space Grotesk', sans-serif", tags: ["street", "vibrant"], image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=340&fit=crop&q=80", sampleTitle: "Bangkok Street Food: A Midnight Guide", sampleExcerpt: "From Chinatown's yaowarat to Ratchawat market — navigating the best late-night street vendors for pad thai, som tam, and mango sticky rice..." },
    ],
  },
  {
    id: "travel-adventure",
    title: "Travel & Adventure",
    subtitle: "Wanderlust-inspiring templates for travel stories and adventure guides",
    icon: "flight",
    templates: [
      { id: "travel-compass", name: "Compass", description: "Classic adventure-inspired warm explorer theme", icon: "🧭", preview: { bg: "#100c06", surface: "#1a1608", text: "#d4c8a8", accent: "#c89840", heading: "#f0e4c4", muted: "#908058" }, font: "'Playfair Display', serif", tags: ["adventure", "classic"], image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=340&fit=crop&q=80", sampleTitle: "The Trans-Siberian Journal", sampleExcerpt: "9,289 kilometers by rail from Moscow to Vladivostok — documenting encounters, landscapes, and stories across seven time zones..." },
      { id: "travel-nordic", name: "Nordic Trail", description: "Cool Scandinavian blues and grays", icon: "🏔️", preview: { bg: "#0c1014", surface: "#141c22", text: "#b0c4d4", accent: "#80b4d0", heading: "#d8e8f4", muted: "#5880a0" }, font: "'Space Grotesk', sans-serif", tags: ["nordic", "cool"], image: "https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=600&h=340&fit=crop&q=80", sampleTitle: "Norway's Fjord Trail: 14 Days on Foot", sampleExcerpt: "Hiking the length of Sognefjord through ancient stave church villages, glacier valleys, and some of Europe's most dramatic scenery..." },
      { id: "travel-desert", name: "Desert Safari", description: "Sandy warm tones for arid landscapes", icon: "🏜️", preview: { bg: "#14100a", surface: "#1e1810", text: "#d4c4a4", accent: "#d4983c", heading: "#f0e0c0", muted: "#988860" }, font: "'Lora', serif", tags: ["desert", "warm"], image: "https://images.unsplash.com/photo-1509023464722-18d996393e30?w=600&h=340&fit=crop&q=80", sampleTitle: "Sahara by Camel: 21 Days Across the Erg", sampleExcerpt: "Navigating by stars through sand seas and ancient oasis towns with Tuareg guides who have walked these routes for generations..." },
      { id: "travel-jungle", name: "Jungle Trek", description: "Deep green tropical for rainforest adventures", icon: "🌴", preview: { bg: "#081008", surface: "#0e1c0e", text: "#a8cca8", accent: "#40b848", heading: "#d0ecd0", muted: "#488c48" }, font: "'Inter', sans-serif", tags: ["jungle", "tropical"], image: "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600&h=340&fit=crop&q=80", sampleTitle: "Borneo Biodiversity: Into the Canopy", sampleExcerpt: "Ascending 60-meter dipterocarp trees in the heart of Danum Valley to document orangutan nesting behavior and canopy ecosystems..." },
      { id: "travel-pacific", name: "Pacific Blue", description: "Deep ocean blue for island and coastal travel", icon: "🌏", preview: { bg: "#060a14", surface: "#0e1420", text: "#a0b8d8", accent: "#2888d0", heading: "#c8e0ff", muted: "#4070a0" }, font: "'Space Grotesk', sans-serif", tags: ["ocean", "pacific"], image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&h=340&fit=crop&q=80", sampleTitle: "Island-Hopping the South Pacific", sampleExcerpt: "From Fiji's coral reefs to Samoa's volcanic beaches — a 6-week sailing journey through the world's most remote island chains..." },
      { id: "travel-city", name: "City Explorer", description: "Urban gray for city guides and architecture", icon: "🏛️", preview: { bg: "#0c0c0e", surface: "#161618", text: "#b8b8c0", accent: "#9090a8", heading: "#e0e0e8", muted: "#585860" }, font: "'Inter', sans-serif", tags: ["city", "urban"], image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=340&fit=crop&q=80", sampleTitle: "48 Hours in Lisbon: An Insider's Map", sampleExcerpt: "From Alfama's fado houses to LX Factory's creative hub — a curated itinerary covering Lisbon's best-kept cultural secrets..." },
      { id: "travel-mountain", name: "Summit", description: "Cool blue and white for mountain and alpine travel", icon: "⛰️", preview: { bg: "#0a0e14", surface: "#121a24", text: "#b0c0d8", accent: "#60a0d8", heading: "#d4e4f8", muted: "#4878a0" }, font: "'Space Grotesk', sans-serif", tags: ["mountain", "alpine"], image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=340&fit=crop&q=80", sampleTitle: "K2 Base Camp: The Hardest Trek on Earth", sampleExcerpt: "A 14-day approach through the Karakoram range to the foot of the world's most dangerous peak — logistics, terrain, and preparation..." },
    ],
  },
  {
    id: "education-learning",
    title: "Education & Learning",
    subtitle: "Structured templates for courses, tutorials, academic writing and e-learning",
    icon: "school",
    templates: [
      { id: "edu-chalk", name: "Chalkboard", description: "Dark green chalkboard nostalgia theme", icon: "📝", preview: { bg: "#0a120a", surface: "#122014", text: "#b0ccb0", accent: "#80c880", heading: "#d4f0d4", muted: "#508050" }, font: "'Crimson Pro', serif", tags: ["chalk", "classic"], image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=340&fit=crop&q=80", sampleTitle: "The Socratic Method in Modern Classrooms", sampleExcerpt: "How question-driven pedagogy develops critical thinking skills more effectively than lecture-based instruction across all age groups..." },
      { id: "edu-notebook", name: "Notebook", description: "Lined-paper inspired study notes aesthetic", icon: "📓", preview: { bg: "#0e0c08", surface: "#181610", text: "#c8c0ac", accent: "#3880c0", heading: "#e4dcc8", muted: "#787058" }, font: "'Crimson Pro', serif", tags: ["notebook", "study"], image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=340&fit=crop&q=80", sampleTitle: "Note-Taking Systems: A Comparative Study", sampleExcerpt: "Cornell, Zettelkasten, and mind-mapping methods analyzed for retention, recall, and creative synthesis across 500 students..." },
      { id: "edu-campus", name: "Campus", description: "Warm university tones for academic content", icon: "🎓", preview: { bg: "#0e0a08", surface: "#1a1410", text: "#d0c4b0", accent: "#b88040", heading: "#ece0c8", muted: "#8c7450" }, font: "'Playfair Display', serif", tags: ["university", "academic"], image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&h=340&fit=crop&q=80", sampleTitle: "The Liberal Arts Renaissance in STEM Education", sampleExcerpt: "Why leading tech companies now prioritize humanities graduates and how interdisciplinary programs produce more innovative thinkers..." },
      { id: "edu-stem", name: "STEM Lab", description: "Bright technical blue for STEM education", icon: "🔭", preview: { bg: "#080c14", surface: "#101a28", text: "#a8c0e0", accent: "#3898e8", heading: "#d0e4ff", muted: "#4878a8" }, font: "'Space Grotesk', sans-serif", tags: ["stem", "technical"], image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=340&fit=crop&q=80", sampleTitle: "Teaching Robotics to 8-Year-Olds", sampleExcerpt: "How block-based programming and sensor kits introduce computational thinking, engineering principles, and problem-solving to young learners..." },
      { id: "edu-library", name: "Library", description: "Warm book-leather tones for reading content", icon: "📚", preview: { bg: "#100c08", surface: "#1a1610", text: "#d0c4a8", accent: "#a08050", heading: "#ece0c4", muted: "#887048" }, font: "'Lora', serif", tags: ["library", "warm"], image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop&q=80", sampleTitle: "The Architecture of Public Libraries", sampleExcerpt: "How Scandinavian library design principles create open, welcoming civic spaces that serve communities worldwide..." },
      { id: "edu-digital", name: "Digital Class", description: "Modern e-learning platform aesthetic", icon: "💻", preview: { bg: "#0a0a10", surface: "#141418", text: "#c0c0d0", accent: "#5080e0", heading: "#e0e0f0", muted: "#505068" }, font: "'Inter', sans-serif", tags: ["elearning", "modern"], image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=340&fit=crop&q=80", sampleTitle: "Designing Engaging Online Courses", sampleExcerpt: "Microlearning modules with spaced repetition achieve 3x better knowledge retention than traditional 60-minute lecture formats..." },
      { id: "edu-thesis", name: "Thesis", description: "Formal academic prose for research papers", icon: "📄", preview: { bg: "#0e0e0e", surface: "#181818", text: "#c4c4c4", accent: "#7898c0", heading: "#e0e0e0", muted: "#686868" }, font: "'Crimson Pro', serif", tags: ["thesis", "formal"], image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=340&fit=crop&q=80", sampleTitle: "Methodology: Mixed-Methods Research Design", sampleExcerpt: "Combining qualitative ethnographic fieldwork with quantitative survey analysis to produce robust, triangulated findings in social science..." },
    ],
  },
  {
    id: "music-entertainment",
    title: "Music & Entertainment",
    subtitle: "Dynamic templates for music blogs, film reviews, and performance content",
    icon: "music_note",
    templates: [
      { id: "mus-vinyl", name: "Vinyl", description: "Dark retro theme for music collectors", icon: "🎵", preview: { bg: "#0c0a08", surface: "#181410", text: "#c8c0a8", accent: "#c08830", heading: "#e8dcc0", muted: "#887448" }, font: "'Crimson Pro', serif", tags: ["vinyl", "retro"], image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=340&fit=crop&q=80", sampleTitle: "The Vinyl Revival: Why Analog Endures", sampleExcerpt: "Record sales surpass CDs for the first time since 1987 as listeners rediscover the warmth, ritual, and artwork of physical media..." },
      { id: "mus-concert", name: "Concert", description: "Electric neon stage lighting aesthetic", icon: "🎤", preview: { bg: "#0a0418", surface: "#140c24", text: "#c8b0e8", accent: "#c040e0", heading: "#f0d0ff", muted: "#704898" }, font: "'Space Grotesk', sans-serif", tags: ["concert", "neon"], image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=340&fit=crop&q=80", sampleTitle: "Stadium Sound: Engineering the Perfect Show", sampleExcerpt: "Line array physics, delay towers, and acoustic modeling — how audio engineers create immersive concert experiences for 80,000 people..." },
      { id: "mus-studio", name: "Recording Studio", description: "Dark warm wood tones for music production", icon: "🎧", preview: { bg: "#0e0a06", surface: "#1a1408", text: "#d0c0a0", accent: "#b89050", heading: "#ecdcc0", muted: "#887440" }, font: "'Lora', serif", tags: ["studio", "production"], image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=340&fit=crop&q=80", sampleTitle: "Analog Warmth in the Digital Age", sampleExcerpt: "Why top producers still route through Neve consoles and SSL compressors when plugins can emulate every harmonic characteristic..." },
      { id: "mus-edm", name: "EDM", description: "Electric neon blue and pink for electronic music", icon: "🎛️", preview: { bg: "#06041c", surface: "#0e0a28", text: "#b8a8f0", accent: "#4030ff", heading: "#d8c8ff", muted: "#5040a8" }, font: "'Inter', sans-serif", tags: ["edm", "electronic"], image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=340&fit=crop&q=80", sampleTitle: "Sound Design: Building Synths from Scratch", sampleExcerpt: "Oscillator stacking, FM synthesis, and granular processing — techniques for creating unique textures in electronic music production..." },
      { id: "mus-jazz", name: "Jazz Club", description: "Warm amber and dark for jazz culture", icon: "🎷", preview: { bg: "#0c0806", surface: "#181008", text: "#d4c4a4", accent: "#d09840", heading: "#f0e0c0", muted: "#908050" }, font: "'Playfair Display', serif", tags: ["jazz", "warm"], image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=340&fit=crop&q=80", sampleTitle: "Blue Note Records: A Design Legacy", sampleExcerpt: "How Reid Miles' minimalist cover designs for Blue Note became as iconic as the music within, defining mid-century graphic design..." },
      { id: "mus-cinema", name: "Cinema", description: "Dark theater red for film and movie reviews", icon: "🎬", preview: { bg: "#0c0606", surface: "#180e0e", text: "#d4b8b8", accent: "#c03030", heading: "#f0d4d4", muted: "#884040" }, font: "'Playfair Display', serif", tags: ["cinema", "film"], image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop&q=80", sampleTitle: "The Art of the Long Take", sampleExcerpt: "From Hitchcock's Rope to Iñárritu's Birdman — how unbroken single-take sequences create tension, intimacy, and cinematic magic..." },
      { id: "mus-streaming", name: "Streaming", description: "Modern dark green for streaming platform aesthetics", icon: "🎶", preview: { bg: "#060c08", surface: "#0e1a10", text: "#a8d0b8", accent: "#1db954", heading: "#d0f0d8", muted: "#408c58" }, font: "'Inter', sans-serif", tags: ["streaming", "modern"], image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=600&h=340&fit=crop&q=80", sampleTitle: "Algorithmic Curation: How Playlists Shape Taste", sampleExcerpt: "Recommendation engines analyze 4 billion daily streams to surface music that matches not just genre preferences but emotional states..." },
    ],
  },
  {
    id: "fashion-lifestyle",
    title: "Fashion & Lifestyle",
    subtitle: "Trendsetting templates for fashion, beauty, and lifestyle storytelling",
    icon: "styler",
    templates: [
      { id: "fash-runway", name: "Runway", description: "Sleek editorial for haute couture and fashion week coverage", icon: "👗", preview: { bg: "#0e080c", surface: "#1a1018", text: "#d4c0d0", accent: "#f472b6", heading: "#f4dce8", muted: "#906878" }, font: "'Poppins', sans-serif", tags: ["fashion", "editorial"], image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=340&fit=crop&q=80", sampleTitle: "Paris Fashion Week: The Rise of Quiet Luxury", sampleExcerpt: "Understated elegance dominates the Spring 2025 collections as designers embrace minimalist silhouettes and neutral palettes..." },
      { id: "fash-vogue", name: "Vogue Noir", description: "High-contrast monochrome for luxury fashion editorials", icon: "🖤", preview: { bg: "#080808", surface: "#121212", text: "#c8c8c8", accent: "#f0f0f0", heading: "#ffffff", muted: "#585858" }, font: "'Poppins', sans-serif", tags: ["luxury", "monochrome"], image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=340&fit=crop&q=80", sampleTitle: "The New Black: Monochrome Dressing Decoded", sampleExcerpt: "Exploring why all-black ensembles remain fashion's most powerful statement across cultures and centuries of style evolution..." },
      { id: "fash-beauty", name: "Beauty Edit", description: "Soft rose and gold for beauty and skincare content", icon: "💄", preview: { bg: "#120a0c", surface: "#1c1216", text: "#d8c4cc", accent: "#e88ca0", heading: "#f4dce4", muted: "#986878" }, font: "'Poppins', sans-serif", tags: ["beauty", "skincare"], image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=340&fit=crop&q=80", sampleTitle: "Clean Beauty: Science Meets Sustainability", sampleExcerpt: "How formulation chemists are revolutionizing skincare with bioactive ingredients that are both effective and environmentally responsible..." },
      { id: "fash-streetwear", name: "Streetwear", description: "Bold urban style for street fashion and sneaker culture", icon: "👟", preview: { bg: "#0a0a0c", surface: "#14141a", text: "#c0c0d0", accent: "#e84040", heading: "#f0f0f8", muted: "#5858680" }, font: "'Poppins', sans-serif", tags: ["street", "urban"], image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=340&fit=crop&q=80", sampleTitle: "Sneaker Culture: From Courts to Runways", sampleExcerpt: "How athletic footwear became fashion's most lucrative crossover market, driving billion-dollar collaborations and resale economies..." },
      { id: "fash-minimalist", name: "Capsule", description: "Clean minimal aesthetic for capsule wardrobe content", icon: "✂️", preview: { bg: "#0c0c0a", surface: "#18181c", text: "#c4c4bc", accent: "#a0a098", heading: "#e8e8e0", muted: "#606058" }, font: "'Poppins', sans-serif", tags: ["minimal", "capsule"], image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=340&fit=crop&q=80", sampleTitle: "The 30-Piece Capsule Wardrobe Guide", sampleExcerpt: "Curating a versatile, sustainable closet that creates 100+ outfits from 30 carefully chosen timeless pieces..." },
      { id: "fash-lifestyle", name: "Lifestyle Luxe", description: "Warm lifestyle aesthetic for wellness and living content", icon: "🏠", preview: { bg: "#10100a", surface: "#1c1a12", text: "#d0c8b4", accent: "#c8a068", heading: "#ece4cc", muted: "#887c58" }, font: "'Poppins', sans-serif", tags: ["lifestyle", "warm"], image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&h=340&fit=crop&q=80", sampleTitle: "Slow Living: A Modern Manifesto", sampleExcerpt: "Embracing intentional consumption, analog rituals, and seasonal rhythms in a world optimized for speed and convenience..." },
      { id: "fash-jewelry", name: "Atelier", description: "Gold and deep tones for jewelry and accessories", icon: "💍", preview: { bg: "#0c0a06", surface: "#181408", text: "#d4c8a8", accent: "#d4a030", heading: "#f0e4c0", muted: "#907c40" }, font: "'Poppins', sans-serif", tags: ["jewelry", "luxury"], image: "https://images.unsplash.com/photo-1515562141589-67f0d0890a4b?w=600&h=340&fit=crop&q=80", sampleTitle: "The Art of Goldsmithing: Ancient Craft, Modern Design", sampleExcerpt: "Inside the ateliers where master jewelers combine centuries-old hand techniques with 3D-printed precision for bespoke creations..." },
    ],
  },
  {
    id: "gaming-esports",
    title: "Gaming & Esports",
    subtitle: "High-energy templates for game reviews, esports coverage, and streaming content",
    icon: "sports_esports",
    templates: [
      { id: "game-neon", name: "Neon Arena", description: "Vibrant purple neon for esports tournament coverage", icon: "🎮", preview: { bg: "#08061a", surface: "#100c28", text: "#c8b8f0", accent: "#a855f7", heading: "#e4d4ff", muted: "#5c48a0" }, font: "'Orbitron', sans-serif", tags: ["esports", "neon"], image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=340&fit=crop&q=80", sampleTitle: "Worlds 2025: The Grand Finals Preview", sampleExcerpt: "Breaking down the meta shifts, team strategies, and player performances heading into the biggest esports event of the year..." },
      { id: "game-retro", name: "Pixel Retro", description: "8-bit inspired layout for retro gaming nostalgia", icon: "👾", preview: { bg: "#0c0a10", surface: "#161420", text: "#c0b8d0", accent: "#50e830", heading: "#e0d8f0", muted: "#5c5878" }, font: "'Orbitron', sans-serif", tags: ["retro", "pixel"], image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=340&fit=crop&q=80", sampleTitle: "The Golden Age of Arcade Gaming", sampleExcerpt: "How Pac-Man, Space Invaders, and Donkey Kong defined an era of gaming that continues to influence modern game design philosophy..." },
      { id: "game-rpg", name: "Fantasy Quest", description: "Dark fantasy tones for RPG and adventure game content", icon: "⚔️", preview: { bg: "#0a0c08", surface: "#141a10", text: "#b8c8a8", accent: "#80c040", heading: "#d8eccc", muted: "#588040" }, font: "'Orbitron', sans-serif", tags: ["rpg", "fantasy"], image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=340&fit=crop&q=80", sampleTitle: "Open World Design: Crafting Living Universes", sampleExcerpt: "How studios create believable 200-hour RPG worlds with dynamic weather, NPC schedules, and emergent storytelling systems..." },
      { id: "game-fps", name: "Crosshair", description: "High-contrast tactical theme for FPS game coverage", icon: "🎯", preview: { bg: "#0a0a0a", surface: "#141414", text: "#b8b8b8", accent: "#e04040", heading: "#e8e8e8", muted: "#585858" }, font: "'Orbitron', sans-serif", tags: ["fps", "tactical"], image: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=600&h=340&fit=crop&q=80", sampleTitle: "Aim Training: The Science of Precision", sampleExcerpt: "How professional FPS players train reaction time, crosshair placement, and spatial awareness to achieve peak competitive performance..." },
      { id: "game-stream", name: "Live Stream", description: "Stream overlay-inspired layout for content creators", icon: "📺", preview: { bg: "#060810", surface: "#0c1020", text: "#a8b8d8", accent: "#6441a5", heading: "#d4e0ff", muted: "#4860a0" }, font: "'Orbitron', sans-serif", tags: ["streaming", "live"], image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=600&h=340&fit=crop&q=80", sampleTitle: "Building a Streaming Brand from Zero", sampleExcerpt: "Equipment, software, branding, and community management — the complete guide to launching a successful game streaming career..." },
      { id: "game-mobile", name: "Touch Play", description: "Bright accessible theme for mobile gaming content", icon: "📱", preview: { bg: "#0c0810", surface: "#14101c", text: "#c8c0d8", accent: "#4090f0", heading: "#e4daf0", muted: "#585078" }, font: "'Orbitron', sans-serif", tags: ["mobile", "casual"], image: "https://images.unsplash.com/photo-1556438064-2d7646166914?w=600&h=340&fit=crop&q=80", sampleTitle: "Mobile Gaming: The $100 Billion Market", sampleExcerpt: "How free-to-play mechanics, hyper-casual design, and 5G connectivity are reshaping the largest segment of the gaming industry..." },
      { id: "game-indie", name: "Indie Dev", description: "Warm creative theme for indie game development stories", icon: "🕹️", preview: { bg: "#0e0c06", surface: "#1a1808", text: "#d0c8a0", accent: "#e0a030", heading: "#f0e4c0", muted: "#887840" }, font: "'Orbitron', sans-serif", tags: ["indie", "development"], image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=340&fit=crop&q=80", sampleTitle: "Solo Dev Diary: From Prototype to Steam Launch", sampleExcerpt: "A 2-year journey of building a puzzle platformer alone — balancing creative vision, technical constraints, and marketing realities..." },
    ],
  },
  {
    id: "automotive",
    title: "Automotive",
    subtitle: "Performance-driven templates for car reviews, motorsport, and automotive culture",
    icon: "directions_car",
    templates: [
      { id: "auto-speed", name: "Speedline", description: "Bold red for motorsport and performance car content", icon: "🏎️", preview: { bg: "#0c0606", surface: "#180e0e", text: "#d4b8b8", accent: "#ef4444", heading: "#f4d4d4", muted: "#884040" }, font: "'Rajdhani', sans-serif", tags: ["speed", "racing"], image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=340&fit=crop&q=80", sampleTitle: "Formula 1: Engineering at the Limit", sampleExcerpt: "How aerodynamic innovations and hybrid power units push the boundaries of what's physically possible on a racing circuit..." },
      { id: "auto-classic", name: "Classic Motor", description: "Warm vintage tones for classic car enthusiasts", icon: "🚗", preview: { bg: "#100c06", surface: "#1a1408", text: "#d4c4a0", accent: "#c89040", heading: "#f0dcc0", muted: "#907850" }, font: "'Rajdhani', sans-serif", tags: ["classic", "vintage"], image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600&h=340&fit=crop&q=80", sampleTitle: "Barn Find: A 1967 Shelby GT500 Story", sampleExcerpt: "Discovering a forgotten American muscle car icon under decades of dust — the restoration journey from rust to concours condition..." },
      { id: "auto-ev", name: "Electric Drive", description: "Clean tech blue-green for EV and electric mobility", icon: "⚡", preview: { bg: "#060c0e", surface: "#0e1a1c", text: "#a8c8d0", accent: "#20c8a0", heading: "#d0f0e8", muted: "#408880" }, font: "'Rajdhani', sans-serif", tags: ["electric", "ev"], image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=340&fit=crop&q=80", sampleTitle: "Solid-State Batteries: The EV Game Changer", sampleExcerpt: "How next-generation battery technology promises 500-mile range, 10-minute charging, and a revolution in electric vehicle adoption..." },
      { id: "auto-luxury", name: "Grand Tourer", description: "Dark luxury aesthetic for premium automotive content", icon: "🏁", preview: { bg: "#080808", surface: "#121214", text: "#c0c0c8", accent: "#b8a080", heading: "#e8e8f0", muted: "#585858" }, font: "'Rajdhani', sans-serif", tags: ["luxury", "premium"], image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=340&fit=crop&q=80", sampleTitle: "Rolls-Royce Spectre: Silent Grandeur", sampleExcerpt: "The world's most luxurious electric car redefines opulence with bespoke commissioning, starlight headliners, and whisper-quiet propulsion..." },
      { id: "auto-offroad", name: "Trail Blazer", description: "Earthy tones for off-road and overlanding adventures", icon: "🏔️", preview: { bg: "#0e0c08", surface: "#1a1610", text: "#c8c0a8", accent: "#a0883c", heading: "#e4dcc4", muted: "#787050" }, font: "'Rajdhani', sans-serif", tags: ["offroad", "adventure"], image: "https://images.unsplash.com/photo-1519572260347-584e0b275011?w=600&h=340&fit=crop&q=80", sampleTitle: "Overlanding the Pan-American Highway", sampleExcerpt: "30,000 kilometers from Alaska to Patagonia in a modified Land Cruiser — logistics, border crossings, and unforgettable landscapes..." },
      { id: "auto-moto", name: "Two Wheels", description: "Dynamic theme for motorcycle and biking content", icon: "🏍️", preview: { bg: "#0c0808", surface: "#181010", text: "#d0b8b0", accent: "#d06030", heading: "#f0d4cc", muted: "#884838" }, font: "'Rajdhani', sans-serif", tags: ["motorcycle", "riding"], image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&h=340&fit=crop&q=80", sampleTitle: "MotoGP Tech: Lean Angle Physics Explained", sampleExcerpt: "How riders achieve 64-degree lean angles at 300km/h — the engineering marvel of modern racing motorcycle tyre compounds and chassis geometry..." },
      { id: "auto-garage", name: "Garage Build", description: "Workshop aesthetic for DIY mechanics and builds", icon: "🔧", preview: { bg: "#0c0c0a", surface: "#18181a", text: "#b8b8b0", accent: "#8898a0", heading: "#d8d8d0", muted: "#585858" }, font: "'Rajdhani', sans-serif", tags: ["diy", "workshop"], image: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=340&fit=crop&q=80", sampleTitle: "Engine Swap Guide: LS3 into a Miata", sampleExcerpt: "Complete step-by-step documentation of fitting a 430hp V8 into Mazda's iconic roadster — fabrication, wiring, and dyno tuning results..." },
    ],
  },
  {
    id: "sports-fitness",
    title: "Sports & Fitness",
    subtitle: "High-performance templates for athletic training, sports analysis, and wellness",
    icon: "fitness_center",
    templates: [
      { id: "sport-arena", name: "Arena", description: "Bold blue for stadium sports and match analysis", icon: "🏟️", preview: { bg: "#060a14", surface: "#0e1420", text: "#a8b8d8", accent: "#06b6d4", heading: "#d0e4ff", muted: "#4070a0" }, font: "'Barlow', sans-serif", tags: ["stadium", "analysis"], image: "https://images.unsplash.com/photo-1461896836934-bd45ba8c5e78?w=600&h=340&fit=crop&q=80", sampleTitle: "Champions League: Tactical Masterclass", sampleExcerpt: "xG models and pressing intensity data reveal the tactical innovations defining elite European football this season..." },
      { id: "sport-gym", name: "Iron Temple", description: "Dark steel tones for strength training and bodybuilding", icon: "🏋️", preview: { bg: "#0a0a0c", surface: "#141416", text: "#b8b8c0", accent: "#9090a8", heading: "#e0e0e8", muted: "#505058" }, font: "'Barlow', sans-serif", tags: ["gym", "strength"], image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=340&fit=crop&q=80", sampleTitle: "Progressive Overload: The Only Rule That Matters", sampleExcerpt: "Why systematic load increase remains the single most important variable for hypertrophy, backed by decades of sports science..." },
      { id: "sport-run", name: "Pace Maker", description: "Energetic gradient for running and endurance sports", icon: "🏃", preview: { bg: "#0a0c08", surface: "#141c10", text: "#b0c8a8", accent: "#40c860", heading: "#d4ecd0", muted: "#508448" }, font: "'Barlow', sans-serif", tags: ["running", "endurance"], image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=340&fit=crop&q=80", sampleTitle: "Sub-2 Hour Marathon: Breaking Human Limits", sampleExcerpt: "Biomechanics, nutrition periodization, and altitude training — the science behind the most audacious goal in distance running..." },
      { id: "sport-swim", name: "Lane Line", description: "Cool aquatic blue for swimming and water sports", icon: "🏊", preview: { bg: "#060a14", surface: "#0c1420", text: "#a0b8d8", accent: "#38a0d8", heading: "#c8e0f8", muted: "#4878a0" }, font: "'Barlow', sans-serif", tags: ["swimming", "aquatic"], image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=340&fit=crop&q=80", sampleTitle: "Olympic Swimming: Stroke Efficiency Analysis", sampleExcerpt: "High-speed underwater cameras reveal how elite swimmers minimize drag and maximize propulsion through micro-adjustments in technique..." },
      { id: "sport-yoga", name: "Flow State", description: "Soft warm tones for yoga and mobility training", icon: "🧘", preview: { bg: "#100c08", surface: "#1a1610", text: "#d0c4b0", accent: "#c8a060", heading: "#ece0c8", muted: "#887c50" }, font: "'Barlow', sans-serif", tags: ["yoga", "mobility"], image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&h=340&fit=crop&q=80", sampleTitle: "Mobility Training: The Missing Piece", sampleExcerpt: "Why joint mobility work prevents 70% of common gym injuries and why every strength athlete should dedicate 20 minutes daily to it..." },
      { id: "sport-martial", name: "Dojo", description: "Dark disciplined theme for martial arts content", icon: "🥋", preview: { bg: "#0a0808", surface: "#161010", text: "#c8b8b0", accent: "#c05040", heading: "#e8d8d0", muted: "#784840" }, font: "'Barlow', sans-serif", tags: ["martial", "discipline"], image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&h=340&fit=crop&q=80", sampleTitle: "Brazilian Jiu-Jitsu: The Gentle Art", sampleExcerpt: "How leverage-based grappling techniques allow smaller practitioners to overcome size advantages through technical precision and timing..." },
      { id: "sport-outdoor", name: "Summit Trail", description: "Earth tones for hiking, climbing, and outdoor adventures", icon: "⛰️", preview: { bg: "#0c0e08", surface: "#141c10", text: "#b8c8a8", accent: "#6ca040", heading: "#d8ecc8", muted: "#588044" }, font: "'Barlow', sans-serif", tags: ["outdoor", "hiking"], image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=340&fit=crop&q=80", sampleTitle: "Ultralight Backpacking: Sub-5kg Base Weight", sampleExcerpt: "Gear selection, pack philosophy, and trail-tested strategies for carrying everything you need in a pack that weighs less than a laptop..." },
    ],
  },
  {
    id: "environment-nature",
    title: "Environment & Nature",
    subtitle: "Eco-conscious templates for environmental science, conservation, and sustainability",
    icon: "eco",
    templates: [
      { id: "env-forest", name: "Old Growth", description: "Deep forest green for ecology and conservation", icon: "🌲", preview: { bg: "#060c06", surface: "#0e1a0e", text: "#a8c8a8", accent: "#22c55e", heading: "#d0ecd0", muted: "#408840" }, font: "'Libre Baskerville', serif", tags: ["forest", "ecology"], image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=340&fit=crop&q=80", sampleTitle: "Old Growth Forests: Earth's Carbon Vaults", sampleExcerpt: "Ancient trees store 30% more carbon than young plantations — why protecting primary forests is our most effective climate strategy..." },
      { id: "env-ocean", name: "Deep Blue", description: "Ocean depths for marine conservation content", icon: "🐠", preview: { bg: "#040810", surface: "#0c1420", text: "#a0b8d8", accent: "#2090c8", heading: "#c8e0ff", muted: "#4070a0" }, font: "'Libre Baskerville', serif", tags: ["ocean", "marine"], image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&h=340&fit=crop&q=80", sampleTitle: "Coral Reef Restoration: A Race Against Time", sampleExcerpt: "Marine biologists deploy 3D-printed reef structures and heat-resistant coral strains to combat bleaching across the Great Barrier Reef..." },
      { id: "env-climate", name: "Carbon Zero", description: "Clean modern theme for climate science and policy", icon: "🌡️", preview: { bg: "#0a0c10", surface: "#121820", text: "#b0c0d0", accent: "#4898d0", heading: "#d4e4f0", muted: "#507898" }, font: "'Libre Baskerville', serif", tags: ["climate", "policy"], image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=600&h=340&fit=crop&q=80", sampleTitle: "Net Zero by 2050: The Global Scorecard", sampleExcerpt: "Tracking national decarbonization pledges against actual emissions data reveals both progress and critical gaps in climate action..." },
      { id: "env-wildlife", name: "Safari", description: "Warm earth tones for wildlife photography and conservation", icon: "🦁", preview: { bg: "#100c06", surface: "#1c1608", text: "#d0c4a0", accent: "#c89840", heading: "#f0dcc0", muted: "#907848" }, font: "'Libre Baskerville', serif", tags: ["wildlife", "safari"], image: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&h=340&fit=crop&q=80", sampleTitle: "The Return of the Wolves: Yellowstone's Trophic Cascade", sampleExcerpt: "How reintroducing apex predators transformed an entire ecosystem — from elk behavior to riverbank vegetation and songbird populations..." },
      { id: "env-renewable", name: "Solar Wind", description: "Bright clean theme for renewable energy content", icon: "☀️", preview: { bg: "#0a0c06", surface: "#141c0e", text: "#b0c8a4", accent: "#60b840", heading: "#d4ecc4", muted: "#508038" }, font: "'Libre Baskerville', serif", tags: ["renewable", "energy"], image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=340&fit=crop&q=80", sampleTitle: "Perovskite Solar Cells: 40% Efficiency Milestone", sampleExcerpt: "Next-generation photovoltaic materials achieve record efficiency in tandem cell configurations, promising cheaper solar energy at scale..." },
      { id: "env-garden", name: "Permaculture", description: "Earthy warm green for gardening and sustainable food", icon: "🌻", preview: { bg: "#0c0e08", surface: "#161e10", text: "#b8c8a8", accent: "#78a840", heading: "#d8ecc8", muted: "#588040" }, font: "'Libre Baskerville', serif", tags: ["garden", "permaculture"], image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=340&fit=crop&q=80", sampleTitle: "Food Forest Design: 7-Layer Polyculture", sampleExcerpt: "Creating self-sustaining edible ecosystems that produce food year-round while building soil health and supporting biodiversity..." },
      { id: "env-arctic", name: "Polar Report", description: "Cool ice blues for polar and glaciology research", icon: "🧊", preview: { bg: "#060a14", surface: "#0e1420", text: "#a8c0e0", accent: "#60b0e0", heading: "#d0e4ff", muted: "#4880a8" }, font: "'Libre Baskerville', serif", tags: ["arctic", "polar"], image: "https://images.unsplash.com/photo-1517783999520-f068d7431d60?w=600&h=340&fit=crop&q=80", sampleTitle: "Arctic Ice Loss: Satellite Data 2015-2025", sampleExcerpt: "A decade of CryoSat-2 measurements reveals accelerating ice sheet thinning in Greenland, with implications for global sea level projections..." },
    ],
  },
  {
    id: "history-heritage",
    title: "History & Heritage",
    subtitle: "Rich templates for historical narratives, archives, and cultural heritage",
    icon: "history_edu",
    templates: [
      { id: "hist-parchment", name: "Parchment Chronicle", description: "Aged warm tones for historical storytelling", icon: "📜", preview: { bg: "#141008", surface: "#1e1a10", text: "#d4c8a0", accent: "#d4a048", heading: "#f0e0c0", muted: "#988860" }, font: "'Crimson Pro', serif", tags: ["archive", "warm"], image: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=600&h=340&fit=crop&q=80", sampleTitle: "The Silk Road: Empires Connected by Trade", sampleExcerpt: "Ancient trade routes spanning 4,000 miles facilitated not just commerce but the exchange of ideas, religion, and technology across civilizations..." },
      { id: "hist-bronze", name: "Bronze Age", description: "Deep bronze palette for archaeological content", icon: "🏺", preview: { bg: "#120e06", surface: "#1c1608", text: "#d0c0a0", accent: "#c08030", heading: "#ecdcc0", muted: "#907040" }, font: "'Crimson Pro', serif", tags: ["ancient", "archaeology"], image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&h=340&fit=crop&q=80", sampleTitle: "Lost Cities Beneath the Sand", sampleExcerpt: "LiDAR technology reveals sprawling urban complexes hidden under centuries of jungle growth, rewriting the history of ancient civilizations..." },
      { id: "hist-empire", name: "Empire Ink", description: "Dark formal style for political history", icon: "👑", preview: { bg: "#0a0810", surface: "#141018", text: "#c0b8d0", accent: "#9878c0", heading: "#e4dcf0", muted: "#685890" }, font: "'Crimson Pro', serif", tags: ["empire", "political"], image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=340&fit=crop&q=80", sampleTitle: "The Fall of Rome: Lessons for Modern Empires", sampleExcerpt: "Examining the economic, military, and institutional factors that led to the collapse of the greatest empire in antiquity..." },
      { id: "hist-wartime", name: "Wartime Dispatch", description: "Muted tones for military history narratives", icon: "⚔️", preview: { bg: "#0e0e0a", surface: "#181812", text: "#c0c0a8", accent: "#88a868", heading: "#e0e0d0", muted: "#707058" }, font: "'Crimson Pro', serif", tags: ["military", "wartime"], image: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600&h=340&fit=crop&q=80", sampleTitle: "Codebreakers of Bletchley Park", sampleExcerpt: "How a secret team of mathematicians and linguists cracked the Enigma cipher and shortened World War II by an estimated two years..." },
      { id: "hist-renais", name: "Renaissance", description: "Elegant gold and cream for cultural history", icon: "🎨", preview: { bg: "#100c06", surface: "#1a1408", text: "#d0c4a0", accent: "#c8a050", heading: "#f0e4c8", muted: "#907840" }, font: "'Crimson Pro', serif", tags: ["renaissance", "cultural"], image: "https://images.unsplash.com/photo-1544413660-299165566b1d?w=600&h=340&fit=crop&q=80", sampleTitle: "Florence and the Birth of Modern Art", sampleExcerpt: "The Medici family patronage created an unprecedented flowering of art, architecture, and philosophy that defined Western civilization..." },
      { id: "hist-maritime", name: "Maritime Log", description: "Ocean blues for naval and exploration history", icon: "⚓", preview: { bg: "#080c14", surface: "#101820", text: "#a8bcd4", accent: "#4090c0", heading: "#d0e0f8", muted: "#4c7098" }, font: "'Crimson Pro', serif", tags: ["maritime", "exploration"], image: "https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=600&h=340&fit=crop&q=80", sampleTitle: "Magellan's Voyage: Circumnavigating the Globe", sampleExcerpt: "The perilous three-year expedition that proved the Earth's circumference and forever changed European understanding of geography..." },
      { id: "hist-revolution", name: "Revolution Red", description: "Bold red accents for revolutionary movements", icon: "✊", preview: { bg: "#100808", surface: "#1a1010", text: "#d0b8b8", accent: "#c84040", heading: "#f0d8d8", muted: "#905858" }, font: "'Crimson Pro', serif", tags: ["revolution", "social"], image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=340&fit=crop&q=80", sampleTitle: "1789: When Paris Changed the World", sampleExcerpt: "The French Revolution dismantled centuries of absolute monarchy and established the principles of liberty, equality, and fraternity..." },
    ],
  },
  {
    id: "psychology-mind",
    title: "Psychology & Mind",
    subtitle: "Thoughtful templates for mental health, behavioral science, and cognitive research",
    icon: "psychology",
    templates: [
      { id: "psy-perception", name: "Perception", description: "Deep purple for cognitive psychology and perception studies", icon: "🧠", preview: { bg: "#0c0814", surface: "#16101e", text: "#c8b8e0", accent: "#b060e0", heading: "#e8d8ff", muted: "#7848a0" }, font: "'Source Serif 4', serif", tags: ["cognitive", "perception"], image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop&q=80", sampleTitle: "The Illusion of Free Will: A Neuroscience Perspective", sampleExcerpt: "Brain imaging studies suggest decisions are made milliseconds before conscious awareness, challenging our understanding of volition..." },
      { id: "psy-dream", name: "Dreamscape", description: "Soft ethereal tones for dream research and subconscious", icon: "💭", preview: { bg: "#080810", surface: "#10101c", text: "#b8b8d8", accent: "#8870c0", heading: "#d8d8f4", muted: "#585880" }, font: "'Source Serif 4', serif", tags: ["dreams", "subconscious"], image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=340&fit=crop&q=80", sampleTitle: "Lucid Dreaming: Exploring Consciousness at Night", sampleExcerpt: "Researchers develop techniques for inducing awareness during REM sleep, opening new possibilities for therapy and creativity..." },
      { id: "psy-behavior", name: "Behavioral", description: "Clean modern theme for behavioral analysis", icon: "📊", preview: { bg: "#0a0c10", surface: "#141820", text: "#b0c0d4", accent: "#5098d0", heading: "#d4e4f4", muted: "#507090" }, font: "'Source Serif 4', serif", tags: ["behavioral", "analysis"], image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=340&fit=crop&q=80", sampleTitle: "Nudge Theory in Public Health Policy", sampleExcerpt: "Subtle environmental design choices increase vaccination rates by 23% without mandates, demonstrating behavioral economics in action..." },
      { id: "psy-therapy", name: "Mindful Space", description: "Calming teal for therapy and mental wellness content", icon: "🧘", preview: { bg: "#080e0e", surface: "#101a1a", text: "#a8c8c8", accent: "#40b0a0", heading: "#d0f0e8", muted: "#488880" }, font: "'Source Serif 4', serif", tags: ["therapy", "mindfulness"], image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=340&fit=crop&q=80", sampleTitle: "CBT in the Digital Age: App-Based Therapy", sampleExcerpt: "Clinical trials show AI-guided cognitive behavioral therapy apps achieve outcomes comparable to traditional face-to-face sessions..." },
      { id: "psy-social", name: "Social Mind", description: "Warm tones for social psychology", icon: "👥", preview: { bg: "#100c0a", surface: "#1a1612", text: "#d0c4b4", accent: "#d08848", heading: "#f0e0d0", muted: "#906838" }, font: "'Source Serif 4', serif", tags: ["social", "group"], image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=340&fit=crop&q=80", sampleTitle: "The Bystander Effect Revisited", sampleExcerpt: "New experiments challenge Kitty Genovese assumptions, finding that bystanders intervene in 90% of real-world emergencies captured on camera..." },
      { id: "psy-child", name: "Development", description: "Soft pastels for developmental psychology", icon: "🌱", preview: { bg: "#0a0c08", surface: "#141c10", text: "#b4c8a8", accent: "#60a848", heading: "#d8ecc8", muted: "#508040" }, font: "'Source Serif 4', serif", tags: ["development", "growth"], image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=340&fit=crop&q=80", sampleTitle: "Screen Time and Childhood Brain Development", sampleExcerpt: "Longitudinal study of 10,000 children reveals nuanced relationship between digital media exposure and cognitive milestones..." },
      { id: "psy-neuro", name: "Neuropsych", description: "Clinical dark theme for neuropsychology research", icon: "⚡", preview: { bg: "#080a10", surface: "#101420", text: "#a8b8d4", accent: "#4888d0", heading: "#d0e0f8", muted: "#3c6898" }, font: "'Source Serif 4', serif", tags: ["neuro", "clinical"], image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=340&fit=crop&q=80", sampleTitle: "Neuroplasticity After Stroke: Recovery Breakthroughs", sampleExcerpt: "Brain-computer interfaces accelerate neural rewiring in stroke patients, restoring motor function within weeks instead of months..." },
    ],
  },
  {
    id: "ai-machine-learning",
    title: "AI & Machine Learning",
    subtitle: "Cutting-edge templates for artificial intelligence and deep learning content",
    icon: "smart_toy",
    templates: [
      { id: "ai-neural", name: "Neural Net", description: "Blue circuit aesthetic for deep learning content", icon: "🤖", preview: { bg: "#060c18", surface: "#0e1828", text: "#a0b8e0", accent: "#38bdf8", heading: "#d0e4ff", muted: "#406898" }, font: "'Space Grotesk', sans-serif", tags: ["neural", "deep-learning"], image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop&q=80", sampleTitle: "GPT-5 Architecture: Trillion-Parameter Models", sampleExcerpt: "The next generation of language models introduces sparse mixture-of-experts routing, achieving 10x efficiency gains at inference time..." },
      { id: "ai-vision", name: "Computer Vision", description: "Clean analytical theme for vision AI research", icon: "👁️", preview: { bg: "#0a0a12", surface: "#14141e", text: "#b8b8d4", accent: "#6880e0", heading: "#e0e0f8", muted: "#484890" }, font: "'Space Grotesk', sans-serif", tags: ["vision", "imaging"], image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&h=340&fit=crop&q=80", sampleTitle: "Real-Time Object Detection at 120fps", sampleExcerpt: "Lightweight transformer architectures enable production-grade computer vision on edge devices with sub-10ms latency..." },
      { id: "ai-generative", name: "Generative", description: "Creative gradient theme for generative AI", icon: "✨", preview: { bg: "#0c0610", surface: "#180e1c", text: "#c8b0e0", accent: "#c060e0", heading: "#ecd8ff", muted: "#7040a0" }, font: "'Space Grotesk', sans-serif", tags: ["generative", "creative"], image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=340&fit=crop&q=80", sampleTitle: "Diffusion Models: From Noise to Photorealism", sampleExcerpt: "Text-to-image systems now generate 8K photorealistic outputs in under 3 seconds, disrupting creative industries worldwide..." },
      { id: "ai-robotics", name: "Robotics Lab", description: "Industrial theme for robotics and automation", icon: "🦾", preview: { bg: "#0a0c0e", surface: "#141a1e", text: "#b0c0c8", accent: "#50a8c0", heading: "#d4e8f0", muted: "#487888" }, font: "'Space Grotesk', sans-serif", tags: ["robotics", "automation"], image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=340&fit=crop&q=80", sampleTitle: "Humanoid Robots Enter the Workforce", sampleExcerpt: "Boston Dynamics and Tesla deploy bipedal robots in warehouse operations, achieving 85% of human manipulation dexterity..." },
      { id: "ai-nlp", name: "Language AI", description: "Text-focused theme for NLP and language models", icon: "💬", preview: { bg: "#080c14", surface: "#101820", text: "#a8bcd8", accent: "#4898e0", heading: "#d0e4ff", muted: "#407098" }, font: "'Space Grotesk', sans-serif", tags: ["nlp", "language"], image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=340&fit=crop&q=80", sampleTitle: "Multilingual AI: 100 Languages, One Model", sampleExcerpt: "Cross-lingual transfer learning enables zero-shot translation between language pairs never seen during training..." },
      { id: "ai-ethics", name: "AI Ethics", description: "Balanced warm theme for AI safety and alignment", icon: "⚖️", preview: { bg: "#0e0c08", surface: "#1a1810", text: "#c8c0a8", accent: "#c8a048", heading: "#f0e4c8", muted: "#887840" }, font: "'Space Grotesk', sans-serif", tags: ["ethics", "safety"], image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop&q=80", sampleTitle: "AI Alignment: Preventing Catastrophic Outcomes", sampleExcerpt: "Constitutional AI and RLHF techniques show promise in aligning large language models with human values and safety constraints..." },
      { id: "ai-data", name: "Data Pipeline", description: "Terminal-style theme for MLOps and data engineering", icon: "📊", preview: { bg: "#060a08", surface: "#0e1810", text: "#a0c0a8", accent: "#40c070", heading: "#d0f0d8", muted: "#408058" }, font: "'JetBrains Mono', monospace", tags: ["mlops", "data"], image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=340&fit=crop&q=80", sampleTitle: "Real-Time Feature Stores for ML Pipelines", sampleExcerpt: "Event-driven architectures serve fresh features to production models with sub-millisecond latency across distributed systems..." },
    ],
  },
  {
    id: "blockchain-crypto",
    title: "Blockchain & Crypto",
    subtitle: "Bold templates for cryptocurrency, DeFi, and Web3 content",
    icon: "currency_bitcoin",
    templates: [
      { id: "crypto-ledger", name: "Digital Ledger", description: "Gold and black for Bitcoin and blockchain analysis", icon: "₿", preview: { bg: "#0c0a04", surface: "#181408", text: "#d0c4a0", accent: "#f59e0b", heading: "#f4e4c0", muted: "#907840" }, font: "'Rajdhani', sans-serif", tags: ["bitcoin", "ledger"], image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=340&fit=crop&q=80", sampleTitle: "Bitcoin Halving 2025: Market Impact Analysis", sampleExcerpt: "Historical data from previous halvings suggests a 12-18 month rally cycle, but institutional adoption may amplify or dampen effects..." },
      { id: "crypto-defi", name: "DeFi Protocol", description: "Neon green terminal for DeFi and smart contracts", icon: "🏦", preview: { bg: "#060a06", surface: "#0e180e", text: "#a0c8a0", accent: "#40d060", heading: "#d0f0d0", muted: "#408040" }, font: "'Rajdhani', sans-serif", tags: ["defi", "protocol"], image: "https://images.unsplash.com/photo-1642104704074-907c0698b98d?w=600&h=340&fit=crop&q=80", sampleTitle: "Automated Market Makers: DEX Revolution", sampleExcerpt: "Concentrated liquidity pools and dynamic fee structures push decentralized exchanges past $100B in monthly trading volume..." },
      { id: "crypto-nft", name: "NFT Gallery", description: "Vibrant creative theme for NFT and digital art", icon: "🖼️", preview: { bg: "#0c0610", surface: "#180e1c", text: "#c8b0d8", accent: "#c060d0", heading: "#ecd8f0", muted: "#7040a0" }, font: "'Rajdhani', sans-serif", tags: ["nft", "digital-art"], image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=340&fit=crop&q=80", sampleTitle: "Generative Art on the Blockchain", sampleExcerpt: "Artists use on-chain algorithms to create unique visual compositions, with each mint producing a mathematically distinct artwork..." },
      { id: "crypto-eth", name: "Ethereum", description: "Blue-violet theme for Ethereum ecosystem content", icon: "💎", preview: { bg: "#06081a", surface: "#0e1028", text: "#a8b0e4", accent: "#6070f0", heading: "#d0d8ff", muted: "#4048a0" }, font: "'Rajdhani', sans-serif", tags: ["ethereum", "smart-contracts"], image: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=600&h=340&fit=crop&q=80", sampleTitle: "Ethereum L2 Scaling: The Rollup Wars", sampleExcerpt: "Optimistic and ZK rollups compete to become the dominant Layer 2 solution, processing millions of transactions at fraction of mainnet cost..." },
      { id: "crypto-web3", name: "Web3 Frontier", description: "Dark theme with warm accents for Web3 innovation", icon: "🌐", preview: { bg: "#0c0808", surface: "#181010", text: "#d0c0b8", accent: "#e07040", heading: "#f0dcd4", muted: "#905040" }, font: "'Rajdhani', sans-serif", tags: ["web3", "decentralized"], image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&h=340&fit=crop&q=80", sampleTitle: "Decentralized Identity: Your Keys, Your Data", sampleExcerpt: "Self-sovereign identity protocols let users control their digital credentials without relying on centralized authorities..." },
      { id: "crypto-mining", name: "Mining Rig", description: "Industrial green-black for crypto mining content", icon: "⛏️", preview: { bg: "#060806", surface: "#0e140e", text: "#a8c0a8", accent: "#58a858", heading: "#d0e8d0", muted: "#407040" }, font: "'JetBrains Mono', monospace", tags: ["mining", "hardware"], image: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=600&h=340&fit=crop&q=80", sampleTitle: "Proof of Stake vs Proof of Work: Energy Debate", sampleExcerpt: "Ethereum's transition to PoS reduced energy consumption by 99.95%, but Bitcoin miners argue PoW provides unmatched security..." },
      { id: "crypto-dao", name: "DAO Governance", description: "Structured theme for governance and DAO content", icon: "🏛️", preview: { bg: "#0a0810", surface: "#141018", text: "#b8b0d0", accent: "#8868c8", heading: "#dcd4f0", muted: "#584890" }, font: "'Rajdhani', sans-serif", tags: ["dao", "governance"], image: "https://images.unsplash.com/photo-1553729459-uj68rn8e8f5?w=600&h=340&fit=crop&q=80", sampleTitle: "DAOs Manage $25 Billion in Treasury Assets", sampleExcerpt: "Decentralized autonomous organizations evolve governance mechanisms, implementing quadratic voting and conviction-based proposals..." },
    ],
  },
  {
    id: "politics-society",
    title: "Politics & Society",
    subtitle: "Authoritative templates for political analysis, policy, and social commentary",
    icon: "gavel",
    templates: [
      { id: "pol-capitol", name: "Capitol Report", description: "Classic red-blue for political reporting", icon: "🏛️", preview: { bg: "#0c0808", surface: "#181010", text: "#d0c0c0", accent: "#dc2626", heading: "#f0d8d8", muted: "#905050" }, font: "'IBM Plex Serif', serif", tags: ["politics", "reporting"], image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=340&fit=crop&q=80", sampleTitle: "Election 2026: Key Senate Races to Watch", sampleExcerpt: "Analysts identify 12 battleground states where shifting demographics and policy priorities could flip control of the upper chamber..." },
      { id: "pol-policy", name: "Policy Brief", description: "Clean professional theme for policy analysis", icon: "📋", preview: { bg: "#0a0c10", surface: "#141820", text: "#b0c0d4", accent: "#4080c8", heading: "#d4e0f4", muted: "#406890" }, font: "'IBM Plex Serif', serif", tags: ["policy", "analysis"], image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&h=340&fit=crop&q=80", sampleTitle: "Universal Basic Income: Policy Trade-offs", sampleExcerpt: "Economic modeling shows UBI could reduce poverty by 45% while increasing labor participation among low-income demographics..." },
      { id: "pol-global", name: "Global Dispatch", description: "International affairs with dark earth tones", icon: "🌍", preview: { bg: "#0a0a08", surface: "#141412", text: "#c0c0b0", accent: "#88a860", heading: "#e0e0d4", muted: "#607048" }, font: "'IBM Plex Serif', serif", tags: ["international", "geopolitics"], image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop&q=80", sampleTitle: "The New Cold War: Techno-Nationalism Rising", sampleExcerpt: "Semiconductor export controls and AI regulation create a technological iron curtain between competing geopolitical blocs..." },
      { id: "pol-justice", name: "Justice", description: "Balanced theme for legal and judicial content", icon: "⚖️", preview: { bg: "#08080c", surface: "#121218", text: "#b8b8c8", accent: "#7878b0", heading: "#dcdce8", muted: "#505068" }, font: "'IBM Plex Serif', serif", tags: ["legal", "justice"], image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=340&fit=crop&q=80", sampleTitle: "Supreme Court Term: Landmark Decisions Ahead", sampleExcerpt: "This term's docket includes pivotal cases on digital privacy, executive power, and the regulatory authority of federal agencies..." },
      { id: "pol-economics", name: "Econ Lens", description: "Data-driven theme for economic policy", icon: "📈", preview: { bg: "#080c0a", surface: "#101810", text: "#b0c4b0", accent: "#50a870", heading: "#d4e8d8", muted: "#408058" }, font: "'IBM Plex Serif', serif", tags: ["economics", "data"], image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=340&fit=crop&q=80", sampleTitle: "Inflation vs Growth: Central Bank Dilemma", sampleExcerpt: "Federal Reserve balances aggressive rate hikes against recession risk as core inflation stubbornly exceeds the 2% target..." },
      { id: "pol-activism", name: "Voices", description: "Bold theme for social movements and activism", icon: "✊", preview: { bg: "#0e0808", surface: "#1a1010", text: "#d0b8b8", accent: "#e04848", heading: "#f0d4d4", muted: "#904040" }, font: "'IBM Plex Serif', serif", tags: ["activism", "social"], image: "https://images.unsplash.com/photo-1591848478625-de43268e6fb8?w=600&h=340&fit=crop&q=80", sampleTitle: "Digital Activism: Hashtags to Legislation", sampleExcerpt: "Social media campaigns achieve measurable policy outcomes as online organizing translates into voter mobilization and legislative lobbying..." },
      { id: "pol-media", name: "Press Room", description: "Newsroom aesthetic for media analysis", icon: "📰", preview: { bg: "#0c0c0e", surface: "#161618", text: "#c0c0c8", accent: "#8890b0", heading: "#e0e0e8", muted: "#585868" }, font: "'IBM Plex Serif', serif", tags: ["media", "press"], image: "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=600&h=340&fit=crop&q=80", sampleTitle: "Deepfakes and the Erosion of Trust in Media", sampleExcerpt: "As AI-generated video becomes indistinguishable from reality, news organizations adopt blockchain verification for content authenticity..." },
    ],
  },
  {
    id: "personal-development",
    title: "Personal Development",
    subtitle: "Inspiring templates for self-improvement, productivity, and growth mindset",
    icon: "emoji_objects",
    templates: [
      { id: "pd-growth", name: "Growth Mindset", description: "Teal-forward theme for self-improvement content", icon: "🌱", preview: { bg: "#080e0e", surface: "#101a1a", text: "#a8c8c8", accent: "#14b8a6", heading: "#d0f0e8", muted: "#488880" }, font: "'Nunito Sans', sans-serif", tags: ["growth", "mindset"], image: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&h=340&fit=crop&q=80", sampleTitle: "Atomic Habits: Systems Over Goals", sampleExcerpt: "The 1% improvement principle demonstrates how tiny daily changes compound into extraordinary transformations over 12 months..." },
      { id: "pd-focus", name: "Deep Focus", description: "Minimal dark theme for productivity content", icon: "🎯", preview: { bg: "#0a0a0c", surface: "#141416", text: "#c0c0c8", accent: "#6080c0", heading: "#e0e0e8", muted: "#4c4c70" }, font: "'Nunito Sans', sans-serif", tags: ["focus", "productivity"], image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=340&fit=crop&q=80", sampleTitle: "Deep Work in a Distracted World", sampleExcerpt: "Cal Newport's research shows that 4 hours of focused work produces more output than 8 hours of fragmented attention..." },
      { id: "pd-journal", name: "Daily Journal", description: "Warm cream for journaling and reflection", icon: "📓", preview: { bg: "#0e0c08", surface: "#1a1810", text: "#d0c4a8", accent: "#c8a050", heading: "#f0e0c0", muted: "#907840" }, font: "'Nunito Sans', sans-serif", tags: ["journal", "reflection"], image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=340&fit=crop&q=80", sampleTitle: "Morning Pages: 30 Days of Clarity", sampleExcerpt: "The practice of writing three stream-of-consciousness pages every morning reduces anxiety and unlocks creative problem-solving..." },
      { id: "pd-leader", name: "Leadership", description: "Professional theme for leadership and management", icon: "🏆", preview: { bg: "#0a0810", surface: "#141018", text: "#b8b0d0", accent: "#8070c0", heading: "#dcd4f0", muted: "#584890" }, font: "'Nunito Sans', sans-serif", tags: ["leadership", "management"], image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=340&fit=crop&q=80", sampleTitle: "Servant Leadership in Remote Teams", sampleExcerpt: "Companies adopting servant leadership models report 34% higher employee satisfaction and 28% lower turnover in distributed workforces..." },
      { id: "pd-finance", name: "Money Mind", description: "Green finance theme for personal wealth content", icon: "💰", preview: { bg: "#060c08", surface: "#0e1810", text: "#a0c4a8", accent: "#40a858", heading: "#d0ecd4", muted: "#408050" }, font: "'Nunito Sans', sans-serif", tags: ["finance", "wealth"], image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600&h=340&fit=crop&q=80", sampleTitle: "The FIRE Movement: Financial Independence by 40", sampleExcerpt: "Extreme savers achieve 70% savings rates through geographic arbitrage, index investing, and intentional minimalist lifestyles..." },
      { id: "pd-wellness", name: "Balance", description: "Serene theme for work-life balance content", icon: "⚖️", preview: { bg: "#0a0c0a", surface: "#141c14", text: "#b0c8b0", accent: "#58a868", heading: "#d4ecd4", muted: "#408050" }, font: "'Nunito Sans', sans-serif", tags: ["balance", "wellness"], image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=340&fit=crop&q=80", sampleTitle: "The 4-Day Work Week: Evidence and Outcomes", sampleExcerpt: "Companies participating in the world's largest trial report 23% revenue growth while working 32-hour weeks with no pay reduction..." },
      { id: "pd-story", name: "Origin Story", description: "Narrative theme for personal stories and memoirs", icon: "📖", preview: { bg: "#0c0a08", surface: "#181410", text: "#d0c8b8", accent: "#b89060", heading: "#f0e4d4", muted: "#886840" }, font: "'Nunito Sans', sans-serif", tags: ["memoir", "storytelling"], image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=340&fit=crop&q=80", sampleTitle: "From Dropout to CEO: An Unconventional Path", sampleExcerpt: "How failing out of college at 19 became the catalyst for building a $50M company by embracing experimentation over credentials..." },
    ],
  },
  {
    id: "diy-crafts",
    title: "DIY & Crafts",
    subtitle: "Hands-on templates for maker projects, tutorials, and creative hobbies",
    icon: "handyman",
    templates: [
      { id: "diy-workshop", name: "Workshop", description: "Warm wood tones for woodworking and maker content", icon: "🔨", preview: { bg: "#100c06", surface: "#1c1608", text: "#d0c0a0", accent: "#ea580c", heading: "#f0dcc0", muted: "#906838" }, font: "'Merriweather', serif", tags: ["workshop", "woodworking"], image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&h=340&fit=crop&q=80", sampleTitle: "Build a Mid-Century Modern Desk: Full Plans", sampleExcerpt: "Step-by-step guide to crafting a walnut and steel desk using only hand tools and basic joinery techniques..." },
      { id: "diy-textile", name: "Textile Studio", description: "Soft colorful theme for sewing and textile arts", icon: "🧵", preview: { bg: "#0e0810", surface: "#18101a", text: "#c8b8d0", accent: "#c060a0", heading: "#ecd4e8", muted: "#784880" }, font: "'Merriweather', serif", tags: ["textile", "sewing"], image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=340&fit=crop&q=80", sampleTitle: "Zero-Waste Pattern Cutting Techniques", sampleExcerpt: "Traditional Japanese Mottainai principles inspire a new approach to garment construction that eliminates fabric waste entirely..." },
      { id: "diy-garden", name: "Garden Shed", description: "Green earthy theme for gardening projects", icon: "🌿", preview: { bg: "#080c06", surface: "#101c0e", text: "#a8c4a0", accent: "#58a840", heading: "#d4ecc0", muted: "#488038" }, font: "'Merriweather', serif", tags: ["garden", "outdoor"], image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=340&fit=crop&q=80", sampleTitle: "Raised Bed Vegetable Garden: Complete Guide", sampleExcerpt: "Transform any backyard into a productive food garden with this modular raised bed system using reclaimed lumber and organic soil mix..." },
      { id: "diy-electronics", name: "Circuit Board", description: "Tech-craft theme for electronics and Arduino projects", icon: "💡", preview: { bg: "#060a0a", surface: "#0e1818", text: "#a0c0c0", accent: "#40b0a0", heading: "#d0e8e4", muted: "#408878" }, font: "'JetBrains Mono', monospace", tags: ["electronics", "arduino"], image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=340&fit=crop&q=80", sampleTitle: "Build a Weather Station with Raspberry Pi", sampleExcerpt: "Complete tutorial for a solar-powered weather monitoring system with real-time data dashboard and historical analysis..." },
      { id: "diy-pottery", name: "Clay Studio", description: "Earthy warm tones for ceramics and pottery", icon: "🏺", preview: { bg: "#100a06", surface: "#1c1408", text: "#d0c0a4", accent: "#c88840", heading: "#f0dcc4", muted: "#906838" }, font: "'Merriweather', serif", tags: ["pottery", "ceramics"], image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=340&fit=crop&q=80", sampleTitle: "Throwing Your First Bowl on the Wheel", sampleExcerpt: "Master the fundamental technique of centering clay and pulling walls to create your first functional pottery piece..." },
      { id: "diy-paper", name: "Paper Craft", description: "Clean white-accented theme for paper arts", icon: "✂️", preview: { bg: "#0a0a0c", surface: "#141416", text: "#c0c0c8", accent: "#9090b8", heading: "#e0e0ea", muted: "#585868" }, font: "'Merriweather', serif", tags: ["paper", "origami"], image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=340&fit=crop&q=80", sampleTitle: "Bookbinding Basics: Coptic Stitch Method", sampleExcerpt: "Learn the ancient art of Coptic binding to create beautiful hand-stitched journals, sketchbooks, and photo albums..." },
      { id: "diy-upcycle", name: "Upcycle Lab", description: "Eco-inspired theme for repurposing and upcycling", icon: "♻️", preview: { bg: "#080a06", surface: "#10180e", text: "#a8c0a0", accent: "#60a840", heading: "#d4e8c8", muted: "#488038" }, font: "'Merriweather', serif", tags: ["upcycle", "eco"], image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=340&fit=crop&q=80", sampleTitle: "Furniture From Pallets: 10 Weekend Projects", sampleExcerpt: "Reclaimed pallet wood becomes coffee tables, bookshelves, and bed frames with these beginner-friendly DIY plans and techniques..." },
    ],
  },
  {
    id: "pets-animals",
    title: "Pets & Animals",
    subtitle: "Friendly templates for pet care, animal behavior, and veterinary science",
    icon: "pets",
    templates: [
      { id: "pet-companion", name: "Companion", description: "Warm friendly theme for pet care and lifestyle", icon: "🐕", preview: { bg: "#0c0e06", surface: "#161e0e", text: "#b8c8a0", accent: "#84cc16", heading: "#d8ecc4", muted: "#588038" }, font: "'Poppins', sans-serif", tags: ["pets", "care"], image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=340&fit=crop&q=80", sampleTitle: "Canine Nutrition: Raw vs Commercial Diets", sampleExcerpt: "Veterinary nutritionists weigh in on the raw food debate, analyzing bioavailability and safety of fresh vs processed dog foods..." },
      { id: "pet-wild", name: "Wild Kingdom", description: "Deep nature tones for wildlife and zoology", icon: "🦅", preview: { bg: "#080a06", surface: "#101c0e", text: "#a8c0a0", accent: "#4ca858", heading: "#d0e8c8", muted: "#408048" }, font: "'Poppins', sans-serif", tags: ["wildlife", "zoology"], image: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&h=340&fit=crop&q=80", sampleTitle: "Whale Migration: 10,000-Mile Journeys", sampleExcerpt: "Satellite tracking reveals how humpback whales navigate featureless ocean using Earth's magnetic field and celestial cues..." },
      { id: "pet-vet", name: "Vet Notes", description: "Clinical theme for veterinary and animal health", icon: "🩺", preview: { bg: "#0a0c10", surface: "#141820", text: "#b0c0d4", accent: "#4898c0", heading: "#d4e4f4", muted: "#407090" }, font: "'Poppins', sans-serif", tags: ["veterinary", "health"], image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&h=340&fit=crop&q=80", sampleTitle: "Feline Dental Disease: Prevention Guide", sampleExcerpt: "80% of cats over age 3 have periodontal disease — a comprehensive guide to home dental care and professional treatment options..." },
      { id: "pet-aquatic", name: "Aquarium", description: "Deep blue-green for aquatic and marine pets", icon: "🐠", preview: { bg: "#060c10", surface: "#0e1820", text: "#a0c0d8", accent: "#38a8c8", heading: "#d0e8f8", muted: "#407898" }, font: "'Poppins', sans-serif", tags: ["aquarium", "fish"], image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&h=340&fit=crop&q=80", sampleTitle: "Planted Aquarium: The Walstad Method", sampleExcerpt: "Create a self-sustaining underwater ecosystem using dirted tanks, low-tech plants, and natural biological filtration..." },
      { id: "pet-equine", name: "Equestrian", description: "Rich warm tones for horse care and riding", icon: "🐴", preview: { bg: "#100c06", surface: "#1c1408", text: "#d0c4a0", accent: "#b88040", heading: "#f0dcc0", muted: "#886038" }, font: "'Poppins', sans-serif", tags: ["equestrian", "horses"], image: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600&h=340&fit=crop&q=80", sampleTitle: "Dressage Training: From Walk to Passage", sampleExcerpt: "A systematic approach to developing collection, impulsion, and self-carriage through classical training principles..." },
      { id: "pet-bird", name: "Aviary", description: "Bright nature theme for bird keeping and ornithology", icon: "🦜", preview: { bg: "#080c08", surface: "#101c10", text: "#a8c8a8", accent: "#48b848", heading: "#d0ecd0", muted: "#408048" }, font: "'Poppins', sans-serif", tags: ["birds", "aviary"], image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&h=340&fit=crop&q=80", sampleTitle: "Parrot Intelligence: Problem-Solving Masters", sampleExcerpt: "African Greys demonstrate cognitive abilities rivaling great apes, understanding abstract concepts like zero and probability..." },
      { id: "pet-rescue", name: "Rescue Stories", description: "Heartfelt theme for animal rescue and adoption", icon: "❤️", preview: { bg: "#0e0808", surface: "#1a1010", text: "#d0b8b8", accent: "#e05858", heading: "#f0d4d4", muted: "#904848" }, font: "'Poppins', sans-serif", tags: ["rescue", "adoption"], image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=340&fit=crop&q=80", sampleTitle: "From Shelter to Home: Adoption Success Stories", sampleExcerpt: "Twelve families share their experiences adopting senior dogs, proving that older pets make the most grateful companions..." },
    ],
  },
  {
    id: "space-astronomy",
    title: "Space & Astronomy",
    subtitle: "Cosmic templates for space exploration, stargazing, and planetary science",
    icon: "rocket_launch",
    templates: [
      { id: "space-nebula", name: "Nebula", description: "Deep cosmic purples for galactic content", icon: "🌌", preview: { bg: "#04041a", surface: "#0c0c28", text: "#b0b0e8", accent: "#818cf8", heading: "#d8d8ff", muted: "#4848a0" }, font: "'Orbitron', sans-serif", tags: ["nebula", "cosmic"], image: "https://images.unsplash.com/photo-1462332420958-a33f540d6b5d?w=600&h=340&fit=crop&q=80", sampleTitle: "Pillars of Creation: Webb's New View", sampleExcerpt: "JWST infrared imaging penetrates dust columns to reveal thousands of newborn stars still embedded in their natal gas clouds..." },
      { id: "space-mars", name: "Mars Colony", description: "Red desert theme for Mars exploration content", icon: "🔴", preview: { bg: "#100806", surface: "#1c100a", text: "#d0c0b0", accent: "#d06030", heading: "#f0dcd0", muted: "#904830" }, font: "'Orbitron', sans-serif", tags: ["mars", "colonization"], image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&h=340&fit=crop&q=80", sampleTitle: "Terraforming Mars: A Century-Long Blueprint", sampleExcerpt: "Engineers outline a phased approach to creating a breathable atmosphere using orbital mirrors, genetically modified algae, and asteroid impacts..." },
      { id: "space-station", name: "Space Station", description: "Clean tech theme for orbital and ISS content", icon: "🛸", preview: { bg: "#06080e", surface: "#0e1018", text: "#a8b0c8", accent: "#5888c0", heading: "#d0d8ec", muted: "#3c5888" }, font: "'Orbitron', sans-serif", tags: ["station", "orbital"], image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=340&fit=crop&q=80", sampleTitle: "Life on the ISS: 24 Years of Continuous Habitation", sampleExcerpt: "From growing lettuce in microgravity to 3D-printing tools, the International Space Station has transformed our approach to long-duration spaceflight..." },
      { id: "space-telescope", name: "Observatory", description: "Dark sky theme for telescopes and stargazing", icon: "🔭", preview: { bg: "#040610", surface: "#0a0e1c", text: "#a0b0d0", accent: "#6098d8", heading: "#d0e0ff", muted: "#385890" }, font: "'Orbitron', sans-serif", tags: ["telescope", "observation"], image: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=600&h=340&fit=crop&q=80", sampleTitle: "Extremely Large Telescope: First Light 2027", sampleExcerpt: "The world's largest optical telescope will directly image Earth-like exoplanets and study the atmospheres of worlds orbiting nearby stars..." },
      { id: "space-rocket", name: "Launch Pad", description: "Bold theme for rocket science and launches", icon: "🚀", preview: { bg: "#0a0808", surface: "#181010", text: "#d0c0c0", accent: "#e04840", heading: "#f0d8d8", muted: "#904848" }, font: "'Orbitron', sans-serif", tags: ["rocket", "launch"], image: "https://images.unsplash.com/photo-1517976384346-3136801d605d?w=600&h=340&fit=crop&q=80", sampleTitle: "Starship: The Fully Reusable Super Heavy Rocket", sampleExcerpt: "SpaceX's Starship promises to reduce launch costs to $10/kg, enabling lunar bases, Mars missions, and point-to-point Earth travel..." },
      { id: "space-solar", name: "Solar System", description: "Warm gold theme for planetary science", icon: "☀️", preview: { bg: "#0c0a06", surface: "#181408", text: "#d0c4a0", accent: "#d8a030", heading: "#f0e0c0", muted: "#907830" }, font: "'Orbitron', sans-serif", tags: ["planets", "solar-system"], image: "https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?w=600&h=340&fit=crop&q=80", sampleTitle: "Ocean Worlds: Europa, Enceladus, and Titan", sampleExcerpt: "Subsurface oceans on Jupiter and Saturn's moons may harbor conditions for life, with hydrothermal vents providing chemical energy..." },
      { id: "space-dark", name: "Dark Matter", description: "Ultra-dark theme for cosmology and dark energy research", icon: "🌑", preview: { bg: "#020208", surface: "#080810", text: "#9898b8", accent: "#5858a0", heading: "#c8c8e0", muted: "#383870" }, font: "'Orbitron', sans-serif", tags: ["cosmology", "dark-matter"], image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=340&fit=crop&q=80", sampleTitle: "Dark Energy: The Universe's Biggest Mystery", sampleExcerpt: "Accounting for 68% of the universe's energy, dark energy drives accelerating expansion — yet its fundamental nature remains unknown..." },
    ],
  },
  {
    id: "philosophy-ideas",
    title: "Philosophy & Ideas",
    subtitle: "Contemplative templates for philosophical essays, ethics, and intellectual discourse",
    icon: "menu_book",
    templates: [
      { id: "phil-classic", name: "Symposium", description: "Elegant theme for classical philosophy", icon: "🏛️", preview: { bg: "#0a0810", surface: "#141018", text: "#c0b8d4", accent: "#a78bfa", heading: "#e4dcf8", muted: "#6858a0" }, font: "'Cormorant Garamond', serif", tags: ["classical", "philosophy"], image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop&q=80", sampleTitle: "Plato's Cave in the Age of Social Media", sampleExcerpt: "How algorithmic content curation creates modern shadow-walls, trapping users in curated realities far removed from truth..." },
      { id: "phil-ethics", name: "Moral Compass", description: "Balanced theme for ethics and moral philosophy", icon: "⚖️", preview: { bg: "#0c0a08", surface: "#181410", text: "#c8c0b0", accent: "#b89060", heading: "#ece4d4", muted: "#886840" }, font: "'Cormorant Garamond', serif", tags: ["ethics", "morality"], image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=340&fit=crop&q=80", sampleTitle: "The Trolley Problem in Autonomous Vehicles", sampleExcerpt: "Self-driving cars force utilitarianism from thought experiment to engineering specification — who should an algorithm save?" },
      { id: "phil-existential", name: "Existential", description: "Dark contemplative theme for existentialism", icon: "🌑", preview: { bg: "#080808", surface: "#121212", text: "#b8b8b8", accent: "#909090", heading: "#e0e0e0", muted: "#585858" }, font: "'Cormorant Garamond', serif", tags: ["existential", "dark"], image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=340&fit=crop&q=80", sampleTitle: "Camus and the Absurd: Finding Meaning in Meaninglessness", sampleExcerpt: "The Myth of Sisyphus argues that embracing life's inherent absurdity is not despair but an act of radical freedom and rebellion..." },
      { id: "phil-eastern", name: "Zen Garden", description: "Minimalist theme for Eastern philosophy", icon: "☯️", preview: { bg: "#0a0a08", surface: "#141412", text: "#c0c0b0", accent: "#88a870", heading: "#e4e4d8", muted: "#607050" }, font: "'Cormorant Garamond', serif", tags: ["zen", "eastern"], image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=340&fit=crop&q=80", sampleTitle: "Wabi-Sabi: The Beauty of Imperfection", sampleExcerpt: "Japanese aesthetic philosophy teaches that impermanence, asymmetry, and incompleteness are not flaws but the essence of beauty..." },
      { id: "phil-logic", name: "Logic Gate", description: "Structured theme for formal logic and reasoning", icon: "🔣", preview: { bg: "#060810", surface: "#0e101c", text: "#a8b0d0", accent: "#5878c0", heading: "#d0d8f0", muted: "#3c5088" }, font: "'JetBrains Mono', monospace", tags: ["logic", "formal"], image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=340&fit=crop&q=80", sampleTitle: "Gödel's Incompleteness and the Limits of Knowledge", sampleExcerpt: "Kurt Gödel proved that any sufficiently powerful mathematical system contains truths it cannot prove — a result with profound implications..." },
      { id: "phil-political", name: "Republic", description: "Theme for political philosophy and governance theory", icon: "🏛️", preview: { bg: "#0a0808", surface: "#141010", text: "#c8b8b8", accent: "#b06060", heading: "#f0d8d8", muted: "#804848" }, font: "'Cormorant Garamond', serif", tags: ["political", "governance"], image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=340&fit=crop&q=80", sampleTitle: "Rawls' Veil of Ignorance: Designing Just Societies", sampleExcerpt: "Behind a veil of ignorance about your future social position, what kind of society would you design? A thought experiment in fairness..." },
      { id: "phil-mind", name: "Consciousness", description: "Deep theme for philosophy of mind and consciousness", icon: "💭", preview: { bg: "#06060e", surface: "#0e0e1a", text: "#b0b0d0", accent: "#7070b8", heading: "#d8d8f0", muted: "#484878" }, font: "'Cormorant Garamond', serif", tags: ["consciousness", "mind"], image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=340&fit=crop&q=80", sampleTitle: "The Hard Problem: Why Consciousness Resists Explanation", sampleExcerpt: "David Chalmers argues that explaining subjective experience — why there is 'something it is like' to be conscious — may require new physics..." },
    ],
  },
];

type GeneratedVariant = {
  nameSuffix: string;
  icon: string;
  shade: number;
  saturation: number;
  prefix: string;
};

const GENERATED_VARIANTS: GeneratedVariant[] = [
  { nameSuffix: "Dawn", icon: "✨", shade: 12, saturation: 0.12, prefix: "dawn" },
  { nameSuffix: "Noon", icon: "☀️", shade: 6, saturation: 0.06, prefix: "noon" },
  { nameSuffix: "Dusk", icon: "🌆", shade: -10, saturation: 0.08, prefix: "dusk" },
  { nameSuffix: "Midnight", icon: "🌙", shade: -16, saturation: 0.12, prefix: "midnight" },
  { nameSuffix: "Pulse", icon: "⚡", shade: -4, saturation: 0.16, prefix: "pulse" },
  { nameSuffix: "Canvas", icon: "🎨", shade: 8, saturation: 0.14, prefix: "canvas" },
  { nameSuffix: "Prism", icon: "💎", shade: -8, saturation: 0.1, prefix: "prism" },
  { nameSuffix: "Nova", icon: "🌟", shade: 4, saturation: 0.18, prefix: "nova" },
];

const clamp255 = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

const adjustHex = (hex: string, amount: number, satBoost = 0) => {
  const match = hex.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return hex;
  const n = parseInt(match[1], 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;

  const avg = (r + g + b) / 3;
  r = clamp255(avg + (r - avg) * (1 + satBoost) + amount);
  g = clamp255(avg + (g - avg) * (1 + satBoost) + amount);
  b = clamp255(avg + (b - avg) * (1 + satBoost) + amount);

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

const buildGeneratedTemplate = (_category: TemplateCategory, source: BlockTemplate, variant: GeneratedVariant): BlockTemplate => {
  const { preview } = source;
  const nextPreview = {
    bg: adjustHex(preview.bg, variant.shade - 4, variant.saturation),
    surface: adjustHex(preview.surface, variant.shade, variant.saturation * 0.75),
    text: adjustHex(preview.text, Math.max(-2, Math.floor(variant.shade / 3)), variant.saturation * 0.25),
    accent: adjustHex(preview.accent, variant.shade + 10, variant.saturation),
    heading: adjustHex(preview.heading, variant.shade + 6, variant.saturation * 0.4),
    muted: adjustHex(preview.muted, variant.shade - 6, variant.saturation * 0.2),
  };

  return {
    ...source,
    id: `${source.id}-${variant.prefix}`,
    name: `${source.name} ${variant.nameSuffix}`,
    description: `${source.description} (${variant.nameSuffix.toLowerCase()} variant)`,
    icon: variant.icon,
    preview: nextPreview,
    tags: [...source.tags, "generated"],
    // Keep source's unique sampleTitle/Excerpt so cards look visually distinct
    sampleTitle: source.sampleTitle,
    sampleExcerpt: source.sampleExcerpt,
  };
};

const buildExpandedTemplateCategories = (): TemplateCategory[] => {
  const generatedPool: Array<{ categoryId: string; template: BlockTemplate }> = [];

  TEMPLATE_CATEGORIES.forEach((category) => {
    // Cycle through DIFFERENT source templates per variant so each generated
    // template inherits a unique image, font, sample content and color base.
    GENERATED_VARIANTS.forEach((variant, vi) => {
      const source = category.templates[vi % category.templates.length];
      generatedPool.push({ categoryId: category.id, template: buildGeneratedTemplate(category, source, variant) });
    });
  });

  // ~120 additional templates are appended across all categories (total ~340).
  const selected = generatedPool.slice(0, 120);

  return TEMPLATE_CATEGORIES.map((category) => {
    const additional = selected
      .filter((item) => item.categoryId === category.id)
      .map((item) => item.template);

    if (!additional.length) return category;

    return {
      ...category,
      templates: [...category.templates, ...additional],
    };
  });
};

export const EXPANDED_TEMPLATE_CATEGORIES: TemplateCategory[] = buildExpandedTemplateCategories();

/* ────────────────────────────────────────────────────────────
   Featured blog themes — 6 curated across categories
   ──────────────────────────────────────────────────────────── */
export const FEATURED_THEMES = [
  { ...TEMPLATE_CATEGORIES[0].templates[0], category: "Market & Business" },
  { ...TEMPLATE_CATEGORIES[2].templates[1], category: "Science & Research" },
  { ...TEMPLATE_CATEGORIES[3].templates[0], category: "Technology" },
  { ...TEMPLATE_CATEGORIES[5].templates[2], category: "Code Space" },
  { ...TEMPLATE_CATEGORIES[10].templates[0], category: "Health & Wellness" },
  { ...TEMPLATE_CATEGORIES[12].templates[0], category: "Travel & Adventure" },
];

/* ────────────────────────────────────────────────────────────
   Custom theme creator form
   ──────────────────────────────────────────────────────────── */
export type ThemeCreatorForm = {
  name: string;
  description: string;
  previewIcon: string;
  fontClass: string;
  blockVariant: string;
  isPublic: boolean;
  backgroundImage: string;
  palette: {
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
  };
};