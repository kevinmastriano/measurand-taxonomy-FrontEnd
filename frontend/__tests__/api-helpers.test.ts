import { describe, it, expect, afterEach } from 'vitest';
import {
  parseBooleanParam,
  parseLimitParam,
  safeDecodeURIComponent,
  isCronAuthorized,
} from '@/lib/api-helpers';

describe('parseBooleanParam', () => {
  it('returns null when absent', () => {
    expect(parseBooleanParam(null)).toBeNull();
  });

  it('parses true/false and 1/0 (case-insensitive)', () => {
    expect(parseBooleanParam('true')).toBe(true);
    expect(parseBooleanParam('TRUE')).toBe(true);
    expect(parseBooleanParam('1')).toBe(true);
    expect(parseBooleanParam('false')).toBe(false);
    expect(parseBooleanParam('False')).toBe(false);
    expect(parseBooleanParam('0')).toBe(false);
  });

  it('returns undefined for invalid values', () => {
    expect(parseBooleanParam('')).toBeUndefined();
    expect(parseBooleanParam('yes')).toBeUndefined();
    expect(parseBooleanParam('garbage')).toBeUndefined();
  });
});

describe('parseLimitParam', () => {
  it('returns null when absent', () => {
    expect(parseLimitParam(null, 500)).toBeNull();
  });

  it('parses positive integers and clamps to max', () => {
    expect(parseLimitParam('10', 500)).toBe(10);
    expect(parseLimitParam('9999', 500)).toBe(500);
  });

  it('returns undefined for invalid values', () => {
    expect(parseLimitParam('0', 500)).toBeUndefined();
    expect(parseLimitParam('-5', 500)).toBeUndefined();
    expect(parseLimitParam('abc', 500)).toBeUndefined();
    expect(parseLimitParam('1.5', 500)).toBeUndefined();
  });
});

describe('safeDecodeURIComponent', () => {
  it('decodes valid input', () => {
    expect(safeDecodeURIComponent('Measure.Acceleration')).toBe('Measure.Acceleration');
    expect(safeDecodeURIComponent('a%20b')).toBe('a b');
  });

  it('returns null for malformed input instead of throwing', () => {
    expect(safeDecodeURIComponent('%')).toBeNull();
    expect(safeDecodeURIComponent('%zz')).toBeNull();
  });
});

describe('isCronAuthorized', () => {
  const originalSecret = process.env.CRON_SECRET;

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  const request = (auth?: string) =>
    new Request('http://localhost/api/sync-taxonomy', {
      headers: auth ? { authorization: auth } : {},
    });

  it('allows all requests when no secret is configured', () => {
    delete process.env.CRON_SECRET;
    expect(isCronAuthorized(request())).toBe(true);
  });

  it('rejects missing or wrong tokens when a secret is configured', () => {
    process.env.CRON_SECRET = 'shhh-secret';
    expect(isCronAuthorized(request())).toBe(false);
    expect(isCronAuthorized(request('Bearer wrong'))).toBe(false);
    expect(isCronAuthorized(request('shhh-secret'))).toBe(false);
  });

  it('accepts the correct bearer token', () => {
    process.env.CRON_SECRET = 'shhh-secret';
    expect(isCronAuthorized(request('Bearer shhh-secret'))).toBe(true);
  });
});
