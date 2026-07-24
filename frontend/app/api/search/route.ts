import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import {
  filterByDeprecated,
  invalidDeprecatedResponse,
  MIN_SEARCH_QUERY_LENGTH,
  parseDeprecatedParam,
} from '@/lib/api-utils';
import {
  errorResponse,
  jsonResponse,
  SEARCH_CACHE_CONTROL,
} from '@/lib/api-response';
import type { Taxon } from '@/lib/types';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

/** Lower score = higher rank. Prefer name matches over nested field matches. */
function searchScore(taxon: Taxon, query: string): number {
  const name = taxon.name.toLowerCase();
  if (name === query) return 0;
  if (name.startsWith(query) || name.includes(`.${query}`)) return 1;
  if (name.includes(query)) return 2;
  if (taxon.Result?.Quantity?.name?.toLowerCase().includes(query)) return 3;
  if (taxon.Discipline?.some((d) => d.name.toLowerCase().includes(query))) return 4;
  if (taxon.Definition?.toLowerCase().includes(query)) return 5;
  if (taxon.Parameter?.some((p) => p.name.toLowerCase().includes(query))) return 6;
  return 7;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const deprecatedParam = parseDeprecatedParam(searchParams.get('deprecated'));

    if (!q || q.trim().length === 0) {
      return errorResponse('Query parameter "q" is required', 400);
    }

    const query = q.toLowerCase().trim();
    if (query.length < MIN_SEARCH_QUERY_LENGTH) {
      return errorResponse(
        `Query parameter "q" must be at least ${MIN_SEARCH_QUERY_LENGTH} characters`,
        400
      );
    }

    if (!deprecatedParam.ok) {
      return invalidDeprecatedResponse(deprecatedParam.error);
    }

    const taxons = await getTaxonomyData();
    const scoped = filterByDeprecated(taxons, deprecatedParam.filter);

    const results = scoped
      .filter(
        (taxon) =>
          taxon.name.toLowerCase().includes(query) ||
          taxon.Definition?.toLowerCase().includes(query) ||
          taxon.Discipline?.some((d) => d.name.toLowerCase().includes(query)) ||
          taxon.Parameter?.some((p) => p.name.toLowerCase().includes(query)) ||
          taxon.Result?.Quantity?.name.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const scoreDiff = searchScore(a, query) - searchScore(b, query);
        if (scoreDiff !== 0) return scoreDiff;
        return a.name.localeCompare(b.name);
      });

    return jsonResponse(
      {
        query: q.trim(),
        results,
        count: results.length,
      },
      { request, cacheControl: SEARCH_CACHE_CONTROL }
    );
  } catch (error) {
    console.error('[api/search] Failed to search taxons:', error);
    return errorResponse('Failed to search taxons', 500);
  }
}
