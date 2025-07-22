'use client';

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen, TreePine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Taxonomy, Taxon } from '@/types/taxonomy';

interface TreeNode {
  name: string;
  fullPath: string;
  children: { [key: string]: TreeNode };
  taxon?: Taxon;
  isLeaf: boolean;
  level: number;
}

interface TaxonomyTreeProps {
  taxonomy: Taxonomy | null;
  searchTerm?: string;
}

export default function TaxonomyTree({ taxonomy, searchTerm = '' }: TaxonomyTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['Measure', 'Source']));
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);

  // Build hierarchical tree structure
  const treeData = useMemo(() => {
    if (!taxonomy) return {};

    const tree: { [key: string]: TreeNode } = {};

    taxonomy.taxons.forEach(taxon => {
      // Skip if search term doesn't match
      if (searchTerm && !taxon.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !taxon.definition?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }

      const parts = taxon.name.split('.');
      let currentLevel = tree;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}.${part}` : part;
        
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            fullPath: currentPath,
            children: {},
            isLeaf: index === parts.length - 1,
            level: index,
            taxon: index === parts.length - 1 ? taxon : undefined
          };
        }

        if (index === parts.length - 1) {
          currentLevel[part].taxon = taxon;
          currentLevel[part].isLeaf = true;
        }

        currentLevel = currentLevel[part].children;
      });
    });

    return tree;
  }, [taxonomy, searchTerm]);

  const toggleNode = (fullPath: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(fullPath)) {
      newExpanded.delete(fullPath);
    } else {
      newExpanded.add(fullPath);
    }
    setExpandedNodes(newExpanded);
  };

  const selectNode = (node: TreeNode) => {
    setSelectedNode(node);
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const hasChildren = Object.keys(node.children).length > 0;
    const isExpanded = expandedNodes.has(node.fullPath);
    const isSelected = selectedNode?.fullPath === node.fullPath;

    return (
      <div key={node.fullPath} className="select-none">
        <div
          className={`flex items-center py-2 px-2 cursor-pointer rounded-md transition-colors ${
            isSelected ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.fullPath);
            }
            selectNode(node);
          }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <div className="mr-2 transition-transform duration-200">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          ) : (
            <div className="w-6 mr-2" /> // Spacer for alignment
          )}

          {/* Folder/File Icon */}
          <div className="mr-2">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              <FileText className="h-4 w-4 text-green-500" />
            )}
          </div>

          {/* Node Name */}
          <span className={`font-medium ${hasChildren ? 'text-gray-900' : 'text-gray-700'}`}>
            {node.name}
          </span>

          {/* Badges */}
          <div className="ml-auto flex gap-1">
            {node.taxon?.deprecated && (
              <Badge variant="destructive">Deprecated</Badge>
            )}
            {node.taxon && (
              <Badge variant="secondary">
                {node.taxon.parameters?.length || 0} params
              </Badge>
            )}
            {hasChildren && (
              <Badge variant="outline">
                {Object.keys(node.children).length}
              </Badge>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-4">
            {Object.values(node.children)
              .sort((a, b) => {
                // Sort folders first, then files
                if (Object.keys(a.children).length > 0 && Object.keys(b.children).length === 0) return -1;
                if (Object.keys(a.children).length === 0 && Object.keys(b.children).length > 0) return 1;
                return a.name.localeCompare(b.name);
              })
              .map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderNodeDetails = () => {
    if (!selectedNode || !selectedNode.taxon) return null;

    const taxon = selectedNode.taxon;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">{taxon.name}</CardTitle>
          <div className="flex gap-2">
            {taxon.disciplines?.map(disc => (
              <Badge variant="outline" key={disc.name}>{disc.name}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taxon.definition && (
              <div>
                <h4 className="font-semibold text-sm">Definition</h4>
                <p className="text-sm text-gray-600 mt-1">{taxon.definition}</p>
              </div>
            )}

            {taxon.result && (
              <div>
                <h4 className="font-semibold text-sm">Result</h4>
                <div className="text-sm text-gray-600 mt-1">
                  <div><strong>Quantity:</strong> {taxon.result.quantity?.name || 'N/A'}</div>
                  {taxon.result.mLayer && (
                    <div><strong>M-Layer:</strong> {taxon.result.mLayer.aspect} (ID: {taxon.result.mLayer.id})</div>
                  )}
                </div>
              </div>
            )}

            {taxon.parameters && taxon.parameters.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm">Parameters ({taxon.parameters.length})</h4>
                <div className="mt-2 space-y-2">
                  {taxon.parameters.map((param, idx) => (
                    <div key={idx} className="border rounded p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <strong>{param.name}</strong>
                        <Badge variant={param.optional ? 'secondary' : 'default'}>
                          {param.optional ? 'Optional' : 'Required'}
                        </Badge>
                      </div>
                      {param.definition && (
                        <div className="text-gray-600 mt-1">{param.definition}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {param.quantity?.name && `Quantity: ${param.quantity.name}`}
                        {param.mLayer?.aspect && ` | M-Layer: ${param.mLayer.aspect}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!taxonomy) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <p className="text-muted-foreground">Loading taxonomy tree...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (Object.keys(treeData).length === 0) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[600px]">
      {/* Tree View */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TreePine className="h-5 w-5" />
              Taxonomy Tree View
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Click to expand categories and select measurands
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {treeData && Object.entries(treeData).map(([, rootNode]) => 
                renderNode(rootNode)
              )}
              {!treeData && (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Loading taxonomy tree...</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Panel */}
      <div className="lg:col-span-3">
        {selectedNode ? (
          renderNodeDetails()
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <div className="text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Select a measurand to view details</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 