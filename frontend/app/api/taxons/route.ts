import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import {
  filterByDeprecated,
  invalidDeprecatedResponse,
  normalizeDisciplineParam,
  parseDeprecatedParam,
  taxonHasDiscipline,
} from '@/lib/api-utils';
import {
  CATALOG_CACHE_CONTROL,
  errorResponse,
  jsonResponse,
} from '@/lib/api-response';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const discipline = normalizeDisciplineParam(searchParams.get('discipline'));
    const deprecatedParam = parseDeprecatedParam(searchParams.get('deprecated'));

    if (!deprecatedParam.ok) {
      return invalidDeprecatedResponse(deprecatedParam.error);
    }

    const taxons = await getTaxonomyData();
    let filtered = filterByDeprecated(taxons, deprecatedParam.filter);

    if (discipline) {
      filtered = filtered.filter((taxon) => taxonHasDiscipline(taxon, discipline));
    }

    return jsonResponse(
      {
        taxons: filtered,
        count: filtered.length,
        total: taxons.length,
      },
      { request, cacheControl: CATALOG_CACHE_CONTROL }
    );
  } catch (error) {
    console.error('[api/taxons] Failed to fetch taxons:', error);
    return errorResponse('Failed to fetch taxons', 500);
  }
}
