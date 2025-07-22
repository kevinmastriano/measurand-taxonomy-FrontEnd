'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronRight } from 'lucide-react';
import { Taxonomy, Taxon } from '@/types/taxonomy';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TaxonomyListProps {
  taxonomy: Taxonomy | null;
  searchTerm?: string;
}

export default function TaxonomyList({ taxonomy, searchTerm = '' }: TaxonomyListProps) {
  const [selectedTaxon, setSelectedTaxon] = useState<Taxon | null>(null);

  if (!taxonomy) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-muted-foreground">Loading taxonomy list...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (taxonomy.taxons.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-muted-foreground">No measurands found matching your search</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderTaxonDetails = (taxon: Taxon) => (
    <div className="space-y-6">
      {taxon.definition && (
        <div>
          <h4 className="font-semibold text-lg mb-3">Definition</h4>
          <p className="text-base text-gray-600 leading-relaxed">{taxon.definition}</p>
        </div>
      )}

      {taxon.result && (
        <div>
          <h4 className="font-semibold text-lg mb-3">Result</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-900">Quantity:</strong> 
                <span className="ml-2 text-gray-700">{taxon.result.quantity?.name || 'N/A'}</span>
              </div>
              {taxon.result.mLayer && (
                <div>
                  <strong className="text-gray-900">M-Layer:</strong> 
                  <span className="ml-2 text-gray-700">{taxon.result.mLayer.aspect} (ID: {taxon.result.mLayer.id})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {taxon.disciplines && taxon.disciplines.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg mb-3">Disciplines</h4>
          <div className="flex flex-wrap gap-2">
            {taxon.disciplines.map(discipline => (
              <Badge key={discipline.name} variant="outline" className="px-3 py-1 text-sm">
                {discipline.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {taxon.parameters && taxon.parameters.length > 0 && (
        <div>
          <h4 className="font-semibold text-lg mb-3">Parameters ({taxon.parameters.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taxon.parameters.map((param, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <strong className="text-base text-gray-900">{param.name}</strong>
                  <Badge variant={param.optional ? 'secondary' : 'default'} size="sm">
                    {param.optional ? 'Optional' : 'Required'}
                  </Badge>
                </div>
                {param.definition && (
                  <div className="text-gray-600 mb-2 text-sm leading-relaxed">{param.definition}</div>
                )}
                <div className="text-xs text-gray-500 space-y-1">
                  {param.quantity?.name && (
                    <div><span className="font-medium">Quantity:</span> {param.quantity.name}</div>
                  )}
                  {param.mLayer?.aspect && (
                    <div><span className="font-medium">M-Layer:</span> {param.mLayer.aspect}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Measurand List View
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on any measurand to view detailed information
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {taxonomy.taxons
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((taxon) => (
              <Dialog key={taxon.name}>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{taxon.name}</div>
                        {taxon.definition && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {taxon.definition}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {taxon.deprecated && (
                        <Badge variant="destructive" size="sm">Deprecated</Badge>
                      )}
                      {taxon.disciplines?.map(disc => (
                        <Badge key={disc.name} variant="outline" size="sm">
                          {disc.name}
                        </Badge>
                      ))}
                      <Badge variant="secondary" size="sm">
                        {taxon.parameters?.length || 0} params
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </DialogTrigger>
                
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto w-[90vw]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{taxon.name}</DialogTitle>
                  </DialogHeader>
                  {renderTaxonDetails(taxon)}
                </DialogContent>
              </Dialog>
            ))}
        </div>
      </CardContent>
    </Card>
  );
} 