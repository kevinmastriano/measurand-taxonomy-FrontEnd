import { Suspense } from 'react';
import TaxonomyCombinedViewWrapper from '@/components/TaxonomyCombinedViewWrapper';
import { parseTaxonomyXML } from '@/lib/xml-parser';
import fs from 'fs';
import path from 'path';

async function getTaxonomyData() {
  try {
    // Read the XML file from the parent directory
    // When running from frontend/, go up one level to find the XML file
    const currentDir = process.cwd();
    
    // Try multiple possible paths
    const possiblePaths = [
      path.resolve(currentDir, '..', 'MeasurandTaxonomyCatalog.xml'), // From frontend/ going up
      path.resolve(currentDir, 'MeasurandTaxonomyCatalog.xml'), // If already at root
      path.join(process.cwd(), '..', 'MeasurandTaxonomyCatalog.xml'), // Alternative
    ];
    
    let xmlPath: string | null = null;
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        xmlPath = testPath;
        break;
      }
    }
    
    if (!xmlPath) {
      console.error('XML file not found. Tried paths:', possiblePaths);
      console.error('Current working directory:', currentDir);
      return [];
    }
    
    console.log('Loading XML from:', xmlPath);
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const taxons = await parseTaxonomyXML(xmlContent);
    console.log(`Successfully loaded ${taxons.length} taxons`);
    return taxons;
  } catch (error) {
    console.error('Error loading taxonomy:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
}

export default async function Home() {
  const taxons = await getTaxonomyData();

  return (
    <div>
      <Suspense fallback={<div className="text-center py-12 text-[#656d76] dark:text-[#8b949e]">Loading taxonomy...</div>}>
        <TaxonomyCombinedViewWrapper taxons={taxons} />
      </Suspense>
    </div>
  );
}

