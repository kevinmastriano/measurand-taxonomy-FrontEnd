import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/sync-taxonomy/route';
import { syncTaxonomy } from '@/scripts/sync-taxonomy-v2';

vi.mock('@/scripts/sync-taxonomy-v2', () => ({
  syncTaxonomy: vi.fn(),
  FILES_TO_SYNC: [
    'MeasurandTaxonomyCatalog.xml',
    'MeasurandTaxonomyCatalog.xsd',
    'MeasurandTaxonomyProperties.xml',
    'LICENSE',
    'COPYRIGHT',
  ],
}));

const originalSecret = process.env.CRON_SECRET;

const request = (query = '', auth?: string) =>
  new Request(`http://localhost/api/sync-taxonomy${query}`, {
    headers: auth ? { authorization: auth } : {},
  });

describe('GET /api/sync-taxonomy', () => {
  beforeEach(() => {
    delete process.env.CRON_SECRET;
    vi.mocked(syncTaxonomy).mockResolvedValue({
      success: true,
      updated: true,
      commitSHA: 'abc123',
      downloaded: 2,
      skipped: 3,
      failed: 0,
    } as any);
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  it('returns 401 without the bearer token when CRON_SECRET is set', async () => {
    process.env.CRON_SECRET = 'topsecret';
    const res = await GET(request());
    expect(res.status).toBe(401);
    expect(syncTaxonomy).not.toHaveBeenCalled();
  });

  it('accepts the correct bearer token when CRON_SECRET is set', async () => {
    process.env.CRON_SECRET = 'topsecret';
    const res = await GET(request('?wait=true', 'Bearer topsecret'));
    expect(res.status).toBe(200);
    expect(syncTaxonomy).toHaveBeenCalledOnce();
  });

  it('defaults to skipping the history rebuild', async () => {
    await GET(request('?wait=true'));
    expect(syncTaxonomy).toHaveBeenCalledWith(
      expect.objectContaining({ skipHistory: true })
    );
  });

  it('honors skipHistory=false (nightly cron rebuilds history)', async () => {
    // Regression test: this used to be forced to true by `skipHistory || true`
    await GET(request('?wait=true&skipHistory=false'));
    expect(syncTaxonomy).toHaveBeenCalledWith(
      expect.objectContaining({ skipHistory: false })
    );
  });

  it('rejects an invalid skipHistory value with 400', async () => {
    const res = await GET(request('?skipHistory=banana'));
    expect(res.status).toBe(400);
    expect(syncTaxonomy).not.toHaveBeenCalled();
  });

  it('passes validated file lists through to the sync', async () => {
    await GET(request('?wait=true&file=LICENSE,COPYRIGHT'));
    expect(syncTaxonomy).toHaveBeenCalledWith(
      expect.objectContaining({ files: ['LICENSE', 'COPYRIGHT'] })
    );
  });

  it('rejects unknown file names with 400 (no path traversal)', async () => {
    const res = await GET(request('?file=../../etc/passwd'));
    expect(res.status).toBe(400);
    expect(syncTaxonomy).not.toHaveBeenCalled();
  });

  it('returns a background-processing response when wait is not set', async () => {
    const res = await GET(request());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.processing).toBe(true);
  });

  it('returns sync details when wait=true', async () => {
    const res = await GET(request('?wait=true'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.updated).toBe(true);
    expect(body.commitSHA).toBe('abc123');
  });

  it('returns 409 when a sync is already running (wait=true)', async () => {
    vi.mocked(syncTaxonomy).mockResolvedValue({
      success: false,
      error: 'Sync already in progress',
      alreadyRunning: true,
    } as any);
    const res = await GET(request('?wait=true'));
    expect(res.status).toBe(409);
  });

  it('returns 500 when the sync fails (wait=true)', async () => {
    vi.mocked(syncTaxonomy).mockResolvedValue({
      success: false,
      error: 'download failed',
    } as any);
    const res = await GET(request('?wait=true'));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('download failed');
  });
});
