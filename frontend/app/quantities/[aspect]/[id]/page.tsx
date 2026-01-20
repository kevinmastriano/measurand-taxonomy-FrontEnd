import { Suspense } from 'react';
import { getQuantityInfo, getMLayerRegistryUrl } from '@/lib/quantity-analyzer';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import Link from 'next/link';
import { Zap, ArrowLeft, ExternalLink, Tag } from 'lucide-react';
import TaxonomyListView from '@/components/TaxonomyListView';
import Breadcrumb from '@/components/Breadcrumb';
import { generateQuantityBreadcrumb } from '@/lib/breadcrumb-utils';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export default async function QuantityDetailPage({
  params,
}: {
  params: { aspect: string; id: string };
}) {
  const taxons = await getTaxonomyData();
  const aspect = decodeURIComponent(params.aspect);
  const id = decodeURIComponent(params.id);
  const quantityInfo = getQuantityInfo(aspect, id, taxons);
  const mLayerUrl = getMLayerRegistryUrl(aspect, id);

  if (!quantityInfo) {
    return (
      <div>
        <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
          <Link
            href="/quantities"
            className="inline-flex items-center gap-2 text-sm text-[#0969da] dark:text-[#58a6ff] hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quantities
          </Link>
          <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
            Quantity Not Found
          </h1>
        </div>
        <div className="text-center py-16 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
          <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
            The quantity kind &quot;{aspect}&quot; ({id}) was not found in the taxonomy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <Breadcrumb items={generateQuantityBreadcrumb(aspect, id)} className="mb-4" />
        
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-[#0969da] dark:text-[#58a6ff]" />
          <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
            {quantityInfo.name}
          </h1>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-[#656d76] dark:text-[#8b949e]">
          <div>
            <span className="font-medium">M-Layer Aspect:</span>{' '}
            <code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">
              {quantityInfo.aspect}
            </code>
          </div>
          <div>
            <span className="font-medium">ID:</span>{' '}
            <code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">
              {quantityInfo.id}
            </code>
          </div>
          {mLayerUrl && (
            <a
              href={mLayerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#0969da] dark:text-[#58a6ff] hover:underline"
            >
              M-Layer Registry
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        
        <p className="text-[#656d76] dark:text-[#8b949e] text-base mt-2">
          {quantityInfo.taxonCount} {quantityInfo.taxonCount === 1 ? 'taxon' : 'taxons'} use this quantity kind
        </p>
      </div>

      {/* Quantity Statistics */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {quantityInfo.disciplines.length > 0 && (
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
            <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Disciplines
            </h3>
            <div className="flex flex-wrap gap-2">
              {quantityInfo.disciplines.map((disc) => (
                <Link
                  key={disc}
                  href={`/disciplines/${encodeURIComponent(disc)}`}
                  className="text-xs px-2 py-1 bg-[#ffffff] dark:bg-[#0d1117] text-[#0969da] dark:text-[#58a6ff] rounded-md border border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors inline-flex items-center gap-1"
                >
                  {disc}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {quantityInfo.commonParameters.length > 0 && (
          <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
            <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Common Parameters
            </h3>
            <div className="flex flex-wrap gap-2">
              {quantityInfo.commonParameters.map((param) => (
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
      </div>

      {/* Taxons using this quantity */}
      <div>
        <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-4">
          Taxons Using {quantityInfo.name}
        </h2>
        <Suspense fallback={<div className="text-center py-8 text-[#656d76] dark:text-[#8b949e]">Loading taxons...</div>}>
          <TaxonomyListView taxons={quantityInfo.taxons} allTaxons={taxons} />
        </Suspense>
      </div>
    </div>
  );
}

