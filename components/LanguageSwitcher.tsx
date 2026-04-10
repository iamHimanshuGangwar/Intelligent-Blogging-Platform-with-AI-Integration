'use client';

import { useState, useRef, useEffect } from 'react';
import { LOCALES, LOCALE_LABELS, LOCALE_COOKIE, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`)
    );
    const raw = match?.[1];
    if (raw && (LOCALES as readonly string[]).includes(raw)) {
      setCurrent(raw as Locale);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectLocale(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setCurrent(locale);
    setOpen(false);
    window.location.reload();
  }

  // Avoid hydration mismatch from browser extensions injecting attributes (e.g. fdprocessedid)
  if (!mounted) {
    return (
      <div className="relative">
        <div className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground/70">
          <span className="text-base leading-none">🌐</span>
          <span>{LOCALE_LABELS[DEFAULT_LOCALE]}</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
        suppressHydrationWarning
      >
        <span className="text-base leading-none">🌐</span>
        <span>{LOCALE_LABELS[current]}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 mt-1 z-50 min-w-[10rem] rounded-lg border border-border bg-popover shadow-lg py-1 text-sm"
        >
          {LOCALES.map((locale) => (
            <li key={locale}>
              <button
                role="option"
                aria-selected={locale === current}
                onClick={() => selectLocale(locale)}
                className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors ${
                  locale === current ? 'font-semibold text-primary' : 'text-foreground'
                }`}
              >
                {LOCALE_LABELS[locale]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
