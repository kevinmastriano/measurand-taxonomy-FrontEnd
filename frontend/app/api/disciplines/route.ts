import { NextResponse } from 'next/server';
import { getAllDisciplineInfos } from '@/lib/discipline-utils';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';

// Render per-request so this endpoint reflects revalidated taxonomy data
// instead of being frozen with build-time data (it reads no request state,
// so Next would otherwise statically prerender it).
export const dynamic = 'force-dynamic';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET() {
  try {
    const taxons = await getTaxonomyData();
    const disciplines = getAllDisciplineInfos(taxons);
    
    return NextResponse.json({
      disciplines: disciplines.map(d => ({
        name: d.name,
        taxonCount: d.taxonCount,
        commonParameters: d.commonParameters,
        relatedDisciplines: d.relatedDisciplines,
      })),
      count: disciplines.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch disciplines' },
      { status: 500 }
    );
  }
}


