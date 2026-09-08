import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/taxons/route';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import { makeTaxons } from './helpers/mock-taxons';

vi.mock('@/lib/taxonomy-loader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/taxonomy-loader')>();
  return {
    ...actual,
    loadTaxonomyDataStrict: vi.fn(),
  };
});

const request = (query = '') =>
  new Request(`http://localhost/api/taxons${query}`);

describe('GET /api/taxons', () => {
  beforeEach(() => {
    vi.mocked(loadTaxonomyDataStrict).mockResolvedValue(makeTaxons());
  });

  it('excludes deprecated taxons by default', async () => {
    const res = await GET(request());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(2);
    expect(body.total).toBe(3);
    expect(body.taxons.map((t: any) => t.name)).not.toContain('Measure.Legacy.Resistance');
  });

  it('includes deprecated taxons with deprecated=true', async () => {
    const res = await GET(request('?deprecated=true'));
    const body = await res.json();
    expect(body.count).toBe(3);
    expect(body.taxons.map((t: any) => t.name)).toContain('Measure.Legacy.Resistance');
  });

  it('excludes deprecated taxons with deprecated=false', async () => {
    const res = await GET(request('?deprecated=false'));
    const body = await res.json();
    expect(body.count).toBe(2);
  });

  it('rejects an invalid deprecated value with 400', async () => {
    const res = await GET(request('?deprecated=banana'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/deprecated/);
  });

  it('filters by discipline (exact match)', async () => {
    const res = await GET(request('?discipline=Electrical&deprecated=true'));
    const body = await res.json();
    expect(body.count).toBe(2);
    expect(body.taxons.every((t: any) =>
      t.Discipline.some((d: any) => d.name === 'Electrical')
    )).toBe(true);
  });

  it('returns an empty list for an unknown discipline', async () => {
    const res = await GET(request('?discipline=Bogus'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.count).toBe(0);
    expect(body.total).toBe(3);
  });

  it('rejects an over-long discipline with 400', async () => {
    const res = await GET(request(`?discipline=${'x'.repeat(101)}`));
    expect(res.status).toBe(400);
  });

  it('returns 503 when the taxonomy cannot be loaded', async () => {
    vi.mocked(loadTaxonomyDataStrict).mockRejectedValue(new TaxonomyLoadError('no data'));
    const res = await GET(request());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/unavailable/);
  });

  it('returns 500 on unexpected errors', async () => {
    vi.mocked(loadTaxonomyDataStrict).mockRejectedValue(new Error('boom'));
    const res = await GET(request());
    expect(res.status).toBe(500);
  });

  it('sets a CDN cache header on success', async () => {
    const res = await GET(request());
    expect(res.headers.get('cache-control')).toContain('s-maxage');
  });
});
