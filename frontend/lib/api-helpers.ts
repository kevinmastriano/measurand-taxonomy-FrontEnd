import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * Shared helpers for API route handlers: consistent error responses,
 * query parameter validation, and cron authorization.
 */

/** Standard cache headers for read-only taxonomy endpoints (CDN caches for 5 min). */
export const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export function apiError(
  message: string,
  status: number,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * Parse an optional boolean query parameter.
 * Returns null when the parameter is absent, undefined when it is invalid.
 */
export function parseBooleanParam(value: string | null): boolean | null | undefined {
  if (value === null) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return undefined;
}

/**
 * Parse an optional positive-integer query parameter, clamped to `max`.
 * Returns null when absent, undefined when invalid.
 */
export function parseLimitParam(
  value: string | null,
  max: number
): number | null | undefined {
  if (value === null) return null;
  if (!/^\d+$/.test(value.trim())) return undefined;
  const parsed = parseInt(value, 10);
  if (parsed < 1) return undefined;
  return Math.min(parsed, max);
}

/** decodeURIComponent that returns null instead of throwing on malformed input. */
export function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Verify the Authorization header against CRON_SECRET using a
 * constant-time comparison. When no CRON_SECRET is configured the
 * request is allowed (matches previous behavior for local development).
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;

  const header = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const headerBuffer = Buffer.from(header);
  const expectedBuffer = Buffer.from(expected);
  if (headerBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(headerBuffer, expectedBuffer);
}
