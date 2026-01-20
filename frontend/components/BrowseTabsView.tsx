'use client';

import { useState } from 'react';
import { Taxon } from '@/lib/types';
import { List, Tag, Zap, GitCompare } from 'lucide-react';
import TaxonomyCombinedView from './TaxonomyCombinedView';
import { getAllDisciplineInfos } from '@/lib/discipline-utils';
import { getAllQuantityKinds } from '@/lib/quantity-analyzer';
import ComparePageClient from './ComparePageClient';
import CompleteTaxonomyExport from './CompleteTaxonomyExport';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface BrowseTabsViewProps {
  taxons: Taxon[];
}

type TabType = 'browse' | 'disciplines' | 'quantities' | 'compare';

export default function BrowseTabsView({ taxons }: BrowseTabsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  
  const disciplineInfos = getAllDisciplineInfos(taxons);
  const quantityMap = getAllQuantityKinds(taxons);
  const quantities = Array.from(quantityMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div>
      {/* Header with tabs and exports on same line */}
      <div className="mb-4 pb-3 border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b-0">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded-t-md ${
                  activeTab === 'browse'
                    ? 'text-[#24292f] dark:text-[#e6edf3] border-b-2 border-[#0969da] dark:border-[#58a6ff] bg-transparent'
                    : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] border-b-2 border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d]'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Taxonomy</span>
              </button>
              <button
                onClick={() => setActiveTab('disciplines')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded-t-md ${
                  activeTab === 'disciplines'
                    ? 'text-[#24292f] dark:text-[#e6edf3] border-b-2 border-[#0969da] dark:border-[#58a6ff] bg-transparent'
                    : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] border-b-2 border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d]'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Disciplines</span>
              </button>
              <button
                onClick={() => setActiveTab('quantities')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded-t-md ${
                  activeTab === 'quantities'
                    ? 'text-[#24292f] dark:text-[#e6edf3] border-b-2 border-[#0969da] dark:border-[#58a6ff] bg-transparent'
                    : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] border-b-2 border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d]'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Quantities</span>
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded-t-md ${
                  activeTab === 'compare'
                    ? 'text-[#24292f] dark:text-[#e6edf3] border-b-2 border-[#0969da] dark:border-[#58a6ff] bg-transparent'
                    : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] border-b-2 border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d]'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
              </button>
            </div>
          </div>
          
          {/* Export buttons - aligned right */}
          <div className="flex items-center">
            <div className="h-6 w-px bg-[#d0d7de] dark:bg-[#30363d] mr-4"></div>
            {activeTab === 'browse' && <CompleteTaxonomyExport taxons={taxons} />}
          </div>
        </div>
        
        {/* Title and description */}
        <div className="mt-3">
          <h1 className="text-2xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-1">
            Measurand Taxonomy Catalog
          </h1>
          <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
            NCSL International Measurement Information Infrastructure (MII) Measurand Taxonomy Catalog
          </p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' && (
        <TaxonomyCombinedView taxons={taxons} hideHeader={true} hideExports={true} />
      )}
      
      {activeTab === 'disciplines' && (
        <div>
          <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
            <h2 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Measurement Disciplines
            </h2>
            <p className="text-[#656d76] dark:text-[#8b949e] text-base">
              Browse the taxonomy organized by measurement disciplines. Each discipline represents a domain
              of measurement science with its own specialized taxons and parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disciplineInfos.map((discipline) => (
              <Link
                key={discipline.name}
                href={`/disciplines/${encodeURIComponent(discipline.name)}`}
                className="border border-[#d0d7de] dark:border-[#30363d] rounded-md p-6 hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
                    <h3 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
                      {discipline.name}
                    </h3>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#656d76] dark:text-[#8b949e]" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                    <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">
                      {discipline.taxonCount}
                    </span>{' '}
                    {discipline.taxonCount === 1 ? 'taxon' : 'taxons'}
                  </p>
                  
                  {discipline.commonParameters.length > 0 && (
                    <div>
                      <p className="text-xs text-[#656d76] dark:text-[#8b949e] mb-1">
                        Common parameters:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {discipline.commonParameters.slice(0, 3).map((param) => (
                          <span
                            key={param}
                            className="text-xs px-2 py-0.5 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded-md border border-[#54aeff] dark:border-[#1f6feb]"
                          >
                            {param}
                          </span>
                        ))}
                        {discipline.commonParameters.length > 3 && (
                          <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                            +{discipline.commonParameters.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {discipline.relatedDisciplines.length > 0 && (
                    <div>
                      <p className="text-xs text-[#656d76] dark:text-[#8b949e]">
                        Related: {discipline.relatedDisciplines.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {disciplineInfos.length === 0 && (
            <div className="text-center py-16 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
              <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
                No disciplines found in the taxonomy.
              </p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'quantities' && (
        <div>
          <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
            <h2 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Quantity Kinds
            </h2>
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
                      <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3]">
                        {quantity.name}
                      </h3>
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
      )}
      
      {activeTab === 'compare' && (
        <div>
          <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
            <h2 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
              Compare Taxons
            </h2>
            <p className="text-[#656d76] dark:text-[#8b949e] text-base">
              Select 2-4 taxons to compare their parameters, disciplines, quantities, and definitions side-by-side.
            </p>
          </div>
          <ComparePageClient taxons={taxons} />
        </div>
      )}
    </div>
  );
}
