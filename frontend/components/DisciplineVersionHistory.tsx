'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaxonomyChange, TaxonChange } from '@/lib/types';
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
  History,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface DisciplineVersionHistoryProps {
  disciplineName: string;
}

export default function DisciplineVersionHistory({ disciplineName }: DisciplineVersionHistoryProps) {
  const [changes, setChanges] = useState<TaxonomyChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      await fetchDisciplineHistory(true);
    } catch (err) {
      console.error('[DisciplineVersionHistory] Error resetting cache:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset cache');
      setIsRefreshing(false);
    }
  };

  const fetchDisciplineHistory = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const encodedDiscipline = encodeURIComponent(disciplineName);
      const url = `/api/disciplines/${encodedDiscipline}/history${forceRefresh ? '?refresh=true' : ''}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errorDetails ||
            errorData.error ||
            `HTTP ${response.status}: Failed to fetch discipline history`
        );
      }

      const data = await response.json();

      if (data.error && !data.changes) {
        throw new Error(
          data.errorDetails || data.error || 'Failed to fetch discipline history'
        );
      }

      setChanges(data.changes || []);
    } catch (err) {
      console.error('Error fetching discipline history:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load discipline history';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [disciplineName]);

  useEffect(() => {
    fetchDisciplineHistory();
  }, [fetchDisciplineHistory]);

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

  const getDisciplineChangeType = (taxonChange: TaxonChange): string => {
    const oldDisciplines = taxonChange.oldTaxon?.Discipline?.map((d) => d.name) || [];
    const newDisciplines = taxonChange.newTaxon?.Discipline?.map((d) => d.name) || [];
    const hadDiscipline = oldDisciplines.includes(disciplineName);
    const hasDiscipline = newDisciplines.includes(disciplineName);

    if (taxonChange.changeType === 'added' && hasDiscipline) {
      return 'Taxon added to discipline';
    }
    if (taxonChange.changeType === 'removed' && hadDiscipline) {
      return 'Taxon removed from discipline';
    }
    if (taxonChange.changeType === 'modified') {
      if (!hadDiscipline && hasDiscipline) {
        return 'Taxon moved to discipline';
      }
      if (hadDiscipline && !hasDiscipline) {
        return 'Taxon moved from discipline';
      }
      if (hadDiscipline && hasDiscipline) {
        return 'Taxon modified in discipline';
      }
    }
    if (taxonChange.changeType === 'deprecated') {
      return 'Taxon deprecated';
    }

    return taxonChange.changeType;
  };

  if (loading) {
    return (
      <div className="text-center py-8 px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0969da] dark:border-[#58a6ff]"></div>
          <p className="text-[#656d76] dark:text-[#8b949e] text-sm">Loading version history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
        <p className="text-[#cf222e] dark:text-[#f85149] text-sm mb-2">Error loading version history</p>
        <p className="text-[#656d76] dark:text-[#8b949e] text-xs mb-3">{error}</p>
        <button
          onClick={() => fetchDisciplineHistory(true)}
          className="px-3 py-1.5 text-sm bg-[#0969da] dark:bg-[#1f6feb] text-white rounded-md hover:bg-[#0860ca] dark:hover:bg-[#388bfd] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="text-center py-8 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
        <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
          No version history found for this discipline.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff]" />
          <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3]">
            Version History
          </h3>
        </div>
        <div className="relative">
          <button
            onClick={() => fetchDisciplineHistory(true)}
            onContextMenu={(e) => {
              e.preventDefault();
              setResetMenuPosition({ x: e.clientX, y: e.clientY });
              setShowResetMenu(true);
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#24292f] dark:text-[#e6edf3] hover:bg-[#f3f4f6] dark:hover:bg-[#21262d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh history (Right-click for options)"
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
      </div>

      <div className="text-sm text-[#656d76] dark:text-[#8b949e] mb-4">
        Showing {changes.length} commit{changes.length === 1 ? '' : 's'} that affected this discipline
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
                    const changeDescription = getDisciplineChangeType(taxonChange);

                    return (
                      <div
                        key={idx}
                        className="border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#ffffff] dark:bg-[#0d1117] p-3"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          {getChangeTypeIcon(taxonChange.changeType)}
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getChangeTypeColor(
                              taxonChange.changeType
                            )}`}
                          >
                            {taxonChange.changeType.toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-[#24292f] dark:text-[#e6edf3]">
                            {taxonChange.taxonName}
                          </span>
                          <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                            • {changeDescription}
                          </span>
                        </div>
                        <div className="mt-2">
                          <Link
                            href={`/taxons/${encodeURIComponent(taxonChange.taxonName)}`}
                            className="text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline"
                          >
                            View taxon details →
                          </Link>
                        </div>
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

