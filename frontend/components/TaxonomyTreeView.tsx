'use client';

import { useState, useRef, useEffect } from 'react';
import { Taxon } from '@/lib/types';
import { ChevronRight, ChevronDown, Circle, ChevronsDown, ChevronsRight } from 'lucide-react';
import CopyButton from './CopyButton';
import TaxonShareButton from './TaxonShareButton';
import Breadcrumb from './Breadcrumb';
import RelatedTaxons from './RelatedTaxons';
import TaxonVersionHistory from './TaxonVersionHistory';
import ExportButtons from './ExportButtons';
import MLayerBadge from './MLayerBadge';
import { generateBreadcrumbsFromTaxon } from '@/lib/breadcrumb-utils';

interface TreeNode {
  name: string;
  fullName: string;
  children: TreeNode[];
  taxon?: Taxon;
  level: number;
}

interface TaxonomyTreeViewProps {
  tree: TreeNode;
  taxons: Taxon[];
  allTaxons?: Taxon[]; // For related taxons feature
}

interface TreeNodeComponentProps {
  node: TreeNode;
  taxons: Taxon[];
  allTaxons?: Taxon[];
  level?: number;
  expandedState?: Map<string, boolean>;
  onToggle?: (fullName: string) => void;
  expandAll?: boolean;
}

function TreeNodeComponent({ node, taxons, allTaxons, level = 0, expandedState, onToggle, expandAll }: TreeNodeComponentProps & { allTaxons?: Taxon[] }) {
  const hasChildren = node.children.length > 0;
  const isLeaf = node.taxon !== undefined;
  
  // Use controlled state if expandAll mode is active, otherwise use local state
  // Default to collapsed (false) for all nodes
  const [localExpanded, setLocalExpanded] = useState(false);
  const controlledExpanded = expandedState?.get(node.fullName) ?? false;
  const expanded = expandAll !== undefined ? controlledExpanded : localExpanded;
  
  const [selectedTaxon, setSelectedTaxon] = useState<string | null>(null);

  const handleClick = () => {
    if (hasChildren) {
      if (expandAll !== undefined && onToggle) {
        // Controlled mode - use the toggle handler
        onToggle(node.fullName);
      } else {
        // Local mode - use local state
        setLocalExpanded(!localExpanded);
      }
    }
    if (isLeaf && node.taxon) {
      setSelectedTaxon(selectedTaxon === node.taxon.name ? null : node.taxon.name);
    }
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-2 px-3 rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-inset transition-colors ${
          isLeaf ? 'font-medium' : ''
        } ${selectedTaxon === node.taxon?.name ? 'bg-[#ddf4ff] dark:bg-[#0c2d41]' : ''}`}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={handleClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {hasChildren && (
          <div className="mr-1">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
            ) : (
              <ChevronRight className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
            )}
          </div>
        )}
        {!hasChildren && <div className="w-4 mr-1" />}
        {isLeaf ? (
          <Circle className="w-2 h-2 mr-2 text-[#0969da] dark:text-[#58a6ff] fill-current" />
        ) : (
          <div className="w-2 h-2 mr-2" />
        )}
        <span className={`text-sm flex-1 ${isLeaf ? 'text-[#0969da] dark:text-[#58a6ff] hover:underline font-mono' : 'text-[#24292f] dark:text-[#e6edf3]'}`}>
          {node.name}
        </span>
        {isLeaf && (
          <div className="ml-3 flex items-center gap-1">
            <CopyButton text={node.fullName} label="taxon name" size="sm" />
            <TaxonShareButton taxonName={node.fullName} size="sm" />
          </div>
        )}
        {isLeaf && node.taxon?.deprecated && (
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-[#fff8c5] dark:bg-[#6e4c02] text-[#6e4c02] dark:text-[#fff8c5] rounded-full border border-[#d4a72c] dark:border-[#d4a72c] font-medium">
            Deprecated
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child, idx) => (
            <TreeNodeComponent 
              key={idx} 
              node={child} 
              taxons={taxons}
              allTaxons={allTaxons}
              level={level + 1}
              expandedState={expandedState}
              onToggle={onToggle}
              expandAll={expandAll}
            />
          ))}
        </div>
      )}

      {selectedTaxon === node.taxon?.name && node.taxon && (
        <div
          className="ml-8 mt-2 mb-4 px-4 py-4 bg-[#f6f8fa] dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d]"
          style={{ marginLeft: `${(level + 1) * 1.5}rem` }}
        >
          <Breadcrumb items={generateBreadcrumbsFromTaxon(node.taxon.name)} className="mb-4" />
          <div className="space-y-4">
            {node.taxon.Definition && (
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Definition:
                </h4>
                <p className="text-sm text-[#24292f] dark:text-[#e6edf3]">
                  {node.taxon.Definition}
                </p>
              </div>
            )}

            {node.taxon.deprecated && (
              <div className="bg-[#fff8c5] dark:bg-[#6e4c02] border border-[#d4a72c] dark:border-[#d4a72c] rounded-md p-3">
                <p className="text-sm font-medium text-[#6e4c02] dark:text-[#fff8c5]">
                  <strong>Deprecated</strong>
                  {node.taxon.replacement && (
                    <span className="ml-2">
                      → Replaced by: <code className="font-mono bg-[#ffffff] dark:bg-[#0d1117] px-1 py-0.5 rounded">{node.taxon.replacement}</code>
                    </span>
                  )}
                </p>
              </div>
            )}

            {node.taxon.Discipline && node.taxon.Discipline.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Discipline{node.taxon.Discipline.length > 1 ? 's' : ''}:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {node.taxon.Discipline.map((disc, idx) => (
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

            {node.taxon.Result && (
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Result:
                </h4>
                <div className="text-sm text-[#24292f] dark:text-[#e6edf3]">
                  {node.taxon.Result.name && <span className="font-medium">{node.taxon.Result.name}: </span>}
                  {node.taxon.Result.Quantity?.name && (
                    <code className="px-1.5 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded text-[#24292f] dark:text-[#e6edf3]">
                      {node.taxon.Result.Quantity.name}
                    </code>
                  )}
                  {node.taxon.Result.mLayer && (
                    <span className="ml-2">
                      <MLayerBadge mLayer={node.taxon.Result.mLayer} />
                    </span>
                  )}
                </div>
              </div>
            )}

            {node.taxon.Parameter && node.taxon.Parameter.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  Parameters:
                </h4>
                <div className="space-y-3">
                  {node.taxon.Parameter.map((param, idx) => (
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

            {node.taxon.ExternalReferences?.Reference && (
              <div>
                <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                  External References:
                </h4>
                <div className="space-y-2">
                  {(Array.isArray(node.taxon.ExternalReferences.Reference) 
                    ? node.taxon.ExternalReferences.Reference 
                    : [node.taxon.ExternalReferences.Reference]
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
            {allTaxons && selectedTaxon === node.taxon.name && (
              <RelatedTaxons taxon={node.taxon} allTaxons={allTaxons} />
            )}
            
            {/* Version History */}
            {selectedTaxon === node.taxon.name && (
              <TaxonVersionHistory taxonName={node.taxon.name} />
            )}
            
            {/* Export Buttons */}
            {selectedTaxon === node.taxon.name && (
              <ExportButtons taxon={node.taxon} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TaxonomyTreeView({ tree, taxons, allTaxons }: TaxonomyTreeViewProps) {
  const [expandedState, setExpandedState] = useState<Map<string, boolean>>(new Map());
  const [expandAllMode, setExpandAllMode] = useState<boolean | undefined>(undefined);

  // Collect all node fullNames recursively
  const collectAllNodes = (node: TreeNode, nodes: string[] = []): string[] => {
    if (node.children.length > 0) {
      nodes.push(node.fullName);
      node.children.forEach(child => collectAllNodes(child, nodes));
    }
    return nodes;
  };

  const allNodeNames = collectAllNodes(tree);

  const handleExpandAll = () => {
    const newState = new Map<string, boolean>();
    allNodeNames.forEach(name => newState.set(name, true));
    setExpandedState(newState);
    setExpandAllMode(true);
  };

  const handleCollapseAll = () => {
    const newState = new Map<string, boolean>();
    allNodeNames.forEach(name => newState.set(name, false));
    setExpandedState(newState);
    setExpandAllMode(false);
  };

  const handleToggle = (fullName: string) => {
    const newState = new Map(expandedState);
    const current = newState.get(fullName) ?? false;
    newState.set(fullName, !current);
    setExpandedState(newState);
  };

  return (
    <div className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117] shadow-sm">
      <div className="px-4 py-3 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
            Click on nodes to expand/collapse. Leaf nodes (with blue dot) represent complete taxons.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpandAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
              aria-label="Expand all nodes"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
              <span>Expand All</span>
            </button>
            <button
              onClick={handleCollapseAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#ffffff] dark:bg-[#0d1117] text-[#24292f] dark:text-[#e6edf3] border border-[#d0d7de] dark:border-[#30363d] rounded-md hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff]"
              aria-label="Collapse all nodes"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-h-[800px] overflow-y-auto p-4">
        <TreeNodeComponent 
          node={tree} 
          taxons={taxons}
          allTaxons={allTaxons}
          level={0}
          expandedState={expandedState}
          onToggle={handleToggle}
          expandAll={expandAllMode}
        />
      </div>
    </div>
  );
}

