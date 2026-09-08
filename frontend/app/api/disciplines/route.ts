import { NextResponse } from 'next/server';
import { getAllDisciplineInfos } from '@/lib/discipline-utils';
import { loadTaxonomyDataStrict, TaxonomyLoadError } from '@/lib/taxonomy-loader';
import { apiError, PUBLIC_CACHE_HEADERS } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const taxons = await loadTaxonomyDataStrict();
    const disciplines = getAllDisciplineInfos(taxons);

    return NextResponse.json(
      {
        disciplines: disciplines.map(d => ({
          name: d.name,
          taxonCount: d.taxonCount,
          commonParameters: d.commonParameters,
          relatedDisciplines: d.relatedDisciplines,
        })),
        count: disciplines.length,
      },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[api/disciplines] Error:', error);
    if (error instanceof TaxonomyLoadError) {
      return apiError('Taxonomy data is currently unavailable', 503);
    }
    return apiError('Failed to fetch disciplines', 500);
  }
}
