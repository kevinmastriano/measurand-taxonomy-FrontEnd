import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

/** CDN cache aligned with hourly GitHub revalidate in taxonomy-loader. */
export const CATALOG_CACHE_CONTROL =
  'public, s-maxage=3600, stale-while-revalidate=86400';

/** Short CDN cache for search (query-specific, higher churn). */
export const SEARCH_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=300';

/** Never cache mutative / status endpoints. */
export const NO_STORE_CACHE_CONTROL = 'private, no-store, max-age=0';

const BASE_SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

export interface JsonResponseOptions {
  status?: number;
  cacheControl?: string;
  /** When set, supports If-None-Match → 304. */
  request?: Request;
  headers?: Record<string, string>;
}

/**
 * JSON response with security headers, optional CDN cache, and weak ETag.
 */
export function jsonResponse(
  body: unknown,
  options: JsonResponseOptions = {}
): NextResponse {
  const { status = 200, cacheControl, request, headers: extra = {} } = options;
  const payload = JSON.stringify(body);
  const etag = `W/"${createHash('sha1').update(payload).digest('hex')}"`;

  if (request && cacheControl) {
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch && ifNoneMatch === etag) {
      const notModified = new NextResponse(null, { status: 304 });
      applyCommonHeaders(notModified, cacheControl, etag, extra);
      return notModified;
    }
  }

  const response = new NextResponse(payload, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
  applyCommonHeaders(response, cacheControl, etag, extra);
  return response;
}

function applyCommonHeaders(
  response: NextResponse,
  cacheControl: string | undefined,
  etag: string,
  extra: Record<string, string>
) {
  for (const [key, value] of Object.entries(BASE_SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (cacheControl) {
    response.headers.set('Cache-Control', cacheControl);
  }
  response.headers.set('ETag', etag);
  for (const [key, value] of Object.entries(extra)) {
    response.headers.set(key, value);
  }
}

export function errorResponse(
  error: string,
  status: number,
  extraHeaders?: Record<string, string>
) {
  return jsonResponse(
    { error },
    { status, cacheControl: NO_STORE_CACHE_CONTROL, headers: extraHeaders }
  );
}

export function methodNotAllowed(allow = 'GET, HEAD, OPTIONS') {
  return errorResponse('Method not allowed', 405, { Allow: allow });
}
