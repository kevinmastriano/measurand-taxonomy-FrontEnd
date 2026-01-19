'use client';

import { useState } from 'react';
import { Taxon } from '@/lib/types';
import { getAllRelatedTaxons, RelatedTaxon } from '@/lib/relationship-analyzer';
import { Link2, Zap, Layers, Tag, FileText, ChevronDown, ChevronRight, Network } from 'lucide-react';
import Link from 'next/link';

interface RelatedTaxonsProps {
  taxon: Taxon;
  allTaxons: Taxon[];
}

const relationshipIcons = {
  same_quantity: Zap,
  same_parameters: Layers,
  measure_source_pair: Link2,
  same_discipline: Tag,
  similar_name: FileText,
};

const relationshipLabels = {
  same_quantity: 'Same Quantity',
  same_parameters: 'Shared Parameters',
  measure_source_pair: 'Measure/Source Pair',
  same_discipline: 'Same Discipline',
  similar_name: 'Similar Name',
};

export default function RelatedTaxons({ taxon, allTaxons }: RelatedTaxonsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const relatedTaxons = getAllRelatedTaxons(taxon, allTaxons);
  
  if (relatedTaxons.length === 0) {
    return null;
  }

  // Group by relationship type
  const grouped = relatedTaxons.reduce((acc, related) => {
    const type = related.relationshipType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(related);
    return acc;
  }, {} as Record<string, RelatedTaxon[]>);

  const totalCount = relatedTaxons.length;

  return (
    <div className="mt-6 border-t border-[#d0d7de] dark:border-[#30363d] pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] p-2 rounded-md transition-colors mb-2"
      >
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
          <h3 className="text-base font-bold text-[#24292f] dark:text-[#e6edf3]">
            Related Taxons
          </h3>
          <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
            ({totalCount})
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2">
          <div className="space-y-4">
            {Object.entries(grouped).map(([type, taxons]) => {
          const Icon = relationshipIcons[type as keyof typeof relationshipIcons];
          const label = relationshipLabels[type as keyof typeof relationshipLabels];
          
          return (
            <div key={type} className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-[#0969da] dark:text-[#58a6ff]" />
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3]">
                  {label}
                </h4>
                <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                  ({taxons.length})
                </span>
              </div>
              
              <div className="space-y-2">
                {taxons.slice(0, 5).map((related) => (
                  <div
                    key={related.taxon.name}
                    className="flex items-start justify-between p-2 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-[#0969da] dark:text-[#58a6ff]">
                          {related.taxon.name}
                        </code>
                        <span className="text-xs px-1.5 py-0.5 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded border border-[#54aeff] dark:border-[#1f6feb]">
                          {Math.round(related.similarityScore * 100)}% match
                        </span>
                      </div>
                      
                      {related.taxon.Definition && (
                        <p className="text-xs text-[#656d76] dark:text-[#8b949e] line-clamp-2">
                          {related.taxon.Definition}
                        </p>
                      )}
                      
                      {related.sharedElements && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {related.sharedElements.quantities && (
                            <span className="text-xs px-1.5 py-0.5 bg-[#fff8c5] dark:bg-[#6e4c02] text-[#6e4c02] dark:text-[#fff8c5] rounded border border-[#d4a72c] dark:border-[#d4a72c]">
                              Q: {related.sharedElements.quantities.join(', ')}
                            </span>
                          )}
                          {related.sharedElements.parameters && related.sharedElements.parameters.length > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded border border-[#54aeff] dark:border-[#1f6feb]">
                              {related.sharedElements.parameters.length} param{related.sharedElements.parameters.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {related.sharedElements.disciplines && (
                            <span className="text-xs px-1.5 py-0.5 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded border border-[#54aeff] dark:border-[#1f6feb]">
                              {related.sharedElements.disciplines.join(', ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {taxons.length > 5 && (
                  <p className="text-xs text-[#656d76] dark:text-[#8b949e] text-center pt-2">
                    +{taxons.length - 5} more related taxons
                  </p>
                )}
              </div>
            </div>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}

