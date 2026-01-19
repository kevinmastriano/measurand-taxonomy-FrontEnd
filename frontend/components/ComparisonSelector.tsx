'use client';

import { useState } from 'react';
import { Taxon } from '@/lib/types';
import { X, Plus } from 'lucide-react';

interface ComparisonSelectorProps {
  taxons: Taxon[];
  selectedTaxons: Taxon[];
  onSelectionChange: (taxons: Taxon[]) => void;
  maxSelections?: number;
}

export default function ComparisonSelector({
  taxons,
  selectedTaxons,
  onSelectionChange,
  maxSelections = 4,
}: ComparisonSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredTaxons = taxons.filter(taxon =>
    taxon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    taxon.Definition?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTaxon = (taxon: Taxon) => {
    const isSelected = selectedTaxons.some(t => t.name === taxon.name);
    
    if (isSelected) {
      onSelectionChange(selectedTaxons.filter(t => t.name !== taxon.name));
    } else {
      if (selectedTaxons.length < maxSelections) {
        onSelectionChange([...selectedTaxons, taxon]);
      }
    }
  };

  const removeTaxon = (taxonName: string) => {
    onSelectionChange(selectedTaxons.filter(t => t.name !== taxonName));
  };

  return (
    <div className="space-y-4">
      {/* Selected taxons */}
      {selectedTaxons.length > 0 && (
        <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
          <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3">
            Selected for Comparison ({selectedTaxons.length}/{maxSelections})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedTaxons.map((taxon) => (
              <div
                key={taxon.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0969da] dark:bg-[#58a6ff] text-white rounded-md"
              >
                <code className="text-sm font-mono">{taxon.name}</code>
                <button
                  onClick={() => removeTaxon(taxon.name)}
                  className="hover:bg-white/20 rounded p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search taxons to compare..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:border-[#0969da] dark:focus:border-[#58a6ff] transition-colors"
        />
      </div>

      {/* Taxon list */}
      <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md max-h-96 overflow-y-auto">
        {filteredTaxons.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#656d76] dark:text-[#8b949e]">
            No taxons found matching your search.
          </div>
        ) : (
          <div className="divide-y divide-[#d0d7de] dark:divide-[#30363d]">
            {filteredTaxons.map((taxon) => {
              const isSelected = selectedTaxons.some(t => t.name === taxon.name);
              const isDisabled = !isSelected && selectedTaxons.length >= maxSelections;
              
              return (
                <button
                  key={taxon.name}
                  onClick={() => toggleTaxon(taxon)}
                  disabled={isDisabled}
                  className={`w-full px-4 py-3 text-left hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                  } ${isSelected ? 'bg-[#ddf4ff] dark:bg-[#0c2d41]' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-[#0969da] dark:text-[#58a6ff]">
                          {taxon.name}
                        </code>
                        {isSelected && (
                          <span className="text-xs px-1.5 py-0.5 bg-[#0969da] dark:bg-[#58a6ff] text-white rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      {taxon.Definition && (
                        <p className="text-xs text-[#656d76] dark:text-[#8b949e] line-clamp-2">
                          {taxon.Definition}
                        </p>
                      )}
                    </div>
                    {!isSelected && !isDisabled && (
                      <Plus className="w-4 h-4 text-[#656d76] dark:text-[#8b949e] ml-2" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedTaxons.length >= maxSelections && (
        <p className="text-xs text-[#656d76] dark:text-[#8b949e] text-center">
          Maximum {maxSelections} taxons can be compared at once. Remove one to add another.
        </p>
      )}
    </div>
  );
}


