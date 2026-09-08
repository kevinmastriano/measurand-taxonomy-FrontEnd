import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limit';

/**
 * Edge middleware for all /api/* routes:
 * - Per-IP rate limiting (backstop against abuse / runaway bills; pair
 *   with Vercel Firewall rules for hard guarantees)
 * - CORS headers so the public read-only API is usable from other origins
 */

// Generous limit for cheap, CDN-cached read endpoints.
const GENERAL_LIMIT = 120; // requests per window per IP
// Strict limit for endpoints that trigger downloads or cache rebuilds.
const EXPENSIVE_LIMIT = 5;
const WINDOW_MS = 60_000;

const generalLimiter = new RateLimiter(GENERAL_LIMIT, WINDOW_MS);
const expensiveLimiter = new RateLimiter(EXPENSIVE_LIMIT, WINDOW_MS);

const EXPENSIVE_PATHS = ['/api/sync-taxonomy', '/api/history/taxonomy/reset'];

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function clientKey(request: NextRequest): string {
  return (
    request.ip ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}

export function middleware(request: NextRequest) {
  // CORS preflight never needs to hit a route handler.
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }

  const pathname = request.nextUrl.pathname;
  const isExpensive = EXPENSIVE_PATHS.some(p => pathname.startsWith(p));
  const limiter = isExpensive ? expensiveLimiter : generalLimiter;
  const limit = isExpensive ? EXPENSIVE_LIMIT : GENERAL_LIMIT;

  const result = limiter.check(clientKey(request));

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and retry shortly.' },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          'Retry-After': String(result.retryAfterSeconds),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
