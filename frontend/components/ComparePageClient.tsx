'use client';

import { useState, useEffect } from 'react';
import { Taxon } from '@/lib/types';
import ComparisonSelector from './ComparisonSelector';
import TaxonComparison from './TaxonComparison';
import { useURLState } from '@/hooks/useURLState';

interface ComparePageClientProps {
  taxons: Taxon[];
}

export default function ComparePageClient({ taxons }: ComparePageClientProps) {
  const { urlState, updateURL } = useURLState();
  
  // Initialize from URL
  const [selectedTaxons, setSelectedTaxons] = useState<Taxon[]>(() => {
    if (urlState.compare.length > 0) {
      return taxons.filter(t => urlState.compare.includes(t.name)).slice(0, 4);
    }
    return [];
  });

  // Sync to URL
  useEffect(() => {
    updateURL({
      compare: selectedTaxons.map(t => t.name),
    });
  }, [selectedTaxons, updateURL]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Selection Panel */}
      <div>
        <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-4">
          Select Taxons
        </h2>
        <ComparisonSelector
          taxons={taxons}
          selectedTaxons={selectedTaxons}
          onSelectionChange={setSelectedTaxons}
          maxSelections={4}
        />
      </div>

      {/* Comparison Panel */}
      <div>
        <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-4">
          Comparison Results
        </h2>
        <TaxonComparison taxons={selectedTaxons} />
      </div>
    </div>
  );
}

