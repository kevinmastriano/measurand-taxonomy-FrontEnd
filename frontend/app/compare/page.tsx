import { Suspense } from 'react';
import { Taxon } from '@/lib/types';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';
import ComparePageClient from '@/components/ComparePageClient';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export default async function ComparePage() {
  const taxons = await getTaxonomyData();

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#0969da] dark:text-[#58a6ff] hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>
        
        <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
          Compare Taxons
        </h1>
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          Select 2-4 taxons to compare their parameters, disciplines, quantities, and definitions side-by-side.
        </p>
      </div>

      <Suspense fallback={
        <div className="text-center py-12">
          <p className="text-[#656d76] dark:text-[#8b949e]">Loading taxonomy...</p>
        </div>
      }>
        <ComparePageClient taxons={taxons} />
      </Suspense>
    </div>
  );
}

