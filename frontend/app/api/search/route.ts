import { NextResponse } from 'next/server';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }
    
    const taxons = await getTaxonomyData();
    const query = q.toLowerCase().trim();
    
    const results = taxons.filter(taxon =>
      taxon.name.toLowerCase().includes(query) ||
      taxon.Definition?.toLowerCase().includes(query) ||
      taxon.Discipline?.some(d => d.name.toLowerCase().includes(query)) ||
      taxon.Parameter?.some(p => p.name.toLowerCase().includes(query)) ||
      taxon.Result?.Quantity?.name.toLowerCase().includes(query)
    );
    
    return NextResponse.json({
      query: q,
      results,
      count: results.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search taxons' },
      { status: 500 }
    );
  }
}


