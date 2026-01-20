import { Suspense } from 'react';
import { getAllQuantityKinds } from '@/lib/quantity-analyzer';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import Link from 'next/link';
import { Zap, ExternalLink } from 'lucide-react';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export default async function QuantitiesPage() {
  const taxons = await getTaxonomyData();
  const quantityMap = getAllQuantityKinds(taxons);
  const quantities = Array.from(quantityMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
          Quantity Kinds
        </h1>
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          Browse the taxonomy organized by quantity kinds. Each quantity kind represents a measurable
          property linked to the M-Layer registry, showing how different taxons measure the same
          fundamental quantities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quantities.map((quantity) => (
          <Link
            key={`${quantity.aspect}:${quantity.id}`}
            href={`/quantities/${encodeURIComponent(quantity.aspect)}/${encodeURIComponent(quantity.id)}`}
            className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
                <div>
                  <h2 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3]">
                    {quantity.name}
                  </h2>
                  <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-1">
                    {quantity.aspect} ({quantity.id})
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">
                  {quantity.taxonCount}
                </span>{' '}
                {quantity.taxonCount === 1 ? 'taxon' : 'taxons'}
              </p>
              
              {quantity.disciplines.length > 0 && (
                <div>
                  <p className="text-xs text-[#656d76] dark:text-[#8b949e] mb-1">
                    Disciplines:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {quantity.disciplines.slice(0, 3).map((disc) => (
                      <span
                        key={disc}
                        className="text-xs px-2 py-0.5 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded-md border border-[#54aeff] dark:border-[#1f6feb]"
                      >
                        {disc}
                      </span>
                    ))}
                    {quantity.disciplines.length > 3 && (
                      <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                        +{quantity.disciplines.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {quantities.length === 0 && (
        <div className="text-center py-16 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
          <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
            No quantity kinds found in the taxonomy.
          </p>
        </div>
      )}
    </div>
  );
}


