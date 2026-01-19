'use client';

import { useState, useEffect } from 'react';
import { TaxonomyChange, TaxonChange } from '@/lib/types';
import {
  Plus,
  Minus,
  AlertTriangle,
  Edit,
  ChevronDown,
  ChevronRight,
  History,
  RefreshCw,
} from 'lucide-react';

interface TaxonVersionHistoryProps {
  taxonName: string;
}

export default function TaxonVersionHistory({ taxonName }: TaxonVersionHistoryProps) {
  const [changes, setChanges] = useState<TaxonomyChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [resetMenuPosition, setResetMenuPosition] = useState({ x: 0, y: 0 });

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
      await fetchTaxonHistory(true);
    } catch (err) {
      console.error('[TaxonVersionHistory] Error resetting cache:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset cache');
      setIsRefreshing(false);
    }
  };

  const fetchTaxonHistory = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const encodedTaxon = encodeURIComponent(taxonName);
      const url = `/api/taxons/${encodedTaxon}/history${forceRefresh ? '?refresh=true' : ''}`;
      
      console.log(`[TaxonVersionHistory] Fetching history for: "${taxonName}" from ${url}`);
      
      const response = await fetch(url, {
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.errorDetails ||
          errorData.error ||
          errorData.message ||
          `HTTP ${response.status}: Failed to fetch taxon history`;
        console.error(`[TaxonVersionHistory] API error:`, errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`[TaxonVersionHistory] Received data:`, {
        changesCount: data.changes?.length || 0,
        taxon: data.taxon,
        commitsWithChanges: data.commitsWithChanges,
        fromCache: data.fromCache,
        error: data.error,
      });

      if (data.error && !data.changes) {
        throw new Error(
          data.errorDetails || data.error || data.message || 'Failed to fetch taxon history'
        );
      }

      const changes = data.changes || [];
      console.log(`[TaxonVersionHistory] Setting ${changes.length} changes`);
      setChanges(changes);
      
      // If no changes found, show a helpful message
      if (changes.length === 0 && !data.error) {
        console.log(`[TaxonVersionHistory] No changes found for "${taxonName}"`);
        // Don't set error, just show empty state
      }
    } catch (err) {
      console.error('[TaxonVersionHistory] Error fetching taxon history:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load taxon history';
      
      // Handle timeout specifically
      if (err instanceof Error && err.name === 'TimeoutError') {
        setError('Request timed out. The taxonomy history may still be loading. Please try again in a moment.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      fetchTaxonHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxonName, isExpanded]);

  const toggleCommit = (hash: string) => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(hash)) {
      newExpanded.delete(hash);
    } else {
      newExpanded.add(hash);
    }
    setExpandedCommits(newExpanded);
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

  if (!isExpanded) {
    return (
      <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-4 mt-4">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between text-left hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] p-2 rounded-md transition-colors"
        >
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
            <h3 className="text-base font-bold text-[#24292f] dark:text-[#e6edf3]">
              Version History
            </h3>
          </div>
          <ChevronRight className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
            <h3 className="text-base font-bold text-[#24292f] dark:text-[#e6edf3]">
              Version History
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3]"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
          </button>
        </div>
        <div className="text-center py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0969da] dark:border-[#58a6ff]"></div>
            <p className="text-[#656d76] dark:text-[#8b949e] text-xs">Loading version history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
            <h3 className="text-base font-bold text-[#24292f] dark:text-[#e6edf3]">
              Version History
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3]"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
          </button>
        </div>
        <div className="text-center py-4 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
          <p className="text-[#cf222e] dark:text-[#f85149] text-xs mb-2">Error loading version history</p>
          <p className="text-[#656d76] dark:text-[#8b949e] text-xs mb-3">{error}</p>
          <button
            onClick={() => fetchTaxonHistory(true)}
            className="px-2 py-1 text-xs bg-[#0969da] dark:bg-[#1f6feb] text-white rounded-md hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-[#d0d7de] dark:border-[#30363d] pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
          <h3 className="text-base font-bold text-[#24292f] dark:text-[#e6edf3]">
            Version History
          </h3>
          {changes.length > 0 && (
            <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
              ({changes.length} {changes.length === 1 ? 'change' : 'changes'})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => fetchTaxonHistory(true)}
              onContextMenu={(e) => {
                e.preventDefault();
                setResetMenuPosition({ x: e.clientX, y: e.clientY });
                setShowResetMenu(true);
              }}
              disabled={isRefreshing}
              className="p-1 text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] disabled:opacity-50"
              title="Refresh history (Right-click for options)"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {showResetMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowResetMenu(false)}
                />
                <div
                  className="absolute z-20 mt-1 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md shadow-lg py-1 min-w-[200px]"
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
          <button
            onClick={() => setIsExpanded(false)}
            className="text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3]"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>

      {changes.length === 0 && !loading ? (
        <div className="text-center py-4 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
          <p className="text-[#656d76] dark:text-[#8b949e] text-xs mb-2">
            No version history found for this taxon.
          </p>
          <p className="text-[#656d76] dark:text-[#8b949e] text-[10px]">
            This taxon may not have been modified in recent commits, or the taxonomy history is still being processed.
          </p>
        </div>
      ) : changes.length > 0 ? (
        <div className="space-y-3">
          {changes.map((change) => {
            const isExpanded = expandedCommits.has(change.commitHash);
            const taxonChange = change.changes[0]; // Should only be one change per commit for a specific taxon

            // For added/removed/deprecated, show the change type prominently
            // For modified, show field changes
            const hasFieldChanges = taxonChange.fieldChanges && taxonChange.fieldChanges.length > 0;
            const isSimpleChange = taxonChange.changeType === 'added' || 
                                   taxonChange.changeType === 'removed' || 
                                   taxonChange.changeType === 'deprecated';

            return (
              <div
                key={change.commitHash}
                className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]"
              >
                {/* Header with change type and date */}
                <div className="px-3 py-2 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getChangeTypeIcon(taxonChange.changeType)}
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getChangeTypeColor(
                          taxonChange.changeType
                        )}`}
                      >
                        {taxonChange.changeType.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                        {change.commitDate}
                      </span>
                    </div>
                    {hasFieldChanges && (
                      <button
                        onClick={() => toggleCommit(change.commitHash)}
                        className="text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] transition-colors"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Show field changes for modified taxons */}
                {hasFieldChanges && (
                  <div className="px-3 py-2">
                    {isExpanded ? (
                      <div className="space-y-2">
                        {taxonChange.fieldChanges!.map((fieldChange, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-[#f6f8fa] dark:bg-[#161b22] p-2 rounded border border-[#d0d7de] dark:border-[#30363d]"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-[#24292f] dark:text-[#e6edf3]">
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
                            <div className="space-y-1">
                              {fieldChange.oldValue !== undefined && (
                                <div className="flex items-start gap-2">
                                  <span className="text-[#656d76] dark:text-[#8b949e] min-w-[40px]">Old:</span>
                                  <code className="flex-1 text-[#cf222e] dark:text-[#f85149] bg-[#ffebe9] dark:bg-[#490202] px-2 py-1 rounded text-[10px] break-all">
                                    {typeof fieldChange.oldValue === 'string' 
                                      ? fieldChange.oldValue 
                                      : JSON.stringify(fieldChange.oldValue, null, 2)}
                                  </code>
                                </div>
                              )}
                              {fieldChange.newValue !== undefined && (
                                <div className="flex items-start gap-2">
                                  <span className="text-[#656d76] dark:text-[#8b949e] min-w-[40px]">New:</span>
                                  <code className="flex-1 text-[#1a7f37] dark:text-[#3fb950] bg-[#dafbe1] dark:bg-[#033a16] px-2 py-1 rounded text-[10px] break-all">
                                    {typeof fieldChange.newValue === 'string' 
                                      ? fieldChange.newValue 
                                      : JSON.stringify(fieldChange.newValue, null, 2)}
                                  </code>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleCommit(change.commitHash)}
                        className="w-full text-left text-xs text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] py-1"
                      >
                        {taxonChange.fieldChanges!.length} {taxonChange.fieldChanges!.length === 1 ? 'field changed' : 'fields changed'} — Click to expand
                      </button>
                    )}
                  </div>
                )}

                {/* Show summary for added/removed/deprecated */}
                {isSimpleChange && (
                  <div className="px-3 py-2">
                    {taxonChange.changeType === 'added' && (
                      <p className="text-xs text-[#656d76] dark:text-[#8b949e]">
                        This taxon was added to the taxonomy.
                      </p>
                    )}
                    {taxonChange.changeType === 'removed' && (
                      <p className="text-xs text-[#656d76] dark:text-[#8b949e]">
                        This taxon was removed from the taxonomy.
                      </p>
                    )}
                    {taxonChange.changeType === 'deprecated' && (
                      <div className="text-xs text-[#656d76] dark:text-[#8b949e]">
                        <p className="mb-1">This taxon was marked as deprecated.</p>
                        {taxonChange.newTaxon?.replacement && (
                          <p>
                            Replacement: <code className="px-1 py-0.5 bg-[#f6f8fa] dark:bg-[#161b22] rounded">{taxonChange.newTaxon.replacement}</code>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

