import { NextResponse } from 'next/server';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline');
    const deprecated = searchParams.get('deprecated');
    
    const taxons = await getTaxonomyData();
    
    let filtered = taxons;
    
    // Filter by discipline
    if (discipline) {
      filtered = filtered.filter(taxon =>
        taxon.Discipline?.some(d => d.name === discipline)
      );
    }
    
    // Filter deprecated
    if (deprecated === 'false' || deprecated === null) {
      filtered = filtered.filter(taxon => !taxon.deprecated);
    }
    
    return NextResponse.json({
      taxons: filtered,
      count: filtered.length,
      total: taxons.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch taxons' },
      { status: 500 }
    );
  }
}


