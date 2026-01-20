import { NextResponse } from 'next/server';
import { getAllQuantityKinds } from '@/lib/quantity-analyzer';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export async function GET() {
  try {
    const taxons = await getTaxonomyData();
    const quantityMap = getAllQuantityKinds(taxons);
    const quantities = Array.from(quantityMap.values()).map(q => ({
      name: q.name,
      aspect: q.aspect,
      id: q.id,
      taxonCount: q.taxonCount,
      disciplines: q.disciplines,
    }));
    
    return NextResponse.json({
      quantities,
      count: quantities.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch quantities' },
      { status: 500 }
    );
  }
}


