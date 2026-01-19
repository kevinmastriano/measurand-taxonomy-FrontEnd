'use client';

import { useState, useEffect } from 'react';
import { TaxonomyChange, TaxonChange, Taxon } from '@/lib/types';
import {
  GitCommit as GitCommitIcon,
  User,
  Calendar,
  Plus,
  Minus,
  AlertTriangle,
  Edit,
  ChevronDown,
  ChevronRight,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface TaxonomyChangeListProps {
  initialChanges?: TaxonomyChange[];
}

export default function TaxonomyChangeList({ initialChanges }: TaxonomyChangeListProps) {
  const [changes, setChanges] = useState<TaxonomyChange[]>(initialChanges || []);
  const [loading, setLoading] = useState(!initialChanges);
  const [error, setError] = useState<string | null>(null);
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [expandedTaxons, setExpandedTaxons] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{ fromCache?: boolean; cacheAgeMs?: number } | null>(null);
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [resetMenuPosition, setResetMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!initialChanges) {
      fetchTaxonomyHistory();
    }
  }, [initialChanges]);

  const handleForceReset = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setShowResetMenu(false);

      // Delete cache file
      const resetResponse = await fetch('/api/history/taxonomy/reset', {
        method: 'POST',
      });
      
      if (!resetResponse.ok) {
        throw new Error('Failed to reset cache');
      }

      // Wait a moment for cache deletion to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now force refresh
      await fetchTaxonomyHistory(true);
    } catch (err) {
      console.error('Error resetting cache:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset cache');
      setIsRefreshing(false);
    }
  };

  const fetchTaxonomyHistory = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const url = forceRefresh 
        ? '/api/history/taxonomy?refresh=true'
        : '/api/history/taxonomy';
      
      console.log(`Fetching taxonomy history from API${forceRefresh ? ' (force refresh)' : ''}...`);
      const response = await fetch(url);

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errorDetails ||
            errorData.error ||
            `HTTP ${response.status}: Failed to fetch taxonomy history`
        );
      }

      const data = await response.json();
      console.log('API response data:', data);

      if (data.error && !data.changes) {
        throw new Error(
          data.errorDetails || data.error || 'Failed to fetch taxonomy history'
        );
      }

      setChanges(data.changes || []);
      setCacheInfo({
        fromCache: data.fromCache || false,
        cacheAgeMs: data.cacheAgeMs,
      });

      if (data.processingTimeMs) {
        console.log(`Taxonomy history loaded in ${data.processingTimeMs}ms${data.fromCache ? ' (from cache)' : ''}`);
      }

      if (data.totalCommits) {
        console.log(
          `Processed ${data.totalCommits} commits, found ${data.commitsWithChanges || 0} with taxonomy changes`
        );
      }
    } catch (err) {
      console.error('Error fetching taxonomy history:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load taxonomy history';
      setError(errorMessage);
      console.error('Full error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchTaxonomyHistory(true);
  };

  // Close reset menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showResetMenu) {
        setShowResetMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showResetMenu]);

  const toggleCommit = (hash: string) => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(hash)) {
      newExpanded.delete(hash);
    } else {
      newExpanded.add(hash);
    }
    setExpandedCommits(newExpanded);
  };

  const toggleTaxon = (key: string) => {
    const newExpanded = new Set(expandedTaxons);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedTaxons(newExpanded);
  };

  const getChangeTypeIcon = (changeType: TaxonChange['changeType']) => {
    switch (changeType) {
      case 'added':
        return <Plus className="w-4 h-4 text-[#1a7f37] dark:text-[#3fb950]" />;
      case 'removed':
        return <Minus className="w-4 h-4 text-[#cf222e] dark:text-[#f85149]" />;
      case 'deprecated':
        return <AlertTriangle className="w-4 h-4 text-[#9a6700] dark:text-[#d29922]" />;
      case 'modified':
        return <Edit className="w-4 h-4 text-[#0969da] dark:text-[#58a6ff]" />;
      default:
        return null;
    }
  };

  const getChangeTypeColor = (changeType: TaxonChange['changeType']) => {
    switch (changeType) {
      case 'added':
        return 'bg-[#dafbe1] dark:bg-[#033a16] text-[#1a7f37] dark:text-[#3fb950] border-[#4ae168] dark:border-[#238636]';
      case 'removed':
        return 'bg-[#ffebe9] dark:bg-[#490202] text-[#cf222e] dark:text-[#f85149] border-[#ff8182] dark:border-[#da3633]';
      case 'deprecated':
        return 'bg-[#fff8c5] dark:bg-[#3b2300] text-[#9a6700] dark:text-[#d29922] border-[#d4a72c] dark:border-[#bb8009]';
      case 'modified':
        return 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] border-[#54aeff] dark:border-[#1f6feb]';
      default:
        return '';
    }
  };

  const formatValue = (value: any): string => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      if (typeof value[0] === 'string') return value.join(', ');
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderTaxonDetails = (taxon: TaxonChange['oldTaxon'] | TaxonChange['newTaxon'], isRemoved: boolean) => {
    if (!taxon) return null;

    const textColor = isRemoved 
      ? 'text-[#cf222e] dark:text-[#f85149]' 
      : 'text-[#1a7f37] dark:text-[#3fb950]';
    const bgColor = isRemoved 
      ? 'bg-[#ffebe9] dark:bg-[#490202]' 
      : 'bg-[#dafbe1] dark:bg-[#033a16]';

    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
          {isRemoved ? 'Removed Taxon Details:' : 'Added Taxon Details:'}
        </p>
        
        {/* Name */}
        <div className={`text-xs ${bgColor} p-2 rounded border border-[#d0d7de] dark:border-[#30363d]`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">Name:</span>
          </div>
          <code className={`${textColor} px-1 rounded`}>{taxon.name}</code>
        </div>

        {/* Deprecated */}
        <div className={`text-xs ${bgColor} p-2 rounded border border-[#d0d7de] dark:border-[#30363d]`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">Deprecated:</span>
          </div>
          <code className={`${textColor} px-1 rounded`}>{taxon.deprecated ? 'true' : 'false'}</code>
        </div>

        {/* Replacement */}
        {taxon.replacement && (
          <div className={`text-xs ${bgColor} p-2 rounded border border-[#d0d7de] dark:border-[#30363d]`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">Replacement:</span>
            </div>
            <code className={`${textColor} px-1 rounded`}>{taxon.replacement}</code>
          </div>
        )}

        {/* Definition */}
        {taxon.Definition && (
          <div className={`text-xs ${bgColor} p-2 rounded border border-[#d0d7de] dark:border-[#30363d]`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">Definition:</span>
            </div>
            <code className={`${textColor} px-1 rounded whitespace-pre-wrap`}>{taxon.Definition}</code>
          </div>
        )}

        {/* Result */}
        {taxon.Result && (
          <div className={`text-xs ${bgColor} p-2 rounded border border-[#d0d7de] dark:border-[#30363d]`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">Result:</span>
            </div>
            <div className="ml-2 space-y-1">
              {taxon.Result.Quantity && (
                <div>
                  <span className="text-[#656d76] dark:text-[#8b949e]">Quantity: </span>
                  <code className={`${textColor} px-1 rounded`}>{taxon.Result.Quantity.name}</code>
                </div>
              )}
              {taxon.Result.mLayer && (
                <div>
                  <span className="text-[#656d76] dark:text-[#8b949e]">mLayer: </span>
                  <code className={`${textColor} px-1 rounded`}>
                    {taxon.Result.mLayer.aspect} ({taxon.Result.mLayer.id})
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Parameters */}
        {taxon.Parameter && taxon.Parameter.length > 0 && (
          <div className={`text-xs ${bgColor} p-2 rounded border border-[#d0d7de] dark:border-[#30363d]`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">
                Parameters ({taxon.Parameter.length}):
              </span>
            </div>
            <div className="ml-2 space-y-1">
              {taxon.Parameter.map((param, idx) => (
                <div key={idx} className="border-l-2 border-[#d0d7de] dark:border-[#30363d] pl-2">
                  <div>
                    <span className="text-[#656d76] dark:text-[#8b949e]">Name: </span>
                    <code className={`${textColor} px-1 rounded`}>{param.name}</code>
                    {param.optional && (
                      <span className="text-[#656d76] dark:text-[#8b949e] ml-2">(optional)</span>
                    )}
                  </div>
                  {param.Definition && (
                    <div className="mt-1">
                      <span className="text-[#656d76] dark:text-[#8b949e]">Definition: </span>
                      <code className={`${textColor} px-1 rounded text-[10px]`}>{param.Definition}</code>
                    </div>
                  )}
                  {param.Quantity && (
                    <div className="mt-1">
                      <span className="text-[#656d76] dark:text-[#8b949e]">Quantity: </span>
                      <code className={`${textColor} px-1 rounded`}>{param.Quantity.name}</code>
                    </div>
                  )}
                  {param.Property && (
                    <div className="mt-1">
                      <span className="text-[#656d76] dark:text-[#8b949e]">Property: </span>
                      <code className={`${textColor} px-1 rounded`}>
                        {param.Property.name} ({param.Property.id})
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disciplines */}
        {taxon.Discipline && taxon.Discipline.length > 0 && (
          <div className={`text-xs ${bgColor} p-2 rounded border border-[#d0d7de] dark:border-[#30363d]`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">
                Disciplines ({taxon.Discipline.length}):
              </span>
            </div>
            <div className="ml-2">
              <code className={`${textColor} px-1 rounded`}>
                {taxon.Discipline.map(d => d.name).join(', ')}
              </code>
            </div>
          </div>
        )}

        {/* External References */}
        {taxon.ExternalReferences && taxon.ExternalReferences.Reference && (
          (() => {
            const references = Array.isArray(taxon.ExternalReferences.Reference) 
              ? taxon.ExternalReferences.Reference 
              : [taxon.ExternalReferences.Reference];
            return references.length > 0 ? (
              <div className={`text-xs ${bgColor} p-2 rounded border border-[#d0d7de] dark:border-[#30363d]`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">
                    External References ({references.length}):
                  </span>
                </div>
                <div className="ml-2 space-y-1">
                  {references.map((ref, idx) => (
                <div key={idx} className="border-l-2 border-[#d0d7de] dark:border-[#30363d] pl-2">
                  {ref.CategoryTag && (
                    <div>
                      <span className="text-[#656d76] dark:text-[#8b949e]">Category: </span>
                      <code className={`${textColor} px-1 rounded`}>
                        {ref.CategoryTag.name} = {ref.CategoryTag.value}
                      </code>
                    </div>
                  )}
                  {ref.ReferenceUrl && (
                    <div className="mt-1">
                      <span className="text-[#656d76] dark:text-[#8b949e]">URL: </span>
                      <code className={`${textColor} px-1 rounded`}>
                        {ref.ReferenceUrl.name} - {ref.ReferenceUrl.url}
                      </code>
                    </div>
                  )}
                </div>
              ))}
                </div>
              </div>
            ) : null;
          })()
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-16 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0969da] dark:border-[#58a6ff]"></div>
          <div>
            <p className="text-[#656d76] dark:text-[#8b949e] text-sm font-medium mb-1">
              Loading taxonomy history...
            </p>
            <p className="text-[#656d76] dark:text-[#8b949e] text-xs">
              This may take a moment as we analyze Git history
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
        <p className="text-[#cf222e] dark:text-[#f85149] text-sm mb-2">
          Error loading taxonomy history
        </p>
        <p className="text-[#656d76] dark:text-[#8b949e] text-xs">{error}</p>
        <button
          onClick={() => fetchTaxonomyHistory(true)}
          className="mt-4 px-4 py-2 bg-[#0969da] dark:bg-[#1f6feb] text-white rounded-md text-sm hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="text-center py-16 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
        <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
          No taxonomy changes found in the revision history.
        </p>
      </div>
    );
  }

  const formatCacheAge = (ageMs?: number) => {
    if (!ageMs) return '';
    const minutes = Math.floor(ageMs / 60000);
    const seconds = Math.floor((ageMs % 60000) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
            Showing {changes.length} commit{changes.length === 1 ? '' : 's'} with taxonomy changes
          </p>
          {cacheInfo && (
            <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-1">
              {cacheInfo.fromCache ? (
                <>Cached data • Last updated {formatCacheAge(cacheInfo.cacheAgeMs)}</>
              ) : (
                <>Fresh data • Just loaded</>
              )}
            </p>
          )}
        </div>
        <div className="relative">
          <button
            onClick={handleRefresh}
            onContextMenu={(e) => {
              e.preventDefault();
              setResetMenuPosition({ x: e.clientX, y: e.clientY });
              setShowResetMenu(true);
            }}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#24292f] dark:text-[#e6edf3] hover:bg-[#f3f4f6] dark:hover:bg-[#21262d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh taxonomy history (Right-click for options)"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          
          {showResetMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowResetMenu(false)}
              />
              <div
                className="fixed z-20 mt-1 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg py-1 min-w-[200px]"
                style={{
                  left: `${resetMenuPosition.x}px`,
                  top: `${resetMenuPosition.y}px`,
                  transform: 'translate(-100%, 0)',
                }}
              >
                <button
                  onClick={handleForceReset}
                  className="w-full text-left px-3 py-2 text-sm text-[#24292f] dark:text-[#e6edf3] hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors"
                >
                  Force Cache Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {changes.map((change) => {
        const isCommitExpanded = expandedCommits.has(change.commitHash);

        return (
          <div
            key={change.commitHash}
            className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]"
          >
            <button
              onClick={() => toggleCommit(change.commitHash)}
              className="w-full px-4 py-3 flex items-start justify-between hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-inset"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <GitCommitIcon className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
                  <code className="text-sm font-mono text-[#0969da] dark:text-[#58a6ff] bg-[#f6f8fa] dark:bg-[#161b22] px-1.5 py-0.5 rounded border border-[#d0d7de] dark:border-[#30363d]">
                    {change.commitHash}
                  </code>
                  <span className="px-2 py-0.5 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded-md text-xs font-medium border border-[#54aeff] dark:border-[#1f6feb]">
                    {change.changes.length} {change.changes.length === 1 ? 'change' : 'changes'}
                  </span>
                </div>
                <p className="text-sm font-medium text-[#24292f] dark:text-[#e6edf3] mb-2">
                  {change.commitMessage}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#656d76] dark:text-[#8b949e] flex-wrap">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{change.commitAuthor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{change.commitDate}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {isCommitExpanded ? (
                  <ChevronDown className="w-5 h-5 text-[#656d76] dark:text-[#8b949e]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#656d76] dark:text-[#8b949e]" />
                )}
              </div>
            </button>

            {isCommitExpanded && (
              <div className="px-4 py-4 bg-[#f6f8fa] dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d]">
                <div className="space-y-2">
                  {change.changes.map((taxonChange, idx) => {
                    const taxonKey = `${change.commitHash}-${taxonChange.taxonName}`;
                    const isTaxonExpanded = expandedTaxons.has(taxonKey);

                    return (
                      <div
                        key={idx}
                        className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#ffffff] dark:bg-[#0d1117] overflow-hidden"
                      >
                        <button
                          onClick={() => toggleTaxon(taxonKey)}
                          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getChangeTypeIcon(taxonChange.changeType)}
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getChangeTypeColor(
                                taxonChange.changeType
                              )}`}
                            >
                              {taxonChange.changeType.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-[#24292f] dark:text-[#e6edf3] truncate">
                              {taxonChange.taxonName}
                            </span>
                            {taxonChange.fieldChanges && taxonChange.fieldChanges.length > 0 && (
                              <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                                ({taxonChange.fieldChanges.length} field changes)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <Link
                              href={`/taxons/${encodeURIComponent(taxonChange.taxonName)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#0969da] dark:text-[#58a6ff] hover:underline"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </Link>
                            {isTaxonExpanded ? (
                              <ChevronDown className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
                            )}
                          </div>
                        </button>

                        {isTaxonExpanded && (
                          <div className="px-3 py-2 bg-[#f6f8fa] dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d]">
                            {taxonChange.changeType === 'added' && taxonChange.newTaxon ? (
                              renderTaxonDetails(taxonChange.newTaxon, false)
                            ) : taxonChange.changeType === 'removed' && taxonChange.oldTaxon ? (
                              renderTaxonDetails(taxonChange.oldTaxon, true)
                            ) : taxonChange.changeType === 'deprecated' ? (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                                  Deprecated Taxon:
                                </p>
                                {taxonChange.newTaxon && renderTaxonDetails(taxonChange.newTaxon, false)}
                              </div>
                            ) : taxonChange.fieldChanges && taxonChange.fieldChanges.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                                  Field Changes:
                                </p>
                                {taxonChange.fieldChanges.map((fieldChange, fieldIdx) => (
                                  <div
                                    key={fieldIdx}
                                    className="text-xs bg-[#ffffff] dark:bg-[#0d1117] p-2 rounded border border-[#d0d7de] dark:border-[#30363d]"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-[#24292f] dark:text-[#e6edf3]">
                                        {fieldChange.field}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                          fieldChange.changeType === 'added'
                                            ? 'bg-[#dafbe1] dark:bg-[#033a16] text-[#1a7f37] dark:text-[#3fb950]'
                                            : fieldChange.changeType === 'removed'
                                            ? 'bg-[#ffebe9] dark:bg-[#490202] text-[#cf222e] dark:text-[#f85149]'
                                            : 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff]'
                                        }`}
                                      >
                                        {fieldChange.changeType.toUpperCase()}
                                      </span>
                                    </div>
                                    {fieldChange.oldValue !== undefined && (
                                      <div className="mb-1">
                                        <span className="text-[#656d76] dark:text-[#8b949e]">Old: </span>
                                        <code className="text-[#cf222e] dark:text-[#f85149] bg-[#ffebe9] dark:bg-[#490202] px-1 rounded">
                                          {formatValue(fieldChange.oldValue)}
                                        </code>
                                      </div>
                                    )}
                                    {fieldChange.newValue !== undefined && (
                                      <div>
                                        <span className="text-[#656d76] dark:text-[#8b949e]">New: </span>
                                        <code className="text-[#1a7f37] dark:text-[#3fb950] bg-[#dafbe1] dark:bg-[#033a16] px-1 rounded">
                                          {formatValue(fieldChange.newValue)}
                                        </code>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-[#656d76] dark:text-[#8b949e]">
                                {taxonChange.changeType === 'modified' && 'Taxon was modified (no field details available)'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

