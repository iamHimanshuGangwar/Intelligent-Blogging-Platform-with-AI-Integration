export async function register() {
  const { init } = await import('@sentry/nextjs');

  const sentryConfig = {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production',
    tracesSampleRate: 0.05,
  };

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    init(sentryConfig);
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    init(sentryConfig);
  }
}

export const onRequestError = async (...args: unknown[]) => {
  const { captureRequestError } = await import('@sentry/nextjs');
  (captureRequestError as Function)(...args);
};
