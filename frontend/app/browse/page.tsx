import { Suspense } from 'react';
import TaxonomyCombinedViewWrapper from '@/components/TaxonomyCombinedViewWrapper';
import { loadTaxonomyData } from '@/lib/taxonomy-loader';

async function getTaxonomyData() {
  return await loadTaxonomyData();
}

export default async function BrowsePage() {
  const taxons = await getTaxonomyData();

  return (
    <div>
      <Suspense fallback={<div className="text-center py-12 text-[#656d76] dark:text-[#8b949e]">Loading taxonomy...</div>}>
        <TaxonomyCombinedViewWrapper taxons={taxons} />
      </Suspense>
    </div>
  );
}
