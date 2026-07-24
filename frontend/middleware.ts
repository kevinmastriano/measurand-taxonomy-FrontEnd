import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, If-None-Match',
  'Access-Control-Max-Age': '86400',
};

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

/** Stricter limit for search (chatty / scraper-friendly). */
const SEARCH_LIMIT = 60;
const SEARCH_WINDOW_MS = 60_000;
/** General public API budget per IP. */
const API_LIMIT = 300;
const API_WINDOW_MS = 60_000;

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CORS, security headers, method lockdown, and light IP rate limiting
 * for public read-only API routes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sync stays auth-gated in its route handler; still allow GET + CORS.
  if (!READ_METHODS.has(request.method)) {
    return NextResponse.json(
      { error: 'Method not allowed' },
      {
        status: 405,
        headers: {
          Allow: 'GET, HEAD, OPTIONS',
          ...CORS_HEADERS,
          ...SECURITY_HEADERS,
        },
      }
    );
  }

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS },
    });
  }

  // Rate limit public catalog/search (skip health/openapi/sync).
  const skipRateLimit =
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/openapi') ||
    pathname.startsWith('/api/sync');

  if (!skipRateLimit) {
    const ip = getClientIp(request);
    const isSearch = pathname.startsWith('/api/search');
    const result = checkRateLimit(
      `${isSearch ? 'search' : 'api'}:${ip}`,
      isSearch ? SEARCH_LIMIT : API_LIMIT,
      isSearch ? SEARCH_WINDOW_MS : API_WINDOW_MS
    );

    if (!result.allowed) {
      const retryAfter = Math.max(
        1,
        Math.ceil((result.resetAt - Date.now()) / 1000)
      );
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        {
          status: 429,
          headers: {
            ...CORS_HEADERS,
            ...SECURITY_HEADERS,
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
            'Cache-Control': 'private, no-store',
          },
        }
      );
    }

    const response = NextResponse.next();
    applyHeaders(response, {
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    });
    return response;
  }

  const response = NextResponse.next();
  applyHeaders(response, { ...CORS_HEADERS, ...SECURITY_HEADERS });
  return response;
}

function applyHeaders(response: NextResponse, headers: Record<string, string>) {
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
}

export const config = {
  matcher: '/api/:path*',
};
