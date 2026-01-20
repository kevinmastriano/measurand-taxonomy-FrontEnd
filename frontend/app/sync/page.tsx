'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, Download, FileText } from 'lucide-react';

interface SyncStatus {
  syncing: boolean;
  success: boolean | null;
  message: string;
  timestamp: string | null;
  commitSHA: string | null;
  filesSynced: number | null;
  error: string | null;
}

interface SyncMetadata {
  syncedAt: string;
  commitSHA: string;
  source: string;
}

interface SyncStatusResponse {
  success: boolean;
  hasSyncedData: boolean;
  metadata: SyncMetadata | null;
  files: Array<{ name: string; size: number; modified: string }>;
}

export default function SyncPage() {
  const [status, setStatus] = useState<SyncStatus>({
    syncing: false,
    success: null,
    message: '',
    timestamp: null,
    commitSHA: null,
    filesSynced: null,
    error: null,
  });
  const [syncInfo, setSyncInfo] = useState<SyncStatusResponse | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    // Load sync status info
    loadSyncInfo();
  }, []);

  async function loadSyncInfo() {
    setLoadingInfo(true);
    try {
      const response = await fetch('/api/sync-status');
      const data = await response.json();
      if (data.success) {
        setSyncInfo(data);
      }
    } catch (error) {
      console.error('Error loading sync info:', error);
    } finally {
      setLoadingInfo(false);
    }
  }

  async function triggerSync() {
    setStatus({
      syncing: true,
      success: null,
      message: 'Starting sync...',
      timestamp: null,
      commitSHA: null,
      filesSynced: null,
      error: null,
    });

    try {
      const response = await fetch('/api/sync-taxonomy', {
        method: 'GET',
      });

      const data = await response.json();

      if (response.ok && data.success) {
          setStatus({
            syncing: false,
            success: true,
            message: data.message || 'Sync completed successfully',
            timestamp: data.timestamp,
            commitSHA: data.commitSHA,
            filesSynced: data.filesSynced || null,
            error: null,
          });
          // Reload sync info after a short delay
          setTimeout(() => {
            loadSyncInfo();
          }, 2000);
      } else {
        setStatus({
          syncing: false,
          success: false,
          message: 'Sync failed',
          timestamp: data.timestamp || null,
          commitSHA: null,
          filesSynced: null,
          error: data.error || 'Unknown error',
        });
      }
    } catch (error) {
      setStatus({
        syncing: false,
        success: false,
        message: 'Sync failed',
        timestamp: null,
        commitSHA: null,
        filesSynced: null,
        error: error instanceof Error ? error.message : 'Network error',
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0d1117]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#24292f] dark:text-[#e6edf3] mb-2">
            Taxonomy Sync Management
          </h1>
          <p className="text-[#656d76] dark:text-[#8b949e]">
            Manually trigger and monitor taxonomy data synchronization from NCSLI-MII repository
          </p>
        </div>

        {/* Sync Status Info */}
        {loadingInfo ? (
          <div className="mb-6 p-4 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
            <div className="flex items-center gap-2 text-[#656d76] dark:text-[#8b949e]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading sync status...
            </div>
          </div>
        ) : syncInfo && (
          <div className="mb-6 p-4 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
            <h2 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Sync Status
            </h2>
            {syncInfo.hasSyncedData ? (
              <div className="space-y-3">
                {syncInfo.metadata && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-[#656d76] dark:text-[#8b949e]">Last synced:</span>{' '}
                      <span className="text-[#24292f] dark:text-[#e6edf3] font-mono">
                        {new Date(syncInfo.metadata.syncedAt).toLocaleString()}
                      </span>
                    </div>
                    {syncInfo.metadata.commitSHA && (
                      <div>
                        <span className="text-[#656d76] dark:text-[#8b949e]">Commit SHA:</span>{' '}
                        <span className="text-[#24292f] dark:text-[#e6edf3] font-mono">
                          {syncInfo.metadata.commitSHA.substring(0, 7)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[#656d76] dark:text-[#8b949e]">Source:</span>{' '}
                      <a
                        href={syncInfo.metadata.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0969da] dark:text-[#58a6ff] hover:underline"
                      >
                        {syncInfo.metadata.source}
                      </a>
                    </div>
                  </div>
                )}
                {syncInfo.files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-[#24292f] dark:text-[#e6edf3] mb-2">
                      Synced Files ({syncInfo.files.length}):
                    </p>
                    <ul className="space-y-1 text-sm text-[#656d76] dark:text-[#8b949e]">
                      {syncInfo.files.map((file) => (
                        <li key={file.name} className="flex items-center justify-between">
                          <span className="font-mono">{file.name}</span>
                          <span className="ml-4">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#656d76] dark:text-[#8b949e]">
                No synced data found. Click "Trigger Sync" to download taxonomy files.
              </p>
            )}
          </div>
        )}

        {/* Sync Control */}
        <div className="mb-6 p-6 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
              Manual Sync
            </h2>
            <button
              onClick={triggerSync}
              disabled={status.syncing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#ffffff] bg-[#0969da] hover:bg-[#0860ca] dark:bg-[#1f6feb] dark:hover:bg-[#1a5cd7] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-offset-2"
            >
              {status.syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Trigger Sync
                </>
              )}
            </button>
          </div>

          {/* Status Display */}
          {status.message && (
            <div
              className={`p-4 rounded-md border ${
                status.success === true
                  ? 'bg-[#ddf4ff] dark:bg-[#0c2d41] border-[#54aeff] dark:border-[#1f6feb]'
                  : status.success === false
                  ? 'bg-[#ffebe9] dark:bg-[#490202] border-[#ff8182] dark:border-[#da3633]'
                  : 'bg-[#f6f8fa] dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d]'
              }`}
            >
              <div className="flex items-start gap-3">
                {status.syncing ? (
                  <RefreshCw className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff] animate-spin mt-0.5" />
                ) : status.success === true ? (
                  <CheckCircle className="w-5 h-5 text-[#0969da] dark:text-[#58a6ff] mt-0.5" />
                ) : status.success === false ? (
                  <XCircle className="w-5 h-5 text-[#da3633] dark:text-[#f85149] mt-0.5" />
                ) : null}
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      status.success === true
                        ? 'text-[#0969da] dark:text-[#58a6ff]'
                        : status.success === false
                        ? 'text-[#da3633] dark:text-[#f85149]'
                        : 'text-[#24292f] dark:text-[#e6edf3]'
                    }`}
                  >
                    {status.message}
                  </p>
                  {status.timestamp && (
                    <p className="text-sm text-[#656d76] dark:text-[#8b949e] mt-1">
                      {new Date(status.timestamp).toLocaleString()}
                    </p>
                  )}
                  {status.commitSHA && (
                    <p className="text-sm text-[#656d76] dark:text-[#8b949e] mt-1">
                      Commit: <span className="font-mono">{status.commitSHA.substring(0, 7)}</span>
                    </p>
                  )}
                  {status.filesSynced !== null && (
                    <p className="text-sm text-[#656d76] dark:text-[#8b949e] mt-1">
                      Files synced: {status.filesSynced}
                    </p>
                  )}
                  {status.error && (
                    <p className="text-sm text-[#da3633] dark:text-[#f85149] mt-2 font-mono">
                      {status.error}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sync Information */}
        <div className="space-y-4">
          <div className="p-4 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
            <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Files Synced
            </h3>
            <ul className="space-y-2 text-sm text-[#656d76] dark:text-[#8b949e]">
              <li>• MeasurandTaxonomyCatalog.xml (main catalog)</li>
              <li>• MeasurandTaxonomyCatalog.xsd (schema)</li>
              <li>• MeasurandTaxonomyProperties.xml (properties)</li>
              <li>• LICENSE (license text)</li>
              <li>• COPYRIGHT (copyright information)</li>
            </ul>
          </div>

          <div className="p-4 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
            <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              About
            </h3>
            <div className="text-sm text-[#656d76] dark:text-[#8b949e] space-y-2">
              <p>
                This page allows you to manually trigger the taxonomy sync process. The sync
                downloads the latest taxonomy files from the{' '}
                <a
                  href="https://github.com/NCSLI-MII/measurand-taxonomy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0969da] dark:text-[#58a6ff] hover:underline"
                >
                  NCSLI-MII repository
                </a>
                .
              </p>
              <p>
                <strong>Note:</strong> The sync also runs automatically via cron job daily at 2 AM
                UTC. This manual sync is useful for testing or immediate updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
