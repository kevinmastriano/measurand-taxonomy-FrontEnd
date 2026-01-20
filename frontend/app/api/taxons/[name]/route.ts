import { NextResponse } from 'next/server';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const taxons = await getTaxonomyData();
    const taxonName = decodeURIComponent(params.name);
    const taxon = taxons.find(t => t.name === taxonName);
    
    if (!taxon) {
      return NextResponse.json(
        { error: 'Taxon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(taxon);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch taxon' },
      { status: 500 }
    );
  }
}


