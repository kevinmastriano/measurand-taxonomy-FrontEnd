import { NextResponse } from 'next/server';
import { parseTaxonomyXML } from '@/lib/xml-parser';
import { getAllQuantityKinds } from '@/lib/quantity-analyzer';
import fs from 'fs';
import path from 'path';

async function getTaxonomyData() {
  try {
    const currentDir = process.cwd();
    const possiblePaths = [
      path.resolve(currentDir, '..', '..', 'MeasurandTaxonomyCatalog.xml'),
      path.resolve(currentDir, '..', 'MeasurandTaxonomyCatalog.xml'),
      path.join(process.cwd(), '..', '..', 'MeasurandTaxonomyCatalog.xml'),
    ];

    let xmlPath: string | null = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        xmlPath = testPath;
        break;
      }
    }

    if (!xmlPath) {
      return [];
    }

    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const taxons = await parseTaxonomyXML(xmlContent);
    return taxons;
  } catch (error) {
    console.error('Error loading taxonomy:', error);
    return [];
  }
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


