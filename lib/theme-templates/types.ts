/* ────────────────────────────────────────────────────────────
   Shared type definitions for blog theme templates
   ──────────────────────────────────────────────────────────── */

export interface CategoryStyle {
  heroImage: string;
  fontFamily: string;
  fontLabel: string;
  gradientFrom: string;
  gradientVia: string;
  accentColor: string;
  pattern: string;
}

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  preview: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
    heading: string;
    muted: string;
  };
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
