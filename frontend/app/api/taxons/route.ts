import { NextResponse } from 'next/server';
import { parseTaxonomyXML } from '@/lib/xml-parser';
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


