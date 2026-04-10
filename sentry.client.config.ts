// Client-side Sentry initialization is handled by instrumentation-client.ts
// This file must exist because @sentry/nextjs webpack plugin adds it as an
// entry point automatically. Keeping it here as a stub prevents the
// "Module not found: Can't resolve './sentry.client.config.ts'" build error.
//
// Do NOT add Sentry.init() here — that would cause a double-init.
// All Sentry configuration lives in:
//   - instrumentation-client.ts  (browser)
//   - instrumentation.ts register() (server + edge)
