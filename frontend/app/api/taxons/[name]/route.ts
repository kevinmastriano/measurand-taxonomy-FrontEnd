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


