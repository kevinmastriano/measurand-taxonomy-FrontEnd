import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

const request = (
  path: string,
  { ip = '1.2.3.4', method = 'GET' }: { ip?: string; method?: string } = {}
) =>
  new NextRequest(`http://localhost${path}`, {
    method,
    headers: { 'x-forwarded-for': ip },
  });

describe('API middleware', () => {
  it('lets normal API traffic through with CORS and rate-limit headers', () => {
    const res = middleware(request('/api/taxons', { ip: '10.0.0.1' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('x-ratelimit-limit')).toBe('120');
    expect(Number(res.headers.get('x-ratelimit-remaining'))).toBeLessThan(120);
  });

  it('answers CORS preflight directly with 204', () => {
    const res = middleware(request('/api/taxons', { method: 'OPTIONS' }));
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-methods')).toContain('GET');
  });

  it('rate-limits the expensive sync endpoint after 5 requests/min', () => {
    const ip = '10.9.9.9';
    for (let i = 0; i < 5; i++) {
      const res = middleware(request('/api/sync-taxonomy', { ip }));
      expect(res.status).toBe(200);
      expect(res.headers.get('x-ratelimit-limit')).toBe('5');
    }
    const denied = middleware(request('/api/sync-taxonomy', { ip }));
    expect(denied.status).toBe(429);
    expect(denied.headers.get('retry-after')).toBeTruthy();
  });

  it('applies the strict limit to the history reset endpoint', () => {
    const ip = '10.8.8.8';
    const res = middleware(
      request('/api/history/taxonomy/reset', { ip, method: 'POST' })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get('x-ratelimit-limit')).toBe('5');
  });

  it('tracks different client IPs independently', () => {
    const resA = middleware(request('/api/sync-taxonomy', { ip: '10.7.7.7' }));
    const resB = middleware(request('/api/sync-taxonomy', { ip: '10.7.7.8' }));
    expect(resA.headers.get('x-ratelimit-remaining')).toBe('4');
    expect(resB.headers.get('x-ratelimit-remaining')).toBe('4');
  });

  it('rate-limits general API traffic after 120 requests/min', () => {
    const ip = '10.6.6.6';
    let denied: Response | null = null;
    for (let i = 0; i < 121; i++) {
      const res = middleware(request('/api/search?q=x', { ip }));
      if (res.status === 429) {
        denied = res;
        break;
      }
    }
    expect(denied).not.toBeNull();
    expect(denied!.headers.get('access-control-allow-origin')).toBe('*');
  });
});
