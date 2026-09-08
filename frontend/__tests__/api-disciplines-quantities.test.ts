import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getDisciplines } from '@/app/api/disciplines/route';
import { GET as getQuantities } from '@/app/api/quantities/route';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import { makeTaxons } from './helpers/mock-taxons';

vi.mock('@/lib/taxonomy-loader', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/taxonomy-loader')>();
  return {
    ...actual,
    loadTaxonomyDataStrict: vi.fn(),
  };
});

beforeEach(() => {
  vi.mocked(loadTaxonomyDataStrict).mockResolvedValue(makeTaxons());
});

describe('GET /api/disciplines', () => {
  it('returns discipline summaries with taxon counts', async () => {
    const res = await getDisciplines();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBeGreaterThan(0);

    const names = body.disciplines.map((d: any) => d.name);
    expect(names).toContain('Mechanical');
    expect(names).toContain('Electrical');

    const mechanical = body.disciplines.find((d: any) => d.name === 'Mechanical');
    expect(mechanical.taxonCount).toBe(1);
  });

  it('returns 503 when the taxonomy cannot be loaded', async () => {
    vi.mocked(loadTaxonomyDataStrict).mockRejectedValue(new TaxonomyLoadError('no data'));
    const res = await getDisciplines();
    expect(res.status).toBe(503);
  });
});

describe('GET /api/quantities', () => {
  it('returns quantity kinds keyed by mLayer aspect and id', async () => {
    const res = await getQuantities();
    expect(res.status).toBe(200);
    const body = await res.json();

    const voltage = body.quantities.find((q: any) => q.name === 'voltage');
    expect(voltage).toBeDefined();
    expect(voltage.aspect).toBe('electromagnetics');
    expect(voltage.id).toBe('Q3');
    expect(voltage.disciplines).toContain('Electrical');
  });

  it('returns 503 when the taxonomy cannot be loaded', async () => {
    vi.mocked(loadTaxonomyDataStrict).mockRejectedValue(new TaxonomyLoadError('no data'));
    const res = await getQuantities();
    expect(res.status).toBe(503);
  });
});
