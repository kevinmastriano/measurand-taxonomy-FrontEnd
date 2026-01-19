'use client';

import { Taxon } from '@/lib/types';
import { compareTaxons, compareMultipleTaxons, ComparisonResult } from '@/lib/comparison-utils';
import { Check, X, AlertCircle } from 'lucide-react';
import CopyButton from './CopyButton';

interface TaxonComparisonProps {
  taxons: Taxon[];
}

export default function TaxonComparison({ taxons }: TaxonComparisonProps) {
  if (taxons.length < 2) {
    return (
      <div className="text-center py-12 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
        <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
          Select at least 2 taxons to compare.
        </p>
      </div>
    );
  }

  const comparisons = compareMultipleTaxons(taxons);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 bg-[#f6f8fa] dark:bg-[#161b22]">
        <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
          Comparison Summary
        </h3>
        <p className="text-xs text-[#656d76] dark:text-[#8b949e]">
          Comparing {taxons.length} taxons ({comparisons.length} pairwise comparison{comparisons.length !== 1 ? 's' : ''})
        </p>
      </div>

      {/* Pairwise comparisons */}
      {comparisons.map((comparison, idx) => (
        <ComparisonCard key={idx} comparison={comparison} />
      ))}
    </div>
  );
}

function ComparisonCard({ comparison }: { comparison: ComparisonResult }) {
  const { taxon1, taxon2, similarityScore, differences } = comparison;

  return (
    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 flex items-center gap-3">
            <code className="text-sm font-mono text-[#0969da] dark:text-[#58a6ff]">
              {taxon1.name}
            </code>
            <CopyButton text={taxon1.name} label="taxon name" size="sm" />
          </div>
          <div className="px-4">
            <span className="text-xs px-2 py-1 bg-[#0969da] dark:bg-[#58a6ff] text-white rounded-full font-medium">
              {Math.round(similarityScore * 100)}% similar
            </span>
          </div>
          <div className="flex-1 text-right flex items-center justify-end gap-3">
            <CopyButton text={taxon2.name} label="taxon name" size="sm" />
            <code className="text-sm font-mono text-[#0969da] dark:text-[#58a6ff]">
              {taxon2.name}
            </code>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Definitions */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold text-[#656d76] dark:text-[#8b949e] mb-1">
              Definition
            </h4>
            <p className="text-sm text-[#24292f] dark:text-[#e6edf3]">
              {taxon1.Definition || <span className="text-[#656d76] dark:text-[#8b949e]">No definition</span>}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[#656d76] dark:text-[#8b949e] mb-1">
              Definition
            </h4>
            <p className="text-sm text-[#24292f] dark:text-[#e6edf3]">
              {taxon2.Definition || <span className="text-[#656d76] dark:text-[#8b949e]">No definition</span>}
            </p>
          </div>
        </div>

        {/* Parameters */}
        <div>
          <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3">
            Parameters
          </h4>
          <div className="space-y-3">
            {/* Common parameters */}
            {differences.parameters.common.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-[#1a7f37] dark:text-[#3fb950]" />
                  <span className="text-xs font-medium text-[#24292f] dark:text-[#e6edf3]">
                    Common Parameters ({differences.parameters.common.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {differences.parameters.common.map((param) => {
                    const optDiff = differences.parameters.differentOptionality.find(d => d.name === param);
                    return (
                      <span
                        key={param}
                        className={`text-xs px-2 py-1 rounded-md border ${
                          optDiff
                            ? 'bg-[#fff8c5] dark:bg-[#6e4c02] text-[#6e4c02] dark:text-[#fff8c5] border-[#d4a72c] dark:border-[#d4a72c]'
                            : 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] border-[#54aeff] dark:border-[#1f6feb]'
                        }`}
                        title={optDiff ? `Optionality differs: ${optDiff.taxon1Optional ? 'Optional' : 'Required'} vs ${optDiff.taxon2Optional ? 'Optional' : 'Required'}` : ''}
                      >
                        {param}
                        {optDiff && <AlertCircle className="w-3 h-3 inline ml-1" />}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Only in taxon1 */}
            {differences.parameters.onlyIn1.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-[#cf222e] dark:text-[#ff8182]" />
                  <span className="text-xs font-medium text-[#24292f] dark:text-[#e6edf3]">
                    Only in {taxon1.name.split('.').pop()} ({differences.parameters.onlyIn1.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {differences.parameters.onlyIn1.map((param) => (
                    <span
                      key={param}
                      className="text-xs px-2 py-1 bg-[#ffebe9] dark:bg-[#67060c] text-[#cf222e] dark:text-[#ff8182] rounded-md border border-[#ff8182] dark:border-[#ff8182]"
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Only in taxon2 */}
            {differences.parameters.onlyIn2.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-[#cf222e] dark:text-[#ff8182]" />
                  <span className="text-xs font-medium text-[#24292f] dark:text-[#e6edf3]">
                    Only in {taxon2.name.split('.').pop()} ({differences.parameters.onlyIn2.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {differences.parameters.onlyIn2.map((param) => (
                    <span
                      key={param}
                      className="text-xs px-2 py-1 bg-[#ffebe9] dark:bg-[#67060c] text-[#cf222e] dark:text-[#ff8182] rounded-md border border-[#ff8182] dark:border-[#ff8182]"
                    >
                      {param}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disciplines */}
        <div>
          <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3">
            Disciplines
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {taxon1.Discipline && taxon1.Discipline.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {taxon1.Discipline.map((disc, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-md border ${
                        differences.disciplines.common.includes(disc.name)
                          ? 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] border-[#54aeff] dark:border-[#1f6feb]'
                          : 'bg-[#ffebe9] dark:bg-[#67060c] text-[#cf222e] dark:text-[#ff8182] border-[#ff8182] dark:border-[#ff8182]'
                      }`}
                    >
                      {disc.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-[#656d76] dark:text-[#8b949e]">None</span>
              )}
            </div>
            <div>
              {taxon2.Discipline && taxon2.Discipline.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {taxon2.Discipline.map((disc, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-md border ${
                        differences.disciplines.common.includes(disc.name)
                          ? 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] border-[#54aeff] dark:border-[#1f6feb]'
                          : 'bg-[#ffebe9] dark:bg-[#67060c] text-[#cf222e] dark:text-[#ff8182] border-[#ff8182] dark:border-[#ff8182]'
                      }`}
                    >
                      {disc.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-[#656d76] dark:text-[#8b949e]">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Quantities */}
        <div>
          <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3">
            Result Quantities
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {differences.quantities.taxon1 ? (
                <code className={`text-sm px-2 py-1 rounded-md border ${
                  differences.quantities.same
                    ? 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] border-[#54aeff] dark:border-[#1f6feb]'
                    : 'bg-[#ffebe9] dark:bg-[#67060c] text-[#cf222e] dark:text-[#ff8182] border-[#ff8182] dark:border-[#ff8182]'
                }`}>
                  {differences.quantities.taxon1}
                </code>
              ) : (
                <span className="text-xs text-[#656d76] dark:text-[#8b949e]">None</span>
              )}
            </div>
            <div>
              {differences.quantities.taxon2 ? (
                <code className={`text-sm px-2 py-1 rounded-md border ${
                  differences.quantities.same
                    ? 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] border-[#54aeff] dark:border-[#1f6feb]'
                    : 'bg-[#ffebe9] dark:bg-[#67060c] text-[#cf222e] dark:text-[#ff8182] border-[#ff8182] dark:border-[#ff8182]'
                }`}>
                  {differences.quantities.taxon2}
                </code>
              ) : (
                <span className="text-xs text-[#656d76] dark:text-[#8b949e]">None</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

