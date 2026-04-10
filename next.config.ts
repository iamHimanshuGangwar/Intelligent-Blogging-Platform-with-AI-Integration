import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: false, // disable to avoid double-render warnings that slow dev
  // SWC minification is the default in Next.js 15, no config needed.
  // Serve static assets with long-lived cache headers, preventing 404 on stale chunks
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/:path*\\.{png,jpg,jpeg,webp,avif,svg,ico,woff,woff2}",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.aiblog.dev https://*.clerk.accounts.dev https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://*.clerk.accounts.dev https://clerk.aiblog.dev https://*.sentry.io https://*.upstash.io wss://*.supabase.co",
              "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // Compress responses
  compress: true,
  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  // Suppress build warnings about missing packages
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  // Sentry organization and project (set SENTRY_ORG, SENTRY_PROJECT in CI)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Suppress source map upload logs during build
  silent: true,
  // Upload source maps in CI only (not in dev)
  sourcemaps: {
    disable: process.env.NODE_ENV !== 'production',
  },
  // Automatically tree-shake Sentry logger statements
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    // Disable automatic server-component wrapping in dev to prevent
    // webpack chunk evaluation interference (the "Cannot read 'call'" errors)
    autoInstrumentServerFunctions: process.env.NODE_ENV === 'production',
    autoInstrumentMiddleware: process.env.NODE_ENV === 'production',
    autoInstrumentAppDirectory: process.env.NODE_ENV === 'production',
  },
  // Tunnel Sentry events through your own domain to avoid ad-blockers
  tunnelRoute: '/monitoring',
});
