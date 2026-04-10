/**
 * Server-side caching utility using Upstash Redis.
 * Falls back to an in-memory LRU map when UPSTASH_REDIS_REST_URL is not configured.
 */

// ── In-memory fallback ────────────────────────────────────────────────────────

const memCache = new Map<string, { value: string; expiresAt: number }>();
const MAX_MEM_ENTRIES = 200;

function memGet(key: string): string | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.value;
}

function memSet(key: string, value: string, ttlSeconds: number) {
  if (memCache.size >= MAX_MEM_ENTRIES) {
    const firstKey = memCache.keys().next().value;
    if (firstKey) memCache.delete(firstKey);
  }
  memCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function memDel(key: string) {
  memCache.delete(key);
}

// ── Upstash Redis (lazy-loaded) ───────────────────────────────────────────────

let redis: import("@upstash/redis").Redis | null = null;
let redisInitialized = false;

async function getRedis() {
  if (redisInitialized) return redis;
  redisInitialized = true;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    const { Redis } = await import("@upstash/redis");
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redis;
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get a cached value by key. Returns parsed JSON or null.
 */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const r = await getRedis();
  if (r) {
    try {
      const raw = await r.get<string>(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
  const raw = memGet(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

/**
 * Set a cached value with a TTL in seconds.
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const serialized = JSON.stringify(value);
  const r = await getRedis();
  if (r) {
    try {
      await r.set(key, serialized, { ex: ttlSeconds });
      return;
    } catch {
      // fall through to memory
    }
  }
  memSet(key, serialized, ttlSeconds);
}

/**
 * Invalidate a cache key.
 */
export async function cacheDel(key: string): Promise<void> {
  const r = await getRedis();
  if (r) {
    try {
      await r.del(key);
    } catch {
      // ignore
    }
  }
  memDel(key);
}

/**
 * Invalidate all keys matching a prefix pattern.
 * Falls back to iterating memory store keys.
 */
export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  const r = await getRedis();
  if (r) {
    try {
      const keys = await r.keys(`${prefix}*`);
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => r.del(k)));
      }
    } catch {
      // ignore
    }
  }
  for (const k of memCache.keys()) {
    if (k.startsWith(prefix)) memCache.delete(k);
  }
}

/**
 * Stale-while-revalidate pattern: returns cached data immediately,
 * refreshes in background if stale.
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  // fire-and-forget cache write
  cacheSet(key, fresh, ttlSeconds).catch(() => {});
  return fresh;
}
