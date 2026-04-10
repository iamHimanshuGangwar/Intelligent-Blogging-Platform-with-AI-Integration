import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production to avoid noise in dev
  enabled: process.env.NODE_ENV === 'production',

  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,

  // Attach source maps to events
  includeLocalVariables: true,

  // Ignore common non-actionable errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    /Failed to fetch/i,
    /Network request failed/i,
    /Load failed/i,
    /Failed to load Clerk/i,
    /ClerkRuntimeError/i,
  ],

  beforeSend(event) {
    // Strip PII from URLs
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        url.searchParams.delete('email');
        url.searchParams.delete('token');
        url.searchParams.delete('code');
        event.request.url = url.toString();
      } catch { /* not a valid URL */ }
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
