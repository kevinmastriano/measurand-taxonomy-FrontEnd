import { NextResponse } from 'next/server';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import {
  apiError,
  safeDecodeURIComponent,
  PUBLIC_CACHE_HEADERS,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

const MAX_NAME_LENGTH = 200;

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const taxonName = safeDecodeURIComponent(params.name);
    if (taxonName === null || taxonName.trim().length === 0) {
      return apiError('Invalid taxon name', 400);
    }
    if (taxonName.length > MAX_NAME_LENGTH) {
      return apiError(
        `Invalid taxon name: must be at most ${MAX_NAME_LENGTH} characters`,
        400
      );
    }

    const taxons = await loadTaxonomyDataStrict();
    const taxon = taxons.find(t => t.name === taxonName);

    if (!taxon) {
      return apiError('Taxon not found', 404);
    }

    return NextResponse.json(taxon, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('[api/taxons/[name]] Error:', error);
    if (error instanceof TaxonomyLoadError) {
      return apiError('Taxonomy data is currently unavailable', 503);
    }
    return apiError('Failed to fetch taxon', 500);
  }
}
