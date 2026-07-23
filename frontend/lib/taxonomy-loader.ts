import fs from 'fs';
import { parseTaxonomyXML } from './xml-parser';
import { findTaxonomyXML, getTaxonomySearchPaths } from './taxonomy-file-finder';
import { Taxon } from './types';

const GITHUB_XML_URL = 'https://raw.githubusercontent.com/NCSLI-MII/measurand-taxonomy/main/MeasurandTaxonomyCatalog.xml';

// How long a GitHub-fetched copy is considered fresh (local files are
// invalidated by mtime/size instead, so a sync picks up immediately).
const GITHUB_CACHE_TTL_MS = 60 * 60 * 1000;

/** Thrown when the taxonomy cannot be loaded from any source. */
export class TaxonomyLoadError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'TaxonomyLoadError';
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

interface CacheEntry {
  taxons: Taxon[];
  key: string;
  loadedAt: number;
}

let cache: CacheEntry | null = null;

/** Drop the in-memory taxonomy cache (used by tests and after manual syncs). */
export function clearTaxonomyCache(): void {
  cache = null;
}

function localCacheKey(xmlPath: string): string {
  const stats = fs.statSync(xmlPath);
  return `${xmlPath}:${stats.mtimeMs}:${stats.size}`;
}

async function loadFromLocalFile(xmlPath: string): Promise<Taxon[]> {
  const key = localCacheKey(xmlPath);
  if (cache && cache.key === key) {
    return cache.taxons;
  }

  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  const taxons = await parseTaxonomyXML(xmlContent);
  if (taxons.length === 0) {
    throw new TaxonomyLoadError(
      `Taxonomy file at ${xmlPath} parsed to zero taxons; the file may be malformed`
    );
  }

  cache = { taxons, key, loadedAt: Date.now() };
  return taxons;
}

async function loadFromGitHub(): Promise<Taxon[]> {
  if (
    cache &&
    cache.key === GITHUB_XML_URL &&
    Date.now() - cache.loadedAt < GITHUB_CACHE_TTL_MS
  ) {
    return cache.taxons;
  }

  let response: Response;
  try {
    response = await fetch(GITHUB_XML_URL, {
      next: { revalidate: 3600 },
    } as RequestInit);
  } catch (fetchError) {
    throw new TaxonomyLoadError(
      `Taxonomy XML not found locally and the GitHub fallback request failed: ${
        fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }`,
      { cause: fetchError }
    );
  }

  if (!response.ok) {
    throw new TaxonomyLoadError(
      `Taxonomy XML not found locally and GitHub returned ${response.status} ${response.statusText}`
    );
  }

  const xmlContent = await response.text();
  const taxons = await parseTaxonomyXML(xmlContent);
  if (taxons.length === 0) {
    throw new TaxonomyLoadError(
      'Taxonomy XML fetched from GitHub parsed to zero taxons; the file may be malformed'
    );
  }

  cache = { taxons, key: GITHUB_XML_URL, loadedAt: Date.now() };
  return taxons;
}

/**
 * Load taxonomy data, throwing TaxonomyLoadError on failure.
 * Sources, in order of preference:
 * 1. Synced data directory (data/taxonomy/) - for production
 * 2. Parent directory (../) - for development
 * 3. Current directory - fallback
 * 4. GitHub - fallback for Vercel before the sync cron has run
 *
 * Results are cached in memory; local files are re-read when their
 * mtime or size changes (e.g. after a sync).
 */
export async function loadTaxonomyDataStrict(): Promise<Taxon[]> {
  const xmlPath = findTaxonomyXML();
  if (xmlPath) {
    return loadFromLocalFile(xmlPath);
  }

  console.warn(
    'Taxonomy XML not found locally; falling back to GitHub. Searched paths:',
    getTaxonomySearchPaths()
  );
  return loadFromGitHub();
}

/**
 * Load taxonomy data, returning an empty array on failure.
 * Server components use this so pages degrade gracefully; API routes
 * should use loadTaxonomyDataStrict() so failures surface as 503s.
 */
export async function loadTaxonomyData(): Promise<Taxon[]> {
  try {
    return await loadTaxonomyDataStrict();
  } catch (error) {
    console.error('Error loading taxonomy:', error);
    return [];
  }
}
