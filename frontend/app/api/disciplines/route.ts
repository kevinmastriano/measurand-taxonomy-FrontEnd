import { getAllDisciplineInfos } from '@/lib/discipline-utils';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import {
  filterByDeprecated,
  invalidDeprecatedResponse,
  parseDeprecatedParam,
} from '@/lib/api-utils';
import {
  CATALOG_CACHE_CONTROL,
  errorResponse,
  jsonResponse,
} from '@/lib/api-response';

// Render per-request so this endpoint reflects revalidated taxonomy data
// instead of being frozen with build-time data (it reads no request state,
// so Next would otherwise statically prerender it).
export const dynamic = 'force-dynamic';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deprecatedParam = parseDeprecatedParam(searchParams.get('deprecated'));

    if (!deprecatedParam.ok) {
      return invalidDeprecatedResponse(deprecatedParam.error);
    }

    const taxons = await getTaxonomyData();
    // Default matches /api/taxons: exclude deprecated so taxonCount aligns
    const scoped = filterByDeprecated(taxons, deprecatedParam.filter);
    const disciplines = getAllDisciplineInfos(scoped);

    return jsonResponse(
      {
        disciplines: disciplines.map((d) => ({
          name: d.name,
          taxonCount: d.taxonCount,
          commonParameters: d.commonParameters,
          relatedDisciplines: d.relatedDisciplines,
        })),
        count: disciplines.length,
      },
      { request, cacheControl: CATALOG_CACHE_CONTROL }
    );
  } catch (error) {
    console.error('[api/disciplines] Failed to fetch disciplines:', error);
    return errorResponse('Failed to fetch disciplines', 500);
  }
}
