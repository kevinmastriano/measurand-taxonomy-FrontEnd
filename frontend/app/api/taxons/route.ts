import { NextResponse } from 'next/server';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import { apiError, parseBooleanParam, PUBLIC_CACHE_HEADERS } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const MAX_DISCIPLINE_LENGTH = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const discipline = searchParams.get('discipline');
    if (
      discipline !== null &&
      (discipline.trim().length === 0 || discipline.length > MAX_DISCIPLINE_LENGTH)
    ) {
      return apiError(
        `Invalid "discipline" parameter: must be a non-empty string of at most ${MAX_DISCIPLINE_LENGTH} characters`,
        400
      );
    }

    // Absent or "false" excludes deprecated taxons; "true" includes them.
    const includeDeprecated = parseBooleanParam(searchParams.get('deprecated'));
    if (includeDeprecated === undefined) {
      return apiError('Invalid "deprecated" parameter: expected "true" or "false"', 400);
    }

    const taxons = await loadTaxonomyDataStrict();

    let filtered = taxons;

    if (discipline) {
      filtered = filtered.filter(taxon =>
        taxon.Discipline?.some(d => d.name === discipline)
      );
    }

    if (includeDeprecated !== true) {
      filtered = filtered.filter(taxon => !taxon.deprecated);
    }

    return NextResponse.json(
      {
        taxons: filtered,
        count: filtered.length,
        total: taxons.length,
      },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[api/taxons] Error:', error);
    if (error instanceof TaxonomyLoadError) {
      return apiError('Taxonomy data is currently unavailable', 503);
    }
    return apiError('Failed to fetch taxons', 500);
  }
}
