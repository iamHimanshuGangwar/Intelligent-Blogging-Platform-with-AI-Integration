/**
 * Rate limiting utility using Upstash Redis.
 * Falls back to an in-memory map when UPSTASH_REDIS_REST_URL is not configured
 * so development environments work without Redis.
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Types ─────────────────────────────────────────────────────────────────────

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Human-readable window label (e.g. "1 minute") */
  windowLabel?: string;
}

// ── In-memory fallback (for environments without Upstash) ─────────────────────

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function inMemoryCheck(key: string, limit: number, windowMs: number): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const entry = inMemoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, reset: entry.resetAt };
}

// ── Upstash Ratelimit (lazy-loaded so build doesn't fail without env vars) ────

let upstashReady = false;
let Ratelimit: typeof import('@upstash/ratelimit').Ratelimit;
let Redis: typeof import('@upstash/redis').Redis;

async function getUpstashRatelimit(config: RateLimitConfig) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!upstashReady) {
    try {
      const rl = await import('@upstash/ratelimit');
      const r = await import('@upstash/redis');
      Ratelimit = rl.Ratelimit;
      Redis = r.Redis;
      upstashReady = true;
    } catch {
      return null;
    }
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${config.windowSeconds} s`),
    analytics: false,
  });
}

// ── Core check function ───────────────────────────────────────────────────────

/**
 * Get the best identifier for rate limiting: IP > forwarded IP > 'anonymous'
 */
export function getRequestIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    if (ip && ip !== '::1' && ip !== '127.0.0.1') return ip;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'anonymous';
}

/**
 * Check rate limit for a given key.
 * Returns a 429 Response if rate limited, or null if allowed.
 */
export async function checkRateLimit(
  _request: NextRequest,
  identifier: string,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const windowLabel = config.windowLabel || `${config.windowSeconds} seconds`;
  const ratelimit = await getUpstashRatelimit(config);

  let success: boolean;
  let reset: number;

  if (ratelimit) {
    const result = await ratelimit.limit(identifier);
    success = result.success;
    reset = result.reset;
  } else {
    const result = inMemoryCheck(identifier, config.limit, config.windowSeconds * 1000);
    success = result.success;
    reset = result.reset;
  }

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${config.limit} requests per ${windowLabel}. Please try again later.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
        },
      }
    );
  }

  return null;
}

// ── Preset configurations ─────────────────────────────────────────────────────

export const RATE_LIMITS = {
  /** AI generation — expensive, limit strictly */
  AI_GENERATE: { limit: 10, windowSeconds: 60, windowLabel: '1 minute' },
  /** Auth endpoints — prevent brute force */
  AUTH: { limit: 10, windowSeconds: 60, windowLabel: '1 minute' },
  /** OTP sends — very restricted */
  OTP_SEND: { limit: 5, windowSeconds: 300, windowLabel: '5 minutes' },
  /** Public API reads — generous */
  PUBLIC_READ: { limit: 100, windowSeconds: 60, windowLabel: '1 minute' },
  /** Comment/post creation */
  WRITE: { limit: 20, windowSeconds: 60, windowLabel: '1 minute' },
  /** Newsletter signups */
  NEWSLETTER: { limit: 3, windowSeconds: 300, windowLabel: '5 minutes' },
} as const;
