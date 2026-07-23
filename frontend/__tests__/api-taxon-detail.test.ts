import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/taxons/[name]/route';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import { makeTaxons } from './helpers/mock-taxons';

vi.mock('@/lib/taxonomy-loader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/taxonomy-loader')>();
  return {
    ...actual,
    loadTaxonomyDataStrict: vi.fn(),
  };
});

const call = (name: string) =>
  GET(new Request(`http://localhost/api/taxons/${name}`), { params: { name } });

describe('GET /api/taxons/[name]', () => {
  beforeEach(() => {
    vi.mocked(loadTaxonomyDataStrict).mockResolvedValue(makeTaxons());
  });

  it('returns the taxon by exact name', async () => {
    const res = await call('Measure.Voltage.DC');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Measure.Voltage.DC');
    expect(body.Result.Quantity.name).toBe('voltage');
  });

  it('decodes percent-encoded names', async () => {
    const res = await call(encodeURIComponent('Measure.Voltage.DC'));
    expect(res.status).toBe(200);
  });

  it('returns 404 for an unknown taxon', async () => {
    const res = await call('Measure.Does.Not.Exist');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Taxon not found');
  });

  it('returns 400 for malformed percent-encoding instead of 500', async () => {
    const res = await call('%zz');
    expect(res.status).toBe(400);
  });

  it('returns 400 for an over-long name', async () => {
    const res = await call('x'.repeat(300));
    expect(res.status).toBe(400);
  });

  it('returns 503 when the taxonomy cannot be loaded', async () => {
    vi.mocked(loadTaxonomyDataStrict).mockRejectedValue(new TaxonomyLoadError('no data'));
    const res = await call('Measure.Voltage.DC');
    expect(res.status).toBe(503);
  });
});
