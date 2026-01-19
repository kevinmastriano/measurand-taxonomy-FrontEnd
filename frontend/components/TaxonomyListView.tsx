'use client';

import { useState, useMemo, useEffect } from 'react';
import { Taxon } from '@/lib/types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import RelatedTaxons from './RelatedTaxons';
import MLayerBadge from './MLayerBadge';
import ExportButtons from './ExportButtons';
import CopyButton from './CopyButton';
import TaxonShareButton from './TaxonShareButton';
import Breadcrumb from './Breadcrumb';
import TaxonVersionHistory from './TaxonVersionHistory';
import { useURLState } from '@/hooks/useURLState';
import { generateBreadcrumbsFromTaxon } from '@/lib/breadcrumb-utils';

interface TaxonomyListViewProps {
  taxons: Taxon[];
  allTaxons?: Taxon[]; // For related taxons feature
  onCompareSelect?: (taxon: Taxon) => void; // For comparison feature
  comparisonMode?: boolean; // Enable comparison checkboxes
}

export default function TaxonomyListView({ taxons, allTaxons, onCompareSelect, comparisonMode }: TaxonomyListViewProps) {
  const { urlState, updateURL } = useURLState();
  const [selectedTaxon, setSelectedTaxon] = useState<string | null>(urlState.taxon || null);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());

  // Auto-expand taxon if it's in URL (only on mount or when URL changes externally)
  useEffect(() => {
    if (urlState.taxon && urlState.taxon !== selectedTaxon) {
      setSelectedTaxon(urlState.taxon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlState.taxon]); // Only depend on urlState.taxon, not selectedTaxon

  // Update URL when taxon selection changes (but not during initial render)
  useEffect(() => {
    // Only update URL if the selection actually changed from user interaction
    // Skip if this is the initial mount and URL already has the taxon
    if (selectedTaxon && selectedTaxon !== urlState.taxon) {
      updateURL({
        taxon: selectedTaxon,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaxon]); // Intentionally exclude updateURL and urlState.taxon to avoid render loop

  const sortedTaxons = useMemo(() => {
    return [...taxons].sort((a, b) => a.name.localeCompare(b.name));
  }, [taxons]);

  return (
    <div>
      <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
        {sortedTaxons.map((taxon, index) => (
          <div
            key={taxon.name}
            className={`${index !== sortedTaxons.length - 1 ? 'border-b border-[#d0d7de] dark:border-[#30363d]' : ''}`}
          >
            <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors group">
              <button
                onClick={() => setSelectedTaxon(selectedTaxon === taxon.name ? null : taxon.name)}
                className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-inset"
              >
                <div className="flex items-center gap-3">
                  <code className="font-mono text-sm font-semibold text-[#0969da] dark:text-[#58a6ff] hover:underline">
                    {taxon.name}
                  </code>
                </div>
                {taxon.Definition && (
                  <div className="text-sm text-[#656d76] dark:text-[#8b949e] mt-1">
                    {taxon.Definition}
                  </div>
                )}
              </button>
              <div className="ml-4 flex items-center gap-2">
                <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="flex items-center gap-1">
                  <CopyButton text={taxon.name} label="taxon name" size="sm" />
                  <TaxonShareButton taxonName={taxon.name} size="sm" />
                </div>
                {taxon.deprecated && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-[#fff8c5] dark:bg-[#6e4c02] text-[#6e4c02] dark:text-[#fff8c5] rounded-full border border-[#d4a72c] dark:border-[#d4a72c]">
                    Deprecated
                  </span>
                )}
                <button
                  onClick={() => setSelectedTaxon(selectedTaxon === taxon.name ? null : taxon.name)}
                  className="focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded"
                  aria-label={selectedTaxon === taxon.name ? 'Collapse' : 'Expand'}
                >
                  {selectedTaxon === taxon.name ? (
                    <ChevronDown className="w-5 h-5 text-[#656d76] dark:text-[#8b949e]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#656d76] dark:text-[#8b949e]" />
                  )}
                </button>
              </div>
            </div>

            {selectedTaxon === taxon.name && (
              <div className="px-4 py-4 bg-[#f6f8fa] dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d]">
                <Breadcrumb items={generateBreadcrumbsFromTaxon(taxon.name)} className="mb-4" />
                <div className="space-y-4">
                  {taxon.deprecated && (
                    <div className="bg-[#fff8c5] dark:bg-[#6e4c02] border border-[#d4a72c] dark:border-[#d4a72c] rounded-md p-3">
                      <p className="text-sm font-medium text-[#6e4c02] dark:text-[#fff8c5]">
                        <strong>Deprecated</strong>
                        {taxon.replacement && (
                          <span className="ml-2">
                            → Replaced by: <code className="font-mono bg-[#ffffff] dark:bg-[#0d1117] px-1 py-0.5 rounded">{taxon.replacement}</code>
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {taxon.Discipline && taxon.Discipline.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                        Discipline{taxon.Discipline.length > 1 ? 's' : ''}:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {taxon.Discipline.map((disc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded-md border border-[#54aeff] dark:border-[#1f6feb]"
                          >
                            {disc.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {taxon.Result && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                        Result:
                      </h4>
                      <div className="text-sm text-[#24292f] dark:text-[#e6edf3]">
                        {taxon.Result.name && <span className="font-medium">{taxon.Result.name}: </span>}
                        {taxon.Result.Quantity?.name && (
                          <code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-[#24292f] dark:text-[#e6edf3]">
                            {taxon.Result.Quantity.name}
                          </code>
                        )}
                        {taxon.Result.mLayer && (
                          <span className="ml-2">
                            <MLayerBadge mLayer={taxon.Result.mLayer} />
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {taxon.Parameter && taxon.Parameter.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                        Parameters:
                      </h4>
                      <div className="space-y-3">
                        {taxon.Parameter.map((param, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-[#d0d7de] dark:border-[#30363d] pl-3"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm text-[#24292f] dark:text-[#e6edf3]">
                                {param.name}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  param.optional
                                    ? 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] border border-[#54aeff] dark:border-[#1f6feb]'
                                    : 'bg-[#ffebe9] dark:bg-[#67060c] text-[#cf222e] dark:text-[#ff8182] border border-[#ff8182] dark:border-[#ff8182]'
                                }`}
                              >
                                {param.optional ? 'Optional' : 'Required'}
                              </span>
                            </div>
                            {param.Definition && (
                              <p className="text-sm text-[#656d76] dark:text-[#8b949e] mt-1">
                                {param.Definition}
                              </p>
                            )}
                            {param.Quantity && (
                              <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-1">
                                Quantity: <code className="px-1 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">{param.Quantity.name}</code>
                              </p>
                            )}
                            {param.Property && (
                              <div className="mt-2 text-xs text-[#656d76] dark:text-[#8b949e]">
                                <span className="font-medium">Property: </span>
                                <code className="px-1 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">{param.Property.name}</code>
                                {param.Property.NominalValues && param.Property.NominalValues.length > 0 && (
                                  <div className="mt-1">
                                    <span className="font-medium">Values: </span>
                                    <code className="px-1 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded">
                                      {param.Property.NominalValues.join(', ')}
                                    </code>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {taxon.ExternalReferences?.Reference && (
                    <div>
                      <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                        External References:
                      </h4>
                      <div className="space-y-2">
                        {(Array.isArray(taxon.ExternalReferences.Reference) 
                          ? taxon.ExternalReferences.Reference 
                          : [taxon.ExternalReferences.Reference]
                        ).map((ref, idx) => (
                          <div key={idx} className="text-sm">
                            {ref.CategoryTag && (
                              <div className="text-[#656d76] dark:text-[#8b949e]">
                                <span className="font-medium">{ref.CategoryTag.name}: </span>
                                <span>{ref.CategoryTag.value}</span>
                              </div>
                            )}
                            {ref.ReferenceUrl && (
                              <div>
                                <a
                                  href={ref.ReferenceUrl.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#0969da] dark:text-[#58a6ff] hover:underline focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded"
                                >
                                  {ref.ReferenceUrl.name} <span className="text-[#656d76] dark:text-[#8b949e]">↗</span>
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Related Taxons */}
                  {allTaxons && selectedTaxon === taxon.name && (
                    <RelatedTaxons taxon={taxon} allTaxons={allTaxons} />
                  )}
                  
                  {/* Version History */}
                  {selectedTaxon === taxon.name && (
                    <TaxonVersionHistory taxonName={taxon.name} />
                  )}
                  
                  {/* Export Buttons */}
                  {selectedTaxon === taxon.name && (
                    <ExportButtons taxon={taxon} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedTaxons.length === 0 && (
        <div className="text-center py-16 px-4">
          <p className="text-[#656d76] dark:text-[#8b949e] text-sm">No taxons found matching your search.</p>
        </div>
      )}
    </div>
  );
}

