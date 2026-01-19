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


