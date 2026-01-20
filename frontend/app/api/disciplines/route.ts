import { NextResponse } from 'next/server';
import { getAllDisciplineInfos } from '@/lib/discipline-utils';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';

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


