/**
 * Simple fixed-window rate limiter keyed by an arbitrary string (e.g. IP).
 *
 * Designed to run in Next.js edge middleware, so it uses only plain JS —
 * no Node APIs. State is per server/edge instance, which makes this an
 * abuse backstop rather than a hard global guarantee; pair it with
 * platform-level rate limiting (e.g. Vercel Firewall) for strict limits.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Requests left in the current window (0 when denied). */
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfterSeconds: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 10_000
  ) {}

  check(key: string, now: number = Date.now()): RateLimitResult {
    let bucket = this.buckets.get(key);

    if (!bucket || now - bucket.windowStart >= this.windowMs) {
      this.evictExpired(now);
      bucket = { count: 0, windowStart: now };
      this.buckets.set(key, bucket);
    }

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.windowStart + this.windowMs - now) / 1000)
    );

    if (bucket.count >= this.limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    bucket.count++;
    return {
      allowed: true,
      remaining: this.limit - bucket.count,
      retryAfterSeconds,
    };
  }

  /** Keep memory bounded: drop expired buckets, then oldest if still over cap. */
  private evictExpired(now: number): void {
    if (this.buckets.size < this.maxKeys) return;

    for (const [key, bucket] of this.buckets) {
      if (now - bucket.windowStart >= this.windowMs) {
        this.buckets.delete(key);
      }
    }

    // Still over cap (e.g. a flood of distinct keys inside one window):
    // drop oldest entries (Map preserves insertion order).
    while (this.buckets.size >= this.maxKeys) {
      const oldest = this.buckets.keys().next();
      if (oldest.done) break;
      this.buckets.delete(oldest.value);
    }
  }
}
