import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import {
  loadTaxonomyData,
  loadTaxonomyDataStrict,
  clearTaxonomyCache,
  TaxonomyLoadError,
} from '@/lib/taxonomy-loader';
import { findTaxonomyXML } from '@/lib/taxonomy-file-finder';

vi.mock('@/lib/taxonomy-file-finder', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/taxonomy-file-finder')>();
  return {
    ...actual,
    findTaxonomyXML: vi.fn(),
  };
});

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'taxonomy.xml');

describe('taxonomy loader', () => {
  beforeEach(() => {
    clearTaxonomyCache();
    vi.mocked(findTaxonomyXML).mockReturnValue(FIXTURE_PATH);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearTaxonomyCache();
  });

  it('loads and parses taxons from a local file', async () => {
    const taxons = await loadTaxonomyDataStrict();
    expect(taxons).toHaveLength(3);
    expect(taxons[0].name).toBe('Measure.Acceleration');
  });

  it('caches parsed taxons in memory for an unchanged file', async () => {
    const first = await loadTaxonomyDataStrict();
    const second = await loadTaxonomyDataStrict();
    // Same array instance means the parse was not repeated
    expect(second).toBe(first);
  });

  it('re-parses after the cache is cleared', async () => {
    const first = await loadTaxonomyDataStrict();
    clearTaxonomyCache();
    const second = await loadTaxonomyDataStrict();
    expect(second).not.toBe(first);
    expect(second).toEqual(first);
  });

  it('throws TaxonomyLoadError when no local file exists and GitHub fails', async () => {
    vi.mocked(findTaxonomyXML).mockReturnValue(null);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await expect(loadTaxonomyDataStrict()).rejects.toThrow(TaxonomyLoadError);
  });

  it('throws TaxonomyLoadError when GitHub returns a non-OK response', async () => {
    vi.mocked(findTaxonomyXML).mockReturnValue(null);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('not found', { status: 404, statusText: 'Not Found' }))
    );

    await expect(loadTaxonomyDataStrict()).rejects.toThrow(/GitHub returned 404/);
  });

  it('falls back to GitHub when no local file exists', async () => {
    vi.mocked(findTaxonomyXML).mockReturnValue(null);
    const fs = await import('fs');
    const xml = fs.readFileSync(FIXTURE_PATH, 'utf-8');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(xml, { status: 200 })));

    const taxons = await loadTaxonomyDataStrict();
    expect(taxons).toHaveLength(3);
  });

  it('loadTaxonomyData returns [] instead of throwing (page-safe wrapper)', async () => {
    vi.mocked(findTaxonomyXML).mockReturnValue(null);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const taxons = await loadTaxonomyData();
    expect(taxons).toEqual([]);
  });
});
