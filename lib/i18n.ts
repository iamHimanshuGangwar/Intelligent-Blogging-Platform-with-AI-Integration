/**
 * Lightweight i18n helper — cookie-based locale, no URL prefix changes.
 * Uses next-intl's useTranslations under the hood on the client side.
 * Server components: use getMessages() from next-intl.
 */

export const LOCALES = ['en', 'es', 'fr', 'de', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
};

/** Read the current locale from a cookie string (server-side). */
export function getLocaleFromCookieString(cookieHeader: string | null): Locale {
  if (!cookieHeader) return DEFAULT_LOCALE;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  const raw = match?.[1];
  return (LOCALES as readonly string[]).includes(raw ?? '') ? (raw as Locale) : DEFAULT_LOCALE;
}
