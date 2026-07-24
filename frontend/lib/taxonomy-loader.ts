import fs from 'fs';
import { parseTaxonomyXML } from './xml-parser';
import { findTaxonomyXML, getTaxonomySearchPaths } from './taxonomy-file-finder';
import { Taxon } from './types';

const GITHUB_XML_URL = 'https://raw.githubusercontent.com/NCSLI-MII/measurand-taxonomy/main/MeasurandTaxonomyCatalog.xml';

/**
 * Next.js cache tag for taxonomy data.
 *
 * All server-side reads of the catalog share this tag, so the daily cron
 * (see app/api/sync-taxonomy/route.ts) can call `revalidateTag(TAXONOMY_TAG)`
 * to pull fresh data from GitHub on the next request — without writing to the
 * (read-only on Vercel) filesystem.
 */
export const TAXONOMY_TAG = 'taxonomy';

// Revalidate the upstream fetch at most once an hour on its own; the cron
// forces an earlier refresh via revalidateTag.
export const REVALIDATE_SECONDS = 60 * 60;

/**
 * Fetch the raw taxonomy XML.
 *
 * Strategy (Path A — no runtime disk writes, ISR-based freshness):
 *  - In development, prefer a local file so local edits to the XML are visible.
 *  - In production (Vercel), fetch from GitHub with ISR caching so the daily
 *    cron can refresh the cache tag instead of writing files to a read-only FS.
 *  - If the network fetch fails, fall back to the bundled local file so the app
 *    still serves data offline / during a GitHub outage.
 */
async function getTaxonomyXML(): Promise<string> {
  const isProd = process.env.NODE_ENV === 'production';

  // Development: local-first so editing the local XML is reflected immediately.
  if (!isProd) {
    const localPath = findTaxonomyXML();
    if (localPath) {
      console.log('[Taxonomy] (dev) Loading XML from local file:', localPath);
      return fs.readFileSync(localPath, 'utf-8');
    }
  }

  // Production: GitHub-first with ISR so revalidateTag() keeps data fresh.
  try {
    console.log('[Taxonomy] Fetching XML from GitHub (ISR):', GITHUB_XML_URL);
    const response = await fetch(GITHUB_XML_URL, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [TAXONOMY_TAG] },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from GitHub: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (fetchError) {
    // Network failed — fall back to the bundled/synced local file if present.
    const localPath = findTaxonomyXML();
    if (localPath) {
      console.warn(
        '[Taxonomy] GitHub fetch failed, falling back to local file:',
        localPath,
        fetchError instanceof Error ? fetchError.message : fetchError
      );
      return fs.readFileSync(localPath, 'utf-8');
    }

    // No local fallback available — surface the failure to loadTaxonomyData().
    console.error('[Taxonomy] No local fallback found. Searched:', getTaxonomySearchPaths());
    throw new Error(
      `Taxonomy XML not available: GitHub fetch failed and no local file found. ${
        fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Load and parse the taxonomy catalog into normalized Taxon objects.
 *
 * Never throws: returns an empty array on any failure so downstream `.map`/
 * `.filter` consumers stay safe.
 */
export async function loadTaxonomyData(): Promise<Taxon[]> {
  try {
    const xmlContent = await getTaxonomyXML();
    const taxons = await parseTaxonomyXML(xmlContent);
    console.log(`[Taxonomy] Loaded ${taxons.length} taxons`);
    return taxons;
  } catch (error) {
    console.error('[Taxonomy] Error loading taxonomy:', error);
    if (error instanceof Error) {
      console.error('[Taxonomy] Error message:', error.message);
    }
    return [];
  }
}
