import { NextResponse } from 'next/server';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import { apiError, parseLimitParam, PUBLIC_CACHE_HEADERS } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const MAX_QUERY_LENGTH = 200;
const MAX_LIMIT = 500;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.trim().length === 0) {
      return apiError('Query parameter "q" is required', 400);
    }
    if (q.length > MAX_QUERY_LENGTH) {
      return apiError(
        `Query parameter "q" must be at most ${MAX_QUERY_LENGTH} characters`,
        400
      );
    }

    const limit = parseLimitParam(searchParams.get('limit'), MAX_LIMIT);
    if (limit === undefined) {
      return apiError(
        `Invalid "limit" parameter: expected a positive integer (max ${MAX_LIMIT})`,
        400
      );
    }

    const taxons = await loadTaxonomyDataStrict();
    const query = q.toLowerCase().trim();

    const results = taxons.filter(taxon =>
      taxon.name.toLowerCase().includes(query) ||
      taxon.Definition?.toLowerCase().includes(query) ||
      taxon.Discipline?.some(d => d.name.toLowerCase().includes(query)) ||
      taxon.Parameter?.some(p => p.name.toLowerCase().includes(query)) ||
      taxon.Result?.Quantity?.name.toLowerCase().includes(query)
    );

    const limited = limit === null ? results : results.slice(0, limit);

    return NextResponse.json(
      {
        query: q,
        results: limited,
        count: limited.length,
        totalMatches: results.length,
      },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[api/search] Error:', error);
    if (error instanceof TaxonomyLoadError) {
      return apiError('Taxonomy data is currently unavailable', 503);
    }
    return apiError('Failed to search taxons', 500);
  }
}
