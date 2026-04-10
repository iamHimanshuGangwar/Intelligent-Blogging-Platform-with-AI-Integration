/**
 * Input sanitization utilities to prevent XSS attacks.
 * Uses isomorphic-dompurify which works in both Node.js and browser environments.
 */

import DOMPurify from 'isomorphic-dompurify';

// ── HTML sanitization ─────────────────────────────────────────────────────────

/** Allowed HTML tags for blog content (generous set — supports rich formatting) */
const BLOG_CONTENT_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr', 'div', 'span',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  // Force links to use safe protocols
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|#)/i,
};

/** Tighter config for comments — no headings, no images, no tables */
const COMMENT_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'a', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^https?:/i,
};

/** Strip ALL HTML — plain text only */
const STRIP_ALL_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Sanitize HTML input for blog post content.
 * Removes dangerous elements while preserving rich formatting.
 */
export function sanitizeBlogContent(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, BLOG_CONTENT_CONFIG) as string;
}

/**
 * Sanitize HTML input for user-generated comments / forum posts.
 * More restrictive than blog content.
 */
export function sanitizeComment(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, COMMENT_CONFIG) as string;
}

/**
 * Strip all HTML and return plain text.
 * Useful for generating excerpts and search index content.
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, STRIP_ALL_CONFIG) as string;
}

/**
 * Sanitize a plain-text field (name, title, bio, etc.).
 * Strips HTML, trims whitespace, and limits length.
 */
export function sanitizeText(input: unknown, maxLength = 1000): string {
  if (!input || typeof input !== 'string') return '';
  const stripped = stripHtml(input).trim();
  return stripped.slice(0, maxLength);
}

/**
 * Escape characters that could be dangerous in SQL LIKE/ILIKE patterns.
 * Use this when inserting user input into Supabase textSearch or ilike queries.
 */
export function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, (c) => `\\${c}`);
}
