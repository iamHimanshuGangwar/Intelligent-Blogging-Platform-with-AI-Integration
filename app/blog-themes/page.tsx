"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/NavBar";

import { useAuth } from "@/context/AuthContext";
import { BLOCK_VARIANTS, BlogTheme, FONT_OPTIONS, getThemeFromAny, sanitizeThemeConfig } from "@/lib/blog-themes";
import { CATEGORY_STYLES, FEATURED_THEMES, EXPANDED_TEMPLATE_CATEGORIES, type BlockTemplate, type ThemeCreatorForm, type CardVariant } from "@/lib/blog-theme-templates";
/* ────────────────────────────────────────────────────────────
   BlogPreviewCard — renders distinct layouts per category
   ──────────────────────────────────────────────────────────── */
function BlogPreviewCard({ tmpl, categoryLabel, variant = "classic" }: { tmpl: BlockTemplate; categoryLabel?: string; variant?: CardVariant }) {
  const p = tmpl.preview;
  const editorLink = `/editor?templateTheme=${tmpl.id}&bg=${encodeURIComponent(p.bg)}&accent=${encodeURIComponent(p.accent)}&heading=${encodeURIComponent(p.heading)}&text=${encodeURIComponent(p.text)}&surface=${encodeURIComponent(p.surface)}&muted=${encodeURIComponent(p.muted)}&font=${encodeURIComponent(tmpl.font)}`;

  /* ── Terminal card (technology, code-space) ── */
  if (variant === "terminal") {
    return (
      <article className="border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group relative font-mono" style={{ backgroundColor: p.bg, borderColor: `${p.accent}30` }}>
        <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ backgroundColor: `${p.surface}`, borderColor: `${p.accent}20` }}>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500/70" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
            <span className="w-2 h-2 rounded-full bg-green-500/70" />
          </div>
          <span className="text-[9px] ml-2 tracking-wider" style={{ color: p.accent, fontFamily: tmpl.font }}>~/blog/{tmpl.id}</span>
        </div>
        {tmpl.image && (
          <div className="relative w-full h-28 overflow-hidden opacity-60">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 20%, ${p.bg})` }} />
          </div>
        )}
        <div className="p-4 space-y-2" style={{ fontFamily: tmpl.font }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: p.accent }}>$</span>
            <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: p.muted }}>{tmpl.tags[0]}</span>
          </div>
          <h3 className="text-sm font-bold leading-tight" style={{ color: p.accent }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          <div className="flex items-center gap-1 pt-1">
            <span className="text-[9px]" style={{ color: p.accent }}>▋</span>
            <span className="text-[9px]" style={{ color: p.muted }}>4 min read</span>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2 border-t relative z-20" style={{ borderColor: `${p.accent}20` }}>
          <div className="flex gap-0.5 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-3 h-3 border" style={{ backgroundColor: c, borderColor: `${p.muted}20` }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100" style={{ backgroundColor: p.accent, color: p.bg }}>Use Theme</Link>
        </div>
      </article>
    );
  }

  /* ── Polaroid card (real-estate, photography) ── */
  if (variant === "polaroid") {
    return (
      <article className="transition-all hover:-translate-y-1 hover:shadow-2xl group relative p-3" style={{ backgroundColor: "#f8f6f0", borderColor: `${p.muted}30` }}>
        {tmpl.image && (
          <div className="relative w-full h-44 overflow-hidden">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        )}
        <div className="pt-3 pb-1 space-y-1.5">
          <h3 className="text-sm font-bold leading-tight text-gray-900" style={{ fontFamily: tmpl.font }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2 text-gray-600" style={{ fontFamily: tmpl.font }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          {categoryLabel && <span className="inline-block text-[8px] tracking-wider uppercase px-1.5 py-0.5 mt-1" style={{ color: p.accent, backgroundColor: `${p.accent}15` }}>{categoryLabel}</span>}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-2">
          <div className="flex gap-0.5 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 rounded-full" style={{ backgroundColor: p.accent, color: "#fff" }}>Use</Link>
        </div>
      </article>
    );
  }

  /* ── Glassmorphic card (science) ── */
  if (variant === "glassmorphic") {
    return (
      <article className="border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group relative rounded-xl backdrop-blur-sm" style={{ backgroundColor: `${p.bg}cc`, borderColor: `${p.accent}25`, boxShadow: `0 4px 30px ${p.accent}10` }}>
        {tmpl.image && (
          <div className="relative w-full h-36 overflow-hidden">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-80" />
            <div className="absolute inset-0 backdrop-blur-[1px]" style={{ background: `linear-gradient(135deg, ${p.bg}90 0%, transparent 60%)` }} />
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[8px] uppercase tracking-[0.2em] backdrop-blur-md" style={{ color: p.accent, backgroundColor: `${p.accent}15`, border: `1px solid ${p.accent}30` }}>{tmpl.tags[0]}</div>
          </div>
        )}
        <div className="p-4 space-y-3" style={{ fontFamily: tmpl.font }}>
          <h3 className="text-sm font-bold leading-tight" style={{ color: p.heading }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          <div className="flex items-center gap-2">
            <div className="h-[1px] flex-1" style={{ background: `linear-gradient(to right, ${p.accent}60, transparent)` }} />
            <span className="text-[9px]" style={{ color: p.muted }}>4 min</span>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2 border-t relative z-20" style={{ borderColor: `${p.accent}15` }}>
          <div className="flex gap-1 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}40` }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 rounded-full" style={{ backgroundColor: `${p.accent}20`, color: p.accent, border: `1px solid ${p.accent}40` }}>Use Theme</Link>
        </div>
      </article>
    );
  }

  /* ── Neon card (social-media) ── */
  if (variant === "neon") {
    return (
      <article className="border-2 overflow-hidden transition-all hover:-translate-y-1 group relative rounded-2xl" style={{ backgroundColor: p.bg, borderColor: `${p.accent}40`, boxShadow: `0 0 20px ${p.accent}15, inset 0 0 20px ${p.accent}05` }}>
        {tmpl.image && (
          <div className="relative w-full h-32 overflow-hidden">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-110 saturate-150" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${p.bg}40 0%, ${p.bg} 100%)` }} />
          </div>
        )}
        <div className="p-4 space-y-2" style={{ fontFamily: tmpl.font }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: p.accent, boxShadow: `0 0 8px ${p.accent}` }} />
            <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: p.accent }}>{tmpl.tags[0]}</span>
          </div>
          <h3 className="text-base font-extrabold leading-tight" style={{ color: p.heading, fontFamily: tmpl.font }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
        </div>
        <div className="p-3 flex items-center gap-2 border-t relative z-20" style={{ borderColor: `${p.accent}25` }}>
          <div className="flex gap-1 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 4px ${c}` }} />)}</div>
          <Link href={editorLink} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 rounded-full" style={{ background: `linear-gradient(135deg, ${p.accent}, ${p.muted})`, color: p.bg }}>Use</Link>
        </div>
      </article>
    );
  }

  /* ── Brutalist card (architecture) ── */
  if (variant === "brutalist") {
    return (
      <article className="border-2 overflow-hidden transition-all hover:-translate-y-1 group relative" style={{ backgroundColor: p.bg, borderColor: p.heading }}>
        <div className="px-4 py-2 border-b-2" style={{ borderColor: p.heading, backgroundColor: p.surface }}>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black" style={{ color: p.heading, fontFamily: tmpl.font }}>{tmpl.name}</span>
        </div>
        {tmpl.image && (
          <div className="relative w-full h-32 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          </div>
        )}
        <div className="p-4 space-y-2" style={{ fontFamily: tmpl.font }}>
          <h3 className="text-lg font-black uppercase leading-tight tracking-tight" style={{ color: p.heading }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          <div className="w-full h-0.5" style={{ backgroundColor: p.accent }} />
        </div>
        <div className="p-3 flex items-center gap-2 border-t-2 relative z-20" style={{ borderColor: p.heading }}>
          <div className="flex gap-0.5 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-4 h-4" style={{ backgroundColor: c }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 border-2" style={{ borderColor: p.accent, color: p.accent }}>Use</Link>
        </div>
      </article>
    );
  }

  /* ── Editorial card (typography) ── */
  if (variant === "editorial") {
    return (
      <article className="overflow-hidden transition-all hover:-translate-y-1 group relative border-l-4" style={{ backgroundColor: p.bg, borderColor: p.accent }}>
        <div className="p-5 space-y-3" style={{ fontFamily: tmpl.font }}>
          <span className="text-[9px] uppercase tracking-[0.3em]" style={{ color: p.accent }}>{tmpl.tags[0]} — Jan 2025</span>
          <h3 className="text-xl font-bold leading-tight italic" style={{ color: p.heading }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-xs leading-relaxed line-clamp-3" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          <div className="flex items-center gap-3 pt-2">
            <div className="w-8 h-[2px]" style={{ backgroundColor: p.accent }} />
            <span className="text-[9px] italic" style={{ color: p.muted }}>4 min read</span>
          </div>
        </div>
        {tmpl.image && (
          <div className="relative w-full h-28 overflow-hidden">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${p.bg} 10%, transparent)` }} />
          </div>
        )}
        <div className="px-5 py-3 flex items-center gap-2 relative z-20">
          <div className="flex gap-0.5 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-3 h-3 border" style={{ backgroundColor: c, borderColor: `${p.muted}20` }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-semibold italic tracking-wider transition-all opacity-0 group-hover:opacity-100" style={{ color: p.accent }}>Use Theme →</Link>
        </div>
      </article>
    );
  }

  /* ── Magazine card (health-wellness) ── */
  if (variant === "magazine") {
    return (
      <article className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group relative rounded-lg" style={{ backgroundColor: p.bg }}>
        {tmpl.image && (
          <div className="relative w-full h-44 overflow-hidden rounded-t-lg">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 50%, ${p.bg})` }} />
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-base font-bold leading-tight drop-shadow-lg" style={{ color: p.heading, fontFamily: tmpl.font }}>{tmpl.sampleTitle || tmpl.name}</h3>
            </div>
          </div>
        )}
        <div className="p-4 space-y-2" style={{ fontFamily: tmpl.font }}>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[8px] uppercase tracking-[0.2em] rounded-full" style={{ color: p.accent, backgroundColor: `${p.accent}15` }}>{tmpl.tags[0]}</span>
            <span className="text-[9px]" style={{ color: p.muted }}>4 min read</span>
          </div>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
        </div>
        <div className="p-3 flex items-center gap-2 border-t relative z-20 rounded-b-lg" style={{ borderColor: `${p.muted}15`, backgroundColor: p.surface }}>
          <div className="flex gap-1 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: c }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 rounded-full" style={{ backgroundColor: p.accent, color: p.bg }}>Use</Link>
        </div>
      </article>
    );
  }

  /* ── Recipe card (food-culinary) ── */
  if (variant === "recipe") {
    return (
      <article className="border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group relative rounded-xl" style={{ backgroundColor: p.surface, borderColor: `${p.muted}20` }}>
        {tmpl.image && (
          <div className="relative w-full h-40 overflow-hidden">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg text-[9px] font-bold backdrop-blur-md" style={{ backgroundColor: `${p.bg}cc`, color: p.accent }}>{tmpl.icon} {tmpl.tags[0]}</div>
          </div>
        )}
        <div className="p-4 space-y-2" style={{ fontFamily: tmpl.font }}>
          <h3 className="text-sm font-bold leading-tight" style={{ color: p.heading }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.accent}15`, color: p.accent }}>🕐 4 min</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${p.accent}15`, color: p.accent }}>📖 Recipe</span>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2 border-t relative z-20 rounded-b-xl" style={{ borderColor: `${p.muted}15` }}>
          <div className="flex gap-0.5 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 rounded-full" style={{ backgroundColor: p.accent, color: p.bg }}>Use</Link>
        </div>
      </article>
    );
  }

  /* ── Postcard card (travel-adventure) ── */
  if (variant === "postcard") {
    return (
      <article className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group relative rounded-sm" style={{ backgroundColor: p.bg, border: `3px solid ${p.surface}`, boxShadow: `4px 4px 0 ${p.muted}20` }}>
        {tmpl.image && (
          <div className="relative w-full h-40 overflow-hidden">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, ${p.bg}e0)` }} />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-[0.25em] px-2 py-0.5" style={{ color: p.heading, backgroundColor: `${p.accent}cc`, fontFamily: tmpl.font }}>{tmpl.tags[0]}</span>
            </div>
          </div>
        )}
        <div className="p-4 space-y-2" style={{ fontFamily: tmpl.font }}>
          <h3 className="text-sm font-bold leading-tight" style={{ color: p.heading }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2 italic" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-[10px]" style={{ color: p.accent }}>✈</span>
            <div className="h-[1px] flex-1" style={{ backgroundColor: `${p.muted}30`, backgroundImage: `repeating-linear-gradient(90deg, ${p.muted}40 0, ${p.muted}40 4px, transparent 4px, transparent 8px)` }} />
            <span className="text-[9px]" style={{ color: p.muted }}>4 min</span>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2 border-t relative z-20" style={{ borderColor: `${p.muted}15` }}>
          <div className="flex gap-0.5 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-3 h-3" style={{ backgroundColor: c, borderRadius: "2px" }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100" style={{ backgroundColor: p.accent, color: p.bg }}>Explore</Link>
        </div>
      </article>
    );
  }

  /* ── Notebook card (education-learning) ── */
  if (variant === "notebook") {
    return (
      <article className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group relative border" style={{ backgroundColor: p.bg, borderColor: `${p.muted}20` }}>
        <div className="absolute left-0 top-0 bottom-0 w-8 border-r" style={{ backgroundColor: `${p.accent}08`, borderColor: `${p.accent}20` }} />
        <div className="ml-8">
          {tmpl.image && (
            <div className="relative w-full h-28 overflow-hidden border-b" style={{ borderColor: `${p.muted}15` }}>
              <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 50%, ${p.bg})` }} />
            </div>
          )}
          <div className="p-4 space-y-2" style={{ fontFamily: tmpl.font, backgroundImage: `repeating-linear-gradient(transparent, transparent 23px, ${p.muted}10 24px)` }}>
            <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: p.accent }}>{tmpl.tags[0]}</span>
            <h3 className="text-sm font-bold leading-tight" style={{ color: p.heading }}>{tmpl.sampleTitle || tmpl.name}</h3>
            <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
            <span className="text-[9px] block" style={{ color: p.muted }}>📖 4 min lesson</span>
          </div>
          <div className="p-3 flex items-center gap-2 border-t relative z-20" style={{ borderColor: `${p.muted}15` }}>
            <div className="flex gap-0.5 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-3 h-3 border" style={{ backgroundColor: c, borderColor: `${p.muted}20` }} />)}</div>
            <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100" style={{ backgroundColor: p.accent, color: p.bg }}>Use</Link>
          </div>
        </div>
      </article>
    );
  }

  /* ── Vinyl card (music-entertainment) ── */
  if (variant === "vinyl") {
    return (
      <article className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group relative rounded-2xl border" style={{ backgroundColor: p.bg, borderColor: `${p.accent}20` }}>
        {tmpl.image && (
          <div className="relative w-full h-36 overflow-hidden">
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105 saturate-125" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${p.bg}cc 0%, transparent 50%, ${p.bg}cc 100%)` }} />
            <div className="absolute top-3 right-3 w-10 h-10 rounded-full border-2 flex items-center justify-center group-hover:animate-spin" style={{ borderColor: `${p.accent}60`, backgroundColor: `${p.bg}cc` }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.accent }} />
            </div>
          </div>
        )}
        <div className="p-4 space-y-2" style={{ fontFamily: tmpl.font }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: p.accent }}>♫</span>
            <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: p.muted }}>{tmpl.tags[0]}</span>
          </div>
          <h3 className="text-sm font-bold leading-tight" style={{ color: p.heading }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <div key={i} className="w-1" style={{ height: `${8 + [12, 16, 10, 18, 14][i]}px`, backgroundColor: p.accent, opacity: [0.6, 0.9, 0.5, 1, 0.7][i] }} />)}
            <span className="text-[9px] ml-2" style={{ color: p.muted }}>4:00</span>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2 border-t relative z-20 rounded-b-2xl" style={{ borderColor: `${p.accent}15` }}>
          <div className="flex gap-1 flex-1">{Object.values(p).map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />)}</div>
          <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 rounded-full" style={{ backgroundColor: p.accent, color: p.bg }}>Play</Link>
        </div>
      </article>
    );
  }

  /* ── Minimal card (about-portfolio) ── */
  if (variant === "minimal") {
    return (
      <article className="overflow-hidden transition-all hover:-translate-y-0.5 group relative" style={{ backgroundColor: "transparent" }}>
        {tmpl.image && (
          <div className="relative w-full h-36 overflow-hidden" style={{ borderRadius: "2px" }}>
            <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        )}
        <div className="py-3 space-y-1.5" style={{ fontFamily: tmpl.font }}>
          <h3 className="text-sm font-semibold leading-tight" style={{ color: p.heading }}>{tmpl.sampleTitle || tmpl.name}</h3>
          <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.muted }}>{tmpl.sampleExcerpt || tmpl.description}</p>
          <Link href={editorLink} className="text-[10px] font-semibold transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100" style={{ color: p.accent }}>Use Theme <span>→</span></Link>
        </div>
      </article>
    );
  }

  /* ── Classic card (default: market-business) ── */
  return (
    <article className="border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl group relative" style={{ backgroundColor: p.surface, borderColor: `${p.muted}25` }}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b" style={{ backgroundColor: p.bg, borderColor: `${p.muted}20` }}>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `${p.muted}50` }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `${p.muted}30` }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `${p.muted}30` }} />
        </div>
        <span className="text-[9px] ml-2 tracking-wider uppercase" style={{ color: p.muted, fontFamily: tmpl.font }}>{tmpl.name}</span>
        {categoryLabel && (
          <span className="ml-auto text-[8px] tracking-wider uppercase px-1.5 py-0.5 border" style={{ color: p.accent, borderColor: `${p.accent}40` }}>{categoryLabel}</span>
        )}
      </div>
      {tmpl.image && (
        <div className="relative w-full h-36 overflow-hidden">
          <Image src={tmpl.image} alt={tmpl.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, ${p.bg})` }} />
        </div>
      )}
      <div className="p-4 space-y-3" style={{ backgroundColor: p.bg }}>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4" style={{ backgroundColor: p.accent }} />
          <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: p.muted, fontFamily: tmpl.font }}>{tmpl.tags[0]} — Jan 2025</span>
        </div>
        <h3 className="text-sm font-bold leading-tight" style={{ color: p.heading, fontFamily: tmpl.font }}>{tmpl.sampleTitle || tmpl.name}</h3>
        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: p.text, fontFamily: tmpl.font }}>{tmpl.sampleExcerpt || tmpl.description}</p>
        <div className="flex items-center gap-2 pt-1">
          <div className="flex gap-0.5">
            <div className="w-8 h-1" style={{ backgroundColor: p.accent }} />
            <div className="w-5 h-1" style={{ backgroundColor: `${p.accent}60` }} />
            <div className="w-3 h-1" style={{ backgroundColor: `${p.accent}30` }} />
          </div>
          <span className="text-[9px]" style={{ color: p.muted }}>4 min read</span>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" style={{ background: `linear-gradient(to top, ${p.bg}f5 0%, ${p.bg}e0 40%, transparent 100%)` }}>
        <div className="p-4 pointer-events-auto">
          <p className="text-xs leading-relaxed line-clamp-4 mb-3" style={{ color: p.text, fontFamily: tmpl.font }}>{tmpl.description}</p>
        </div>
      </div>
      <div className="p-3 flex items-center gap-2 border-t relative z-20" style={{ backgroundColor: p.surface, borderColor: `${p.muted}15` }}>
        <div className="flex gap-0.5 flex-1">{Object.values(p).map((color, i) => <div key={i} className="w-3 h-3 border" style={{ backgroundColor: color, borderColor: `${p.muted}20` }} title={color} />)}</div>
        <Link href={editorLink} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0" style={{ backgroundColor: p.accent, color: p.bg }}>Use Theme</Link>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────────────────────── */
export default function BlogThemesPage() {
  const { isAuthenticated } = useAuth();
  const [themes, setThemes] = useState<BlogTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [uploadingBg, setUploadingBg] = useState(false);

  const [form, setForm] = useState<ThemeCreatorForm>({
    name: "",
    description: "",
    previewIcon: "🎨",
    fontClass: "font-body",
    blockVariant: "soft",
    isPublic: false,
    backgroundImage: "",
    palette: {
      background: "#0e0e0e",
      surface: "#1a1a1a",
      text: "#d4d4d8",
      mutedText: "#a1a1aa",
      heading: "#ffffff",
      accent: "#85adff",
      border: "#3f3f46",
      codeBackground: "#161616",
      codeText: "#dbeafe",
      blockquoteBackground: "#0f1d33",
      tableHeaderBackground: "#171717",
    },
  });

  useEffect(() => {
    let active = true;
    const loadThemes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/blog-themes?includeBuiltin=true", { credentials: "include" });
        if (!response.ok) { setThemes([]); return; }
        const data = await response.json();
        const resolved = Array.isArray(data.themes) ? data.themes.map((theme: any) => getThemeFromAny(theme)) : [];
        if (active) setThemes(resolved);
      } catch {
        if (active) setThemes([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadThemes();
    return () => { active = false; };
  }, []);

  const paletteKeys = useMemo(
    () => Object.keys(form.palette) as Array<keyof ThemeCreatorForm["palette"]>,
    [form.palette]
  );

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setFeedback("Image must be under 5MB."); return; }
    setUploadingBg(true);
    setFeedback("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "theme-backgrounds");
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((prev) => ({ ...prev, backgroundImage: data.url }));
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingBg(false);
    }
  };

  const createTheme = async () => {
    if (!form.name.trim()) { setFeedback("Theme name is required."); return; }
    setSaving(true);
    setFeedback("");
    try {
      const safeConfig = sanitizeThemeConfig({
        fontClass: form.fontClass,
        blockVariant: form.blockVariant as any,
        palette: form.palette,
      });
      const response = await fetch("/api/blog-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: form.name, description: form.description, previewIcon: form.previewIcon, isPublic: form.isPublic, themeConfig: { ...safeConfig, backgroundImage: form.backgroundImage || undefined } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create theme");
      const created = getThemeFromAny(data.theme);
      setThemes((current) => [created, ...current]);
      setFeedback("Theme created successfully.");
      setShowCreator(false);
      setForm((prev) => ({ ...prev, name: "", description: "", previewIcon: "🎨" }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Failed to create theme");
    } finally {
      setSaving(false);
    }
  };

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query && !activeCategory) return EXPANDED_TEMPLATE_CATEGORIES;
    if (!query && activeCategory) return EXPANDED_TEMPLATE_CATEGORIES.filter((c) => c.id === activeCategory);
    return EXPANDED_TEMPLATE_CATEGORIES.map((cat) => ({
      ...cat,
      templates: cat.templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          cat.title.toLowerCase().includes(query)
      ),
    })).filter((cat) => cat.templates.length > 0);
  }, [searchQuery, activeCategory]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background gradient-mesh">
        {/* ─── Hero Section ─── */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,154,91,0.12),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(100,80,160,0.08),transparent_50%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-28 pb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-on-surface-variant mb-4">Theme Gallery</p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-headline tracking-tighter text-on-surface leading-[0.9]">
                  Blog Theme
                  <br />
                  <span className="bg-linear-to-r from-amber-300/90 via-orange-300/80 to-violet-400/70 bg-clip-text text-transparent italic">
                    Templates
                  </span>
                </h1>
                <p className="mt-5 text-on-surface-variant max-w-lg leading-relaxed">
                  Choose a theme, preview how your blog will look, and start writing. Each category features unique
                  typography, imagery, and color palettes crafted for specific content styles.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {isAuthenticated && (
                    <button
                      onClick={() => setShowCreator((v) => !v)}
                      suppressHydrationWarning
                      className="bg-primary text-on-primary-fixed px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      {showCreator ? "Close Creator" : "Create Custom Theme"}
                    </button>
                  )}
                  <Link href="/editor" className="border border-white/15 text-on-surface px-5 py-2.5 text-sm font-semibold hover:bg-white/5 transition-colors">
                    Open Editor
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { num: `${themes.length + EXPANDED_TEMPLATE_CATEGORIES.reduce((s, c) => s + c.templates.length, 0)}`, label: "Total Templates" },
                  { num: `${EXPANDED_TEMPLATE_CATEGORIES.length}`, label: "Categories" },
                  { num: "6", label: "Typography Styles" },
                  { num: "5", label: "Block Variants" },
                ].map((stat) => (
                  <div key={stat.label} className="border border-white/8 bg-surface-container/40 p-4">
                    <span className="text-2xl font-extrabold font-headline text-on-surface">{stat.num}</span>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Storytelling: How Themes Work ─── */}
        <section className="border-b border-white/5 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <p className="text-xs uppercase tracking-[0.3em] text-on-surface-variant mb-6 text-center">The Journey</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-on-surface text-center mb-12">
              From blank canvas to <span className="italic bg-linear-to-r from-amber-300/90 to-violet-400/70 bg-clip-text text-transparent">published masterpiece</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
              <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              {[
                { step: "01", icon: "palette", title: "Pick Your Identity", desc: "Every category has its own typography, color palette, and card layout — designed for specific content styles. Business blogs feel authoritative; tech blogs feel precise; travel blogs feel adventurous." },
                { step: "02", icon: "edit_note", title: "Write With Style", desc: "Your chosen theme wraps around your words instantly — headings, code blocks, quotes, and images all adapt. What you see in preview is exactly what your readers experience." },
                { step: "03", icon: "rocket_launch", title: "Publish & Stand Out", desc: "No two blogs look the same. Your theme becomes your brand identity — unique fonts, colors, and layouts that readers associate with your voice." },
              ].map((item, i) => (
                <div key={i} className="relative text-center px-6 py-6">
                  <div className="w-14 h-14 mx-auto mb-4 border border-white/10 bg-surface-container/50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant">{item.icon}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-primary/60 block mb-2">{item.step}</span>
                  <h3 className="text-lg font-bold text-on-surface mb-2">{item.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Typography Showcase Strip ─── */}
        <section className="border-b border-white/5 py-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant mb-6 text-center">6 Curated Typography Styles</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { font: "'Playfair Display', Georgia, serif", label: "Playfair Display", vibe: "Elegant & Editorial", sample: "The Art of Storytelling" },
                { font: "'JetBrains Mono', monospace", label: "JetBrains Mono", vibe: "Technical & Precise", sample: "function deploy() {" },
                { font: "'Space Grotesk', sans-serif", label: "Space Grotesk", vibe: "Modern & Clean", sample: "Innovation Starts Here" },
                { font: "'Lora', Georgia, serif", label: "Lora", vibe: "Warm & Classic", sample: "A Journey Through Time" },
                { font: "'Crimson Pro', Georgia, serif", label: "Crimson Pro", vibe: "Academic & Refined", sample: "Research & Discovery" },
                { font: "'Inter', sans-serif", label: "Inter", vibe: "Minimal & Universal", sample: "Design That Speaks" },
              ].map((f) => (
                <div key={f.label} className="border border-white/8 bg-surface-container/30 p-4 text-center hover:border-white/20 transition-colors group">
                  <p className="text-base font-bold text-on-surface mb-1 leading-tight" style={{ fontFamily: f.font }}>{f.sample}</p>
                  <span className="text-[9px] uppercase tracking-[0.2em] text-primary/70 block mb-0.5">{f.label}</span>
                  <span className="text-[9px] text-on-surface-variant">{f.vibe}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Category Navigation ─── */}
        <section className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <span className="material-symbols-outlined text-on-surface-variant/60 absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Search themes..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory(null); }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container border border-white/10 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveCategory(null)}
              suppressHydrationWarning
              className={`shrink-0 px-4 py-1.5 text-xs font-semibold transition-colors ${!activeCategory ? "bg-primary/15 text-primary border border-primary/30" : "border border-white/8 text-on-surface-variant hover:text-on-surface hover:border-white/20"}`}
            >
              All Themes
            </button>
            {EXPANDED_TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                suppressHydrationWarning
                className={`shrink-0 px-4 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${activeCategory === cat.id ? "bg-primary/15 text-primary border border-primary/30" : "border border-white/8 text-on-surface-variant hover:text-on-surface hover:border-white/20"}`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                {cat.title}
              </button>
            ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-20">
          {/* ─── Custom Theme Creator ─── */}
          {showCreator && isAuthenticated && (
            <div className="mb-10 border border-white/10 bg-surface-container p-5 space-y-4">
              <h2 className="text-xl font-bold text-on-surface">Custom Theme Creator</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Theme name" className="bg-surface-container-high border border-white/10 px-3 py-2 text-sm text-on-surface" />
                <input value={form.previewIcon} onChange={(e) => setForm((prev) => ({ ...prev, previewIcon: e.target.value }))} placeholder="Preview icon" className="bg-surface-container-high border border-white/10 px-3 py-2 text-sm text-on-surface" />
                <select value={form.fontClass} onChange={(e) => setForm((prev) => ({ ...prev, fontClass: e.target.value }))} className="bg-surface-container-high border border-white/10 px-3 py-2 text-sm text-on-surface">
                  {FONT_OPTIONS.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
              </div>
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Theme description" className="w-full bg-surface-container-high border border-white/10 px-3 py-2 text-sm text-on-surface" rows={2} />
              <div className="space-y-2">
                <label className="text-xs text-on-surface-variant font-semibold">Background Image (optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-surface-container-high border border-white/10 px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface hover:border-white/20 transition-colors">
                    {uploadingBg ? "Uploading..." : "Choose Image"}
                    <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" disabled={uploadingBg} />
                  </label>
                  {form.backgroundImage && (
                    <div className="flex items-center gap-2">
                      <Image
                        src={form.backgroundImage}
                        alt="Background preview"
                        width={56}
                        height={32}
                        className="h-8 w-14 object-cover border border-white/10"
                      />
                      <button onClick={() => setForm((prev) => ({ ...prev, backgroundImage: "" }))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select value={form.blockVariant} onChange={(e) => setForm((prev) => ({ ...prev, blockVariant: e.target.value }))} className="bg-surface-container-high border border-white/10 px-3 py-2 text-sm text-on-surface">
                  {BLOCK_VARIANTS.map((variant) => (<option key={variant.value} value={variant.value}>{variant.label}</option>))}
                </select>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((prev) => ({ ...prev, isPublic: e.target.checked }))} />
                  Make this theme public for all users
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {paletteKeys.map((key) => (
                  <label key={key} className="text-xs text-on-surface-variant flex items-center gap-2 bg-surface-container-high px-2 py-2">
                    <span className="w-28 truncate">{key}</span>
                    <input type="color" value={form.palette[key]} onChange={(e) => setForm((prev) => ({ ...prev, palette: { ...prev.palette, [key]: e.target.value } }))} className="h-8 w-10" />
                    <span className="text-[11px]">{form.palette[key]}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-on-surface-variant">Custom themes are saved to your account.</p>
                <button onClick={createTheme} disabled={saving} className="bg-primary text-on-primary-fixed px-4 py-2 text-sm font-semibold disabled:opacity-60">{saving ? "Saving..." : "Save Theme"}</button>
              </div>
              {feedback && <p className="text-xs text-primary">{feedback}</p>}
            </div>
          )}

          {/* ─── Featured Blog Theme Previews (6 curated themes) ─── */}
          {!activeCategory && !searchQuery && (
            <section className="mb-16">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">Featured Blog Themes</h2>
                <p className="text-sm text-on-surface-variant mt-1">See how your blog will look — click any theme to start writing</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURED_THEMES.map((tmpl) => (
                  <BlogPreviewCard key={tmpl.id} tmpl={tmpl} categoryLabel={tmpl.category} />
                ))}
              </div>
            </section>
          )}

          {/* ─── Library Themes (built-in + custom) ─── */}
          {(!activeCategory || activeCategory === "library") && (
            <section className="mb-14">
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold font-headline tracking-tight text-on-surface">Library Themes</h2>
                <p className="text-sm text-on-surface-variant mt-1">Built-in and community-created themes ready to use</p>
              </div>
              {loading ? (
                <div className="text-sm text-on-surface-variant">Loading themes...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {themes.map((theme) => (
                    <article key={theme.id} className="border overflow-hidden shadow-xl transition-all hover:-translate-y-0.5 group" style={{ backgroundColor: theme.palette.surface, borderColor: theme.palette.border }}>
                      <div className={`h-28 ${theme.fontClass} p-4 flex flex-col justify-between`} style={{ backgroundColor: theme.palette.background, color: theme.palette.text }}>
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{theme.previewImage}</span>
                          <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: theme.palette.mutedText }}>{theme.source}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold" style={{ color: theme.palette.heading }}>{theme.name}</h3>
                          <p className="text-[11px] line-clamp-1" style={{ color: theme.palette.mutedText }}>{theme.description}</p>
                        </div>
                      </div>
                      <div className="p-3 flex gap-2">
                        <Link href={`/editor?theme=${encodeURIComponent(theme.id)}`} className="flex-1 inline-flex items-center justify-center bg-primary text-on-primary-fixed py-1.5 text-xs font-semibold hover:opacity-90">
                          Use Theme
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ─── Template Categories with Unique Visual Identity ─── */}
          {filteredCategories.map((category) => {
            const style = CATEGORY_STYLES[category.id];
            if (!style) return null;

            return (
              <section key={category.id} className="mb-16" id={category.id}>
                {/* Category Hero with Unsplash Image */}
                <div className="relative overflow-hidden mb-6 h-48 sm:h-56 border border-white/5">
                  <Image
                    src={style.heroImage}
                    alt={category.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    unoptimized
                  />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${style.gradientFrom} 0%, ${style.gradientVia} 60%, transparent 100%)` }} />
                  <div className="absolute inset-0" style={{ backgroundImage: style.pattern, backgroundSize: "20px 20px" }} />

                  <div className="relative h-full flex flex-col justify-end p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-2xl" style={{ color: style.accentColor }}>{category.icon}</span>
                      <span className="text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 border" style={{ color: style.accentColor, borderColor: `${style.accentColor}40` }}>
                        {category.templates.length} templates
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.25em] text-white/50">{style.fontLabel}</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight" style={{ fontFamily: style.fontFamily }}>
                      {category.title}
                    </h2>
                    <p className="text-sm text-white/70 mt-1 max-w-lg" style={{ fontFamily: style.fontFamily }}>
                      {category.subtitle}
                    </p>
                  </div>
                </div>

                {/* Blog preview cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {category.templates.map((tmpl) => (
                    <BlogPreviewCard key={tmpl.id} tmpl={tmpl} variant={style.cardVariant} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
