import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/search/route';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import { makeTaxons } from './helpers/mock-taxons';

vi.mock('@/lib/taxonomy-loader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/taxonomy-loader')>();
  return {
    ...actual,
    loadTaxonomyDataStrict: vi.fn(),
  };
});

const request = (query: string) =>
  new Request(`http://localhost/api/search${query}`);

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.mocked(loadTaxonomyDataStrict).mockResolvedValue(makeTaxons());
  });

  it('requires the q parameter', async () => {
    const res = await GET(request(''));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/"q" is required/);
  });

  it('rejects a whitespace-only query', async () => {
    const res = await GET(request('?q=%20%20'));
    expect(res.status).toBe(400);
  });

  it('rejects an over-long query with 400', async () => {
    const res = await GET(request(`?q=${'a'.repeat(201)}`));
    expect(res.status).toBe(400);
  });

  it('matches taxon names case-insensitively', async () => {
    const res = await GET(request('?q=voltage'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results.map((t: any) => t.name)).toContain('Measure.Voltage.DC');
  });

  it('matches on definitions', async () => {
    const res = await GET(request('?q=direct-current'));
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.results[0].name).toBe('Measure.Voltage.DC');
  });

  it('matches on discipline names', async () => {
    const res = await GET(request('?q=mechanical'));
    const body = await res.json();
    expect(body.results.map((t: any) => t.name)).toContain('Measure.Acceleration');
  });

  it('matches on parameter names', async () => {
    const res = await GET(request('?q=frequency'));
    const body = await res.json();
    expect(body.results.map((t: any) => t.name)).toContain('Measure.Acceleration');
  });

  it('returns empty results for a non-matching query', async () => {
    const res = await GET(request('?q=zzzznotfound'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.count).toBe(0);
    expect(body.results).toEqual([]);
  });

  it('applies the limit parameter and reports totalMatches', async () => {
    const res = await GET(request('?q=measure&limit=1'));
    const body = await res.json();
    expect(body.count).toBe(1);
    expect(body.results).toHaveLength(1);
    expect(body.totalMatches).toBe(3);
  });

  it('rejects an invalid limit with 400', async () => {
    const res = await GET(request('?q=measure&limit=abc'));
    expect(res.status).toBe(400);
  });

  it('returns 503 when the taxonomy cannot be loaded', async () => {
    vi.mocked(loadTaxonomyDataStrict).mockRejectedValue(new TaxonomyLoadError('no data'));
    const res = await GET(request('?q=voltage'));
    expect(res.status).toBe(503);
  });
});
