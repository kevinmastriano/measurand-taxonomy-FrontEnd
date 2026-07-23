import { NextResponse } from 'next/server';
import { getAllQuantityKinds } from '@/lib/quantity-analyzer';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import { apiError, PUBLIC_CACHE_HEADERS } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const taxons = await loadTaxonomyDataStrict();
    const quantityMap = getAllQuantityKinds(taxons);
    const quantities = Array.from(quantityMap.values()).map(q => ({
      name: q.name,
      aspect: q.aspect,
      id: q.id,
      taxonCount: q.taxonCount,
      disciplines: q.disciplines,
    }));

    return NextResponse.json(
      {
        quantities,
        count: quantities.length,
      },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[api/quantities] Error:', error);
    if (error instanceof TaxonomyLoadError) {
      return apiError('Taxonomy data is currently unavailable', 503);
    }
    return apiError('Failed to fetch quantities', 500);
  }
}
