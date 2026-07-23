import { describe, it, expect } from 'vitest';
import { RateLimiter } from '@/lib/rate-limit';

const T0 = 1_000_000;

describe('RateLimiter', () => {
  it('allows requests up to the limit within a window', () => {
    const limiter = new RateLimiter(3, 60_000);
    expect(limiter.check('ip1', T0).allowed).toBe(true);
    expect(limiter.check('ip1', T0 + 1).allowed).toBe(true);
    expect(limiter.check('ip1', T0 + 2).allowed).toBe(true);
    expect(limiter.check('ip1', T0 + 3).allowed).toBe(false);
  });

  it('reports remaining requests', () => {
    const limiter = new RateLimiter(3, 60_000);
    expect(limiter.check('ip1', T0).remaining).toBe(2);
    expect(limiter.check('ip1', T0).remaining).toBe(1);
    expect(limiter.check('ip1', T0).remaining).toBe(0);
    expect(limiter.check('ip1', T0).remaining).toBe(0);
  });

  it('tracks keys independently', () => {
    const limiter = new RateLimiter(1, 60_000);
    expect(limiter.check('ip1', T0).allowed).toBe(true);
    expect(limiter.check('ip2', T0).allowed).toBe(true);
    expect(limiter.check('ip1', T0).allowed).toBe(false);
    expect(limiter.check('ip2', T0).allowed).toBe(false);
  });

  it('resets after the window elapses', () => {
    const limiter = new RateLimiter(1, 60_000);
    expect(limiter.check('ip1', T0).allowed).toBe(true);
    expect(limiter.check('ip1', T0 + 59_999).allowed).toBe(false);
    expect(limiter.check('ip1', T0 + 60_000).allowed).toBe(true);
  });

  it('returns a sensible retryAfterSeconds when denied', () => {
    const limiter = new RateLimiter(1, 60_000);
    limiter.check('ip1', T0);
    const denied = limiter.check('ip1', T0 + 30_000);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBe(30);
  });

  it('bounds memory by evicting when over the key cap', () => {
    const limiter = new RateLimiter(1, 60_000, 100);
    for (let i = 0; i < 500; i++) {
      limiter.check(`ip${i}`, T0 + i);
    }
    // New keys are still tracked correctly after eviction
    const fresh = limiter.check('fresh', T0 + 1000);
    expect(fresh.allowed).toBe(true);
    expect(limiter.check('fresh', T0 + 1001).allowed).toBe(false);
  });
});
