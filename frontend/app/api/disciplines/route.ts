import { NextResponse } from 'next/server';
import { parseTaxonomyXML } from '@/lib/xml-parser';
import { getAllDisciplineInfos } from '@/lib/discipline-utils';
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


