import { Suspense } from 'react';
import { getDisciplineInfo } from '@/lib/discipline-utils';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import Link from 'next/link';
import { Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import TaxonomyListView from '@/components/TaxonomyListView';
import Breadcrumb from '@/components/Breadcrumb';
import { generateDisciplineBreadcrumb } from '@/lib/breadcrumb-utils';
import DisciplineVersionHistory from '@/components/DisciplineVersionHistory';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export default async function DisciplineDetailPage({
  params,
}: {
  params: Promise<{ discipline: string }>;
}) {
  const { discipline } = await params;
  const taxons = await getTaxonomyData();
  const disciplineName = decodeURIComponent(discipline);
  const disciplineInfo = getDisciplineInfo(disciplineName, taxons);

  if (disciplineInfo.taxonCount === 0) {
    return (
      <div>
        <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
          <Link
            href="/disciplines"
            className="inline-flex items-center gap-2 text-sm text-[#0969da] dark:text-[#58a6ff] hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Disciplines
          </Link>
          <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
            Discipline Not Found
          </h1>
        </div>
        <div className="text-center py-16 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
          <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
            The discipline &quot;{disciplineName}&quot; was not found in the taxonomy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <Breadcrumb items={generateDisciplineBreadcrumb(disciplineName)} className="mb-4" />
        
        <div className="flex items-center gap-3 mb-2">
          <Tag className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
          <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
            {disciplineInfo.name}
          </h1>
        </div>
        
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          {disciplineInfo.taxonCount} {disciplineInfo.taxonCount === 1 ? 'taxon' : 'taxons'} in this discipline
        </p>
      </div>

      {/* Discipline Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {disciplineInfo.commonParameters.length > 0 && (
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
            <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Common Parameters
            </h3>
            <div className="flex flex-wrap gap-2">
              {disciplineInfo.commonParameters.map((param) => (
                <span
                  key={param}
                  className="text-xs px-2 py-1 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded-md border border-[#54aeff] dark:border-[#1f6feb]"
                >
                  {param}
                </span>
              ))}
            </div>
          </div>
        )}

        {disciplineInfo.relatedDisciplines.length > 0 && (
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
            <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Related Disciplines
            </h3>
            <div className="flex flex-wrap gap-2">
              {disciplineInfo.relatedDisciplines.map((relatedDisc) => (
                <Link
                  key={relatedDisc}
                  href={`/disciplines/${encodeURIComponent(relatedDisc)}`}
                  className="text-xs px-2 py-1 bg-[#ffffff] dark:bg-[#0d1117] text-[#0969da] dark:text-[#58a6ff] rounded-md border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors inline-flex items-center gap-1"
                >
                  {relatedDisc}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Taxons in this discipline */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-4">
          Taxons in {disciplineInfo.name}
        </h2>
        <Suspense fallback={<div className="text-center py-8 text-[#656d76] dark:text-[#8b949e]">Loading taxons...</div>}>
          <TaxonomyListView taxons={disciplineInfo.taxons} allTaxons={taxons} />
        </Suspense>
      </div>

      {/* Version History */}
      <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-8">
        <Suspense fallback={<div className="text-center py-8 text-[#656d76] dark:text-[#8b949e]">Loading version history...</div>}>
          <DisciplineVersionHistory disciplineName={disciplineInfo.name} />
        </Suspense>
      </div>
    </div>
  );
}

