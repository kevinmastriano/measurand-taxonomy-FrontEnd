import { Suspense } from 'react';
import { parseTaxonomyXML } from '@/lib/xml-parser';
import { getAllDisciplineInfos } from '@/lib/discipline-utils';
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { Tag, ArrowRight } from 'lucide-react';

async function getTaxonomyData() {
  try {
    const currentDir = process.cwd();
    const possiblePaths = [
      path.resolve(currentDir, '..', 'MeasurandTaxonomyCatalog.xml'),
      path.resolve(currentDir, 'MeasurandTaxonomyCatalog.xml'),
      path.join(process.cwd(), '..', 'MeasurandTaxonomyCatalog.xml'),
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

// Cache this page for 5 minutes
export const revalidate = 300;

export default async function DisciplinesPage() {
  const taxons = await getTaxonomyData();
  const disciplineInfos = getAllDisciplineInfos(taxons);

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
          Measurement Disciplines
        </h1>
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          Browse the taxonomy organized by measurement disciplines. Each discipline represents a domain
          of measurement science with its own specialized taxons and parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplineInfos.map((discipline) => (
          <Link
            key={discipline.name}
            href={`/disciplines/${encodeURIComponent(discipline.name)}`}
            className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
                <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
                  {discipline.name}
                </h2>
              </div>
              <ArrowRight className="w-5 h-5 text-[#656d76] dark:text-[#8b949e]" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">
                  {discipline.taxonCount}
                </span>{' '}
                {discipline.taxonCount === 1 ? 'taxon' : 'taxons'}
              </p>
              
              {discipline.commonParameters.length > 0 && (
                <div>
                  <p className="text-xs text-[#656d76] dark:text-[#8b949e] mb-1">
                    Common parameters:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {discipline.commonParameters.slice(0, 3).map((param) => (
                      <span
                        key={param}
                        className="text-xs px-2 py-0.5 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded-md border border-[#54aeff] dark:border-[#1f6feb]"
                      >
                        {param}
                      </span>
                    ))}
                    {discipline.commonParameters.length > 3 && (
                      <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                        +{discipline.commonParameters.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {discipline.relatedDisciplines.length > 0 && (
                <div>
                  <p className="text-xs text-[#656d76] dark:text-[#8b949e]">
                    Related: {discipline.relatedDisciplines.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {disciplineInfos.length === 0 && (
        <div className="text-center py-16 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
          <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
            No disciplines found in the taxonomy.
          </p>
        </div>
      )}
    </div>
  );
}

