'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, TreePine, List } from 'lucide-react';
import { Taxonomy, FilterOptions } from '@/types/taxonomy';
import { loadTaxonomyData, getUniqueDisciplines } from '@/lib/taxonomy-data';
import { toast } from 'sonner';
import TaxonomyTree from './TaxonomyTree';
import TaxonomyList from './TaxonomyList';

type ViewType = 'tree' | 'list';

export default function TaxonomyViewer() {
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<ViewType>('tree');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    discipline: '',
    deprecated: null,
    hasParameters: null,
  });

  // Load taxonomy data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await loadTaxonomyData();
        setTaxonomy(data);
        toast.success('Taxonomy data loaded successfully');
      } catch (error) {
        console.error('Failed to load taxonomy data:', error);
        toast.error('Failed to load taxonomy data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Get unique disciplines for filter dropdown
  const disciplines = useMemo(() => {
    return taxonomy ? getUniqueDisciplines(taxonomy) : [];
  }, [taxonomy]);

  // Filter taxons based on current filters
  const filteredTaxonomy = useMemo(() => {
    if (!taxonomy) return null;

    const filteredTaxons = taxonomy.taxons.filter(taxon => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchMatches = 
          taxon.name.toLowerCase().includes(searchLower) ||
          taxon.definition?.toLowerCase().includes(searchLower) ||
          taxon.disciplines.some(d => d.name.toLowerCase().includes(searchLower));
        
        if (!searchMatches) return false;
      }

      // Discipline filter
      if (filters.discipline && filters.discipline !== 'all') {
        const hasMatchingDiscipline = taxon.disciplines.some(d => d.name === filters.discipline);
        if (!hasMatchingDiscipline) return false;
      }

      // Deprecated filter
      if (filters.deprecated !== null) {
        if (taxon.deprecated !== filters.deprecated) return false;
      }

      // Has parameters filter
      if (filters.hasParameters !== null) {
        const hasParams = taxon.parameters.length > 0;
        if (hasParams !== filters.hasParameters) return false;
      }

      return true;
    });

    return {
      taxons: filteredTaxons
    };
  }, [taxonomy, filters]);

  const clearFilters = () => {
    setFilters({
      search: '',
      discipline: '',
      deprecated: null,
      hasParameters: null,
    });
  };

  const hasActiveFilters = filters.search || filters.discipline || 
    filters.deprecated !== null || filters.hasParameters !== null;

  // Calculate stats for the current filtered data
  const stats = useMemo(() => {
    const data = filteredTaxonomy || { taxons: [] };
    return {
      total: data.taxons.length,
      active: data.taxons.filter(t => !t.deprecated).length,
      disciplines: new Set(data.taxons.flatMap(t => t.disciplines.map(d => d.name))).size
    };
  }, [filteredTaxonomy]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading taxonomy data...</div>
        </div>
      </div>
    );
  }

  if (!taxonomy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Failed to load taxonomy data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Condensed Filter Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewType === 'tree' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('tree')}
                className="rounded-none border-0"
              >
                <TreePine className="h-4 w-4 mr-2" />
                Tree
              </Button>
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('list')}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search taxonomy..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
            </div>
            
            {/* Discipline Filter */}
            <div className="w-48">
              <Select 
                value={filters.discipline || 'all'} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, discipline: value === 'all' ? '' : value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All disciplines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All disciplines</SelectItem>
                  {disciplines.map(discipline => (
                    <SelectItem key={discipline} value={discipline}>
                      {discipline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status Filter */}
            <div className="w-32">
              <Select 
                value={filters.deprecated === null ? 'all' : filters.deprecated.toString()}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  deprecated: value === 'all' ? null : value === 'true'
                }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="false">Active</SelectItem>
                  <SelectItem value="true">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Parameters Filter */}
            <div className="w-36">
              <Select 
                value={filters.hasParameters === null ? 'all' : filters.hasParameters.toString()}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  hasParameters: value === 'all' ? null : value === 'true'
                }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Parameters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">With Params</SelectItem>
                  <SelectItem value="false">No Params</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}

            {/* Results Count */}
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {stats.total} of {taxonomy.taxons.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Content */}
      {viewType === 'tree' ? (
        <TaxonomyTree 
          taxonomy={filteredTaxonomy}
          searchTerm={filters.search}
        />
      ) : (
        <TaxonomyList 
          taxonomy={filteredTaxonomy}
          searchTerm={filters.search}
        />
      )}
    </div>
  );
} 