import {
  getSyncMetadata,
  hasSyncedData,
} from '@/lib/taxonomy-file-finder';
import {
  loadTaxonomyData,
  REVALIDATE_SECONDS,
  TAXONOMY_TAG,
} from '@/lib/taxonomy-loader';
import {
  errorResponse,
  jsonResponse,
  NO_STORE_CACHE_CONTROL,
} from '@/lib/api-response';

export const dynamic = 'force-dynamic';

/**
 * Readiness/liveness probe for uptime checks.
 * Confirms the taxonomy catalog loads and reports basic sync metadata.
 */
export async function GET() {
  try {
    const taxons = await loadTaxonomyData();
    const ready = taxons.length > 0;
    const sync = getSyncMetadata();
    const deprecatedCount = taxons.filter((t) => t.deprecated).length;

    return jsonResponse(
      {
        status: ready ? 'ok' : 'degraded',
        ready,
        taxonCount: taxons.length,
        activeCount: taxons.length - deprecatedCount,
        deprecatedCount,
        taxonomyTag: TAXONOMY_TAG,
        revalidateSeconds: REVALIDATE_SECONDS,
        hasLocalSyncedData: hasSyncedData(),
        lastSync: sync
          ? {
              syncedAt: sync.syncedAt,
              commitSHA: sync.commitSHA,
              source: sync.source,
            }
          : null,
        timestamp: new Date().toISOString(),
      },
      {
        status: ready ? 200 : 503,
        cacheControl: NO_STORE_CACHE_CONTROL,
      }
    );
  } catch (error) {
    console.error('[api/health] Health check failed:', error);
    return errorResponse('Health check failed', 503);
  }
}
