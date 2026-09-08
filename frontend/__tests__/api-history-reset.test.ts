import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { POST } from '@/app/api/history/taxonomy/reset/route';

const CACHE_PATH = path.join(process.cwd(), '.next', 'cache', 'taxonomy-history-cache.json');

describe('POST /api/history/taxonomy/reset', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deletes the cache file when it exists', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, '{}');

    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(fs.existsSync(CACHE_PATH)).toBe(false);
  });

  it('throttles rapid repeated resets with 429', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:05Z'));
    const res = await POST();
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('succeeds even when the cache file does not exist (after throttle window)', async () => {
    vi.setSystemTime(new Date('2026-01-01T01:00:00Z'));
    if (fs.existsSync(CACHE_PATH)) fs.rmSync(CACHE_PATH);

    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/does not exist/);
  });
});
