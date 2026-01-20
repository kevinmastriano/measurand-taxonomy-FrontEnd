'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Taxon } from '@/lib/types';
import { Search, List, TreePine, Filter, X } from 'lucide-react';
import TaxonomyListView from './TaxonomyListView';
import TaxonomyTreeView from './TaxonomyTreeView';
import CompleteTaxonomyExport from './CompleteTaxonomyExport';
import { buildTaxonomyTree } from '@/lib/xml-parser';
import { filterTaxonsByDisciplines, getAllDisciplines } from '@/lib/discipline-utils';
import { useURLState } from '@/hooks/useURLState';

interface TaxonomyCombinedViewProps {
  taxons: Taxon[];
  hideHeader?: boolean;
  hideExports?: boolean;
}

export default function TaxonomyCombinedView({ taxons, hideHeader = false, hideExports = false }: TaxonomyCombinedViewProps) {
  const { urlState, updateURL } = useURLState();
  
  // Initialize state from URL
  const [viewMode, setViewMode] = useState<'list' | 'tree'>(urlState.view);
  const [searchQuery, setSearchQuery] = useState(urlState.q);
  const [showDeprecated, setShowDeprecated] = useState(urlState.deprecated);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(urlState.discipline);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sync state to URL when it changes
  useEffect(() => {
    updateURL({
      view: viewMode,
      q: searchQuery,
      deprecated: showDeprecated,
      discipline: selectedDisciplines,
    });
  }, [viewMode, searchQuery, showDeprecated, selectedDisciplines, updateURL]);

  // Filter out deprecated items if toggle is off
  const nonDeprecatedTaxons = useMemo(() => {
    return showDeprecated ? taxons : taxons.filter(taxon => !taxon.deprecated);
  }, [taxons, showDeprecated]);

  // Filter by selected disciplines
  const disciplineFilteredTaxons = useMemo(() => {
    if (selectedDisciplines.length === 0) return nonDeprecatedTaxons;
    return filterTaxonsByDisciplines(nonDeprecatedTaxons, selectedDisciplines);
  }, [nonDeprecatedTaxons, selectedDisciplines]);

  const tree = useMemo(() => {
    return buildTaxonomyTree(disciplineFilteredTaxons);
  }, [disciplineFilteredTaxons]);

  const filteredTaxons = useMemo(() => {
    let filtered = disciplineFilteredTaxons;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = disciplineFilteredTaxons.filter(
        (taxon) =>
          taxon.name.toLowerCase().includes(query) ||
          taxon.Definition?.toLowerCase().includes(query) ||
          taxon.Discipline?.some((d) => d.name.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [disciplineFilteredTaxons, searchQuery]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isFilterOpen && !(event.target as Element).closest('.filter-dropdown-container')) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isFilterOpen]);

  // Discipline filter dropdown component
  const DisciplineFilterDropdown = ({ taxons, selectedDisciplines, onDisciplinesChange }: {
    taxons: Taxon[];
    selectedDisciplines: string[];
    onDisciplinesChange: (disciplines: string[]) => void;
  }) => {
    const allDisciplines = useMemo(() => getAllDisciplines(taxons), [taxons]);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleDiscipline = (discipline: string) => {
      if (selectedDisciplines.includes(discipline)) {
        onDisciplinesChange(selectedDisciplines.filter(d => d !== discipline));
      } else {
        onDisciplinesChange([...selectedDisciplines, discipline]);
      }
    };

    const clearAll = () => {
      onDisciplinesChange([]);
    };

    // Count taxons per discipline
    const disciplineCounts = useMemo(() => {
      const counts = new Map<string, number>();
      taxons.forEach(taxon => {
        taxon.Discipline?.forEach(disc => {
          if (disc.name && disc.name.trim()) {
            const count = counts.get(disc.name) || 0;
            counts.set(disc.name, count + 1);
          }
        });
      });
      return counts;
    }, [taxons]);

    return (
      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3]">
            Filter by Discipline
          </h3>
          {selectedDisciplines.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allDisciplines.slice(0, isExpanded ? allDisciplines.length : 10).map((discipline) => {
            const isSelected = selectedDisciplines.includes(discipline);
            const count = disciplineCounts.get(discipline) || 0;
            
            return (
              <button
                key={discipline}
                onClick={() => toggleDiscipline(discipline)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md border transition-colors ${
                  isSelected
                    ? 'bg-[#0969da] dark:bg-[#58a6ff] text-white border-[#0969da] dark:border-[#58a6ff]'
                    : 'bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border-[#d0d7de] dark:border-[#30363d] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22]'
                }`}
              >
                <span>{discipline}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-[#f6f8fa] dark:bg-[#161b22] text-[#656d76] dark:text-[#8b949e]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {allDisciplines.length > 10 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2 text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline text-center py-2"
          >
            {isExpanded ? 'Show less' : `+${allDisciplines.length - 10} more`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Export buttons - aligned right with vertical line on left */}
      {!hideExports && (
        <div className="mb-2 flex items-center justify-end">
          <div className="h-6 w-px bg-[#d0d7de] dark:bg-[#30363d] mr-4"></div>
          <CompleteTaxonomyExport taxons={taxons} />
        </div>
      )}

      {/* Header */}
      {!hideHeader && (
        <div className="mb-4 pb-3 border-b border-[#d0d7de] dark:border-[#30363d]">
          <h1 className="text-2xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-1">
            Measurand Taxonomy Catalog
          </h1>
          <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
            NCSL International Measurement Information Infrastructure (MII) Measurand Taxonomy Catalog
          </p>
        </div>
      )}

      {/* View Mode Toggle - GitHub style */}
      <div className="mb-4 flex items-center justify-between border-b border-[#d0d7de] dark:border-[#30363d]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded-t-md ${
              viewMode === 'list'
                ? 'text-[#24292f] dark:text-[#e6edf3] border-b-2 border-[#fd7e14] dark:border-[#fd7e14] bg-transparent'
                : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] border-b-2 border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d]'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] rounded-t-md ${
              viewMode === 'tree'
                ? 'text-[#24292f] dark:text-[#e6edf3] border-b-2 border-[#fd7e14] dark:border-[#fd7e14] bg-transparent'
                : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] border-b-2 border-transparent hover:border-[#d0d7de] dark:hover:border-[#30363d]'
            }`}
          >
            <TreePine className="w-4 h-4" />
            <span>Tree</span>
          </button>
        </div>
        
        {/* Show Deprecated Toggle */}
        <div className="flex items-center gap-2 px-4 py-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-[#656d76] dark:text-[#8b949e]">Show deprecated</span>
            <button
              type="button"
              role="switch"
              aria-checked={showDeprecated}
              onClick={() => setShowDeprecated(!showDeprecated)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-offset-2 ${
                showDeprecated
                  ? 'bg-[#0969da] dark:bg-[#58a6ff]'
                  : 'bg-[#d0d7de] dark:bg-[#30363d]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showDeprecated ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Search Bar with Filter Button */}
      <div className="mb-4">
        <div className="relative flex items-center gap-2 p-1 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#656d76] dark:text-[#8b949e] w-4 h-4" />
            <input
              type="text"
              placeholder="Search taxonomy by name, definition, or discipline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suppressHydrationWarning
              className="w-full pl-10 pr-4 py-2.5 text-sm border-0 rounded-md bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] placeholder-[#656d76] dark:placeholder-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] transition-all shadow-sm"
            />
          </div>
          
          {/* Filter Button */}
          <div className="relative filter-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFilterOpen(!isFilterOpen);
              }}
              className={`flex items-center justify-center w-10 h-10 border-0 rounded-md bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-all focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] shadow-sm ${
                selectedDisciplines.length > 0 ? 'bg-[#ddf4ff] dark:bg-[#0c2d41] ring-2 ring-[#0969da] dark:ring-[#58a6ff]' : ''
              }`}
              title="Filter by discipline"
            >
              <Filter className={`w-4 h-4 ${selectedDisciplines.length > 0 ? 'text-[#0969da] dark:text-[#58a6ff]' : 'text-[#656d76] dark:text-[#8b949e]'}`} />
              {selectedDisciplines.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0969da] dark:bg-[#58a6ff] text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                  {selectedDisciplines.length}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsFilterOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                  <DisciplineFilterDropdown
                    taxons={taxons}
                    selectedDisciplines={selectedDisciplines}
                    onDisciplinesChange={setSelectedDisciplines}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Selected Disciplines Badges */}
        {selectedDisciplines.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedDisciplines.map((discipline) => (
              <button
                key={discipline}
                onClick={() => setSelectedDisciplines(selectedDisciplines.filter(d => d !== discipline))}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#0969da] dark:bg-[#58a6ff] text-white rounded-md hover:bg-[#0860ca] dark:hover:bg-[#79c0ff] transition-colors"
              >
                {discipline}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              onClick={() => setSelectedDisciplines([])}
              className="text-xs text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] px-2 py-1"
            >
              Clear all
            </button>
          </div>
        )}
        <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-2 ml-1">
          {viewMode === 'list' 
            ? `${filteredTaxons.length} ${filteredTaxons.length === 1 ? 'taxon' : 'taxons'}${filteredTaxons.length !== disciplineFilteredTaxons.length ? ` of ${disciplineFilteredTaxons.length}` : ''}${selectedDisciplines.length > 0 ? ` (filtered by ${selectedDisciplines.length} ${selectedDisciplines.length === 1 ? 'discipline' : 'disciplines'})` : ''}${!showDeprecated && taxons.length !== nonDeprecatedTaxons.length ? ` (${taxons.length - nonDeprecatedTaxons.length} deprecated hidden)` : ''}`
            : `${disciplineFilteredTaxons.length} ${disciplineFilteredTaxons.length === 1 ? 'taxon' : 'taxons'} in tree structure${selectedDisciplines.length > 0 ? ` (filtered by ${selectedDisciplines.length} ${selectedDisciplines.length === 1 ? 'discipline' : 'disciplines'})` : ''}${!showDeprecated && taxons.length !== nonDeprecatedTaxons.length ? ` (${taxons.length - nonDeprecatedTaxons.length} deprecated hidden)` : ''}`
          }
        </p>
      </div>

      {/* Render the selected view */}
      {viewMode === 'list' ? (
        <TaxonomyListView taxons={filteredTaxons} allTaxons={taxons} />
      ) : (
        <div>
          {searchQuery && (
            <div className="mb-4 p-3 bg-[#ddf4ff] dark:bg-[#0c2d41] border border-[#54aeff] dark:border-[#1f6feb] rounded-md">
              <p className="text-sm text-[#0969da] dark:text-[#58a6ff]">
                <strong>Note:</strong> Search filtering is not available in tree view. Showing all taxons.
              </p>
            </div>
          )}
          <TaxonomyTreeView tree={tree} taxons={disciplineFilteredTaxons} allTaxons={taxons} />
        </div>
      )}
    </div>
  );
}

