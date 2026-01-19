'use client';

import { Suspense } from 'react';
import { Taxon } from '@/lib/types';
import TaxonomyCombinedView from './TaxonomyCombinedView';

interface TaxonomyCombinedViewWrapperProps {
  taxons: Taxon[];
}

export default function TaxonomyCombinedViewWrapper({ taxons }: TaxonomyCombinedViewWrapperProps) {
  return (
    <Suspense fallback={<div className="text-center py-12 text-[#656d76] dark:text-[#8b949e]">Loading...</div>}>
      <TaxonomyCombinedView taxons={taxons} />
    </Suspense>
  );
}


