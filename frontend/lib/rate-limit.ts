/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Suitable as a first line of defense on a single Vercel instance.
 * For multi-region / heavy traffic, also enable Vercel Firewall or
 * an external store (e.g. Upstash Redis).
 */

interface WindowState {
  count: number;
  resetAt: number;
}

const windows = new Map<string, WindowState>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowMs;
    windows.set(key, { count: 1, resetAt });
    // Opportunistic cleanup to keep the map bounded
    if (windows.size > 5000) {
      for (const [k, v] of windows) {
        if (now >= v.resetAt) windows.delete(k);
      }
    }
    return { allowed: true, limit, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  return {
    allowed: existing.count <= limit,
    limit,
    remaining,
    resetAt: existing.resetAt,
  };
}

/** Client IP from common proxy headers (Vercel / reverse proxy). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
