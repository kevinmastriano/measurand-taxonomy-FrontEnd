'use client';

import { useState } from 'react';
import { GitCommit } from '@/lib/types';
import { GitCommit as GitCommitIcon, User, Calendar, FileText, ChevronDown, ChevronRight, History } from 'lucide-react';
import TaxonomyChangeList from './TaxonomyChangeList';

interface RevisionHistoryProps {
  commits: GitCommit[];
}

type TabType = 'git' | 'taxonomy';

export default function RevisionHistory({ commits }: RevisionHistoryProps) {
  const [activeTab, setActiveTab] = useState<TabType>('git');
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(new Set());

  const toggleCommit = (hash: string) => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(hash)) {
      newExpanded.delete(hash);
    } else {
      newExpanded.add(hash);
    }
    setExpandedCommits(newExpanded);
  };

  const getTaxonomyFiles = (files?: string[]) => {
    if (!files) return [];
    return files.filter(
      (f) =>
        f.includes('MeasurandTaxonomyCatalog.xml') ||
        f.includes('source/') ||
        f.includes('.xsd') ||
        f.includes('.xsl')
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="border-b border-[#d0d7de] dark:border-[#30363d]">
        <nav className="flex gap-4" aria-label="Revision history tabs">
          <button
            onClick={() => setActiveTab('git')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'git'
                ? 'border-[#0969da] dark:border-[#58a6ff] text-[#0969da] dark:text-[#58a6ff]'
                : 'border-transparent text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] hover:border-[#d0d7de] dark:hover:border-[#30363d]'
            }`}
          >
            <div className="flex items-center gap-2">
              <GitCommitIcon className="w-4 h-4" />
              <span>Git Revision History</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('taxonomy')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'taxonomy'
                ? 'border-[#0969da] dark:border-[#58a6ff] text-[#0969da] dark:text-[#58a6ff]'
                : 'border-transparent text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#e6edf3] hover:border-[#d0d7de] dark:hover:border-[#30363d]'
            }`}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>Taxonomy Revision History</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'git' && (
        <>
          {commits.length === 0 ? (
            <div className="text-center py-16 px-4 border border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#161b22]">
              <p className="text-[#656d76] dark:text-[#8b949e] text-sm">
                No revision history available. Make sure you&apos;re running this in a Git repository.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                  Showing {commits.length} most recent commits
                </p>
              </div>
              {commits.map((commit) => {
            const isExpanded = expandedCommits.has(commit.hash);
            const taxonomyFiles = getTaxonomyFiles(commit.files);
            const hasTaxonomyFiles = taxonomyFiles.length > 0;

            return (
              <div
                key={commit.hash}
                className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-[#ffffff] dark:bg-[#0d1117]"
              >
                <button
                  onClick={() => toggleCommit(commit.hash)}
                  className="w-full px-4 py-3 flex items-start justify-between hover:bg-[#f6f8fa] dark:hover:bg-[#161b22] transition-colors text-left focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-inset"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <GitCommitIcon className="w-4 h-4 text-[#656d76] dark:text-[#8b949e]" />
                      <code className="text-sm font-mono text-[#0969da] dark:text-[#58a6ff] bg-[#f6f8fa] dark:bg-[#161b22] px-1.5 py-0.5 rounded border border-[#d0d7de] dark:border-[#30363d]">
                        {commit.hash}
                      </code>
                      {hasTaxonomyFiles && (
                        <span className="px-2 py-0.5 bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] rounded-md text-xs font-medium border border-[#54aeff] dark:border-[#1f6feb]">
                          Taxonomy Changes
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#24292f] dark:text-[#e6edf3] mb-2">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#656d76] dark:text-[#8b949e] flex-wrap">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{commit.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{commit.date}</span>
                      </div>
                      {commit.files && commit.files.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{commit.files.length} {commit.files.length === 1 ? 'file' : 'files'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-[#656d76] dark:text-[#8b949e]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-[#656d76] dark:text-[#8b949e]" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 py-4 bg-[#f6f8fa] dark:bg-[#161b22] border-t border-[#d0d7de] dark:border-[#30363d]">
                    {hasTaxonomyFiles && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                          Taxonomy-Related Files Changed:
                        </h4>
                        <div className="space-y-1">
                          {taxonomyFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="text-sm font-mono text-[#24292f] dark:text-[#e6edf3] bg-[#ffffff] dark:bg-[#0d1117] px-2 py-1 rounded border border-[#d0d7de] dark:border-[#30363d]"
                            >
                              {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {commit.files && commit.files.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
                          All Files Changed ({commit.files.length}):
                        </h4>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                          {commit.files.map((file, idx) => (
                            <div
                              key={idx}
                              className={`text-xs font-mono px-2 py-1 rounded border ${
                                taxonomyFiles.includes(file)
                                  ? 'bg-[#ddf4ff] dark:bg-[#0c2d41] text-[#0969da] dark:text-[#58a6ff] border-[#54aeff] dark:border-[#1f6feb]'
                                  : 'bg-[#f6f8fa] dark:bg-[#161b22] text-[#656d76] dark:text-[#8b949e] border-[#d0d7de] dark:border-[#30363d]'
                              }`}
                            >
                              {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
            </>
          )}
        </>
      )}

      {activeTab === 'taxonomy' && <TaxonomyChangeList />}
    </div>
  );
}

