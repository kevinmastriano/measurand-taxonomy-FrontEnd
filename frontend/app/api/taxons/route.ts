import { NextResponse } from 'next/server';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import {
  filterByDeprecated,
  invalidDeprecatedResponse,
  parseDeprecatedParam,
  taxonHasDiscipline,
} from '@/lib/api-utils';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline');
    const deprecatedParam = parseDeprecatedParam(searchParams.get('deprecated'));

    if (!deprecatedParam.ok) {
      return invalidDeprecatedResponse(deprecatedParam.error);
    }

    const taxons = await getTaxonomyData();

    let filtered = filterByDeprecated(taxons, deprecatedParam.filter);

    // Filter by discipline (case-insensitive)
    if (discipline) {
      filtered = filtered.filter((taxon) => taxonHasDiscipline(taxon, discipline));
    }

    return NextResponse.json({
      taxons: filtered,
      count: filtered.length,
      total: taxons.length,
    });
  } catch (error) {
    console.error('[api/taxons] Failed to fetch taxons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch taxons' },
      { status: 500 }
    );
  }
}
