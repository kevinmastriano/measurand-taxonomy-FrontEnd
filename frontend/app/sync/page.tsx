'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface RefreshStatus {
  refreshing: boolean;
  success: boolean | null;
  message: string;
  timestamp: string | null;
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
  syncing: boolean;
  progress: { startedAt: string; duration: number } | null;
}

export default function SyncPage() {
  const [status, setStatus] = useState<RefreshStatus>({
    refreshing: false,
    success: null,
    message: '',
    timestamp: null,
    error: null,
  });
  const [syncInfo, setSyncInfo] = useState<SyncStatusResponse | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // Load the read-only status panel. Only toggles the loading spinner on the
  // initial load so subsequent refreshes don't flicker the panel.
  const loadSyncInfo = useCallback(async (initial = false) => {
    if (initial) setLoadingInfo(true);
    try {
      const response = await fetch('/api/sync-status');
      const data = await response.json();
      if (data.success) {
        setSyncInfo(data);
      }
    } catch (error) {
      console.error('Error loading sync info:', error);
    } finally {
      if (initial) setLoadingInfo(false);
    }
  }, []);

  useEffect(() => {
    loadSyncInfo(true);
  }, [loadSyncInfo]);

  async function triggerRefresh() {
    setStatus({
      refreshing: true,
      success: null,
      message: 'Revalidating taxonomy cache...',
      timestamp: null,
      error: null,
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/sync-taxonomy', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          refreshing: false,
          success: true,
          message: data.message || 'Taxonomy cache revalidated.',
          timestamp: data.timestamp ?? null,
          error: null,
        });
        // Reflect any change in the status panel.
        loadSyncInfo();
      } else {
        setStatus({
          refreshing: false,
          success: false,
          message: 'Refresh failed',
          timestamp: data.timestamp ?? null,
          error: data.error || (response.status === 401 ? 'Unauthorized (CRON_SECRET is set on this endpoint)' : 'Unknown error'),
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? (error.name === 'AbortError' ? 'Request timed out.' : error.message)
        : 'Network error';

      setStatus({
        refreshing: false,
        success: false,
        message: 'Refresh failed',
        timestamp: null,
        error: errorMessage,
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0d1117]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#24292f] dark:text-[#e6edf3] mb-2">
            Taxonomy Data
          </h1>
          <p className="text-[#656d76] dark:text-[#8b949e]">
            Refresh the cached taxonomy so the next request pulls the latest data from the NCSLI-MII repository.
          </p>
        </div>

        {/* Data source / status info */}
        {loadingInfo ? (
          <div className="mb-6 p-4 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
            <div className="flex items-center gap-2 text-[#656d76] dark:text-[#8b949e]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading status...
            </div>
          </div>
        ) : syncInfo && (
          <div className="mb-6 p-4 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
            <h2 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Bundled Data
            </h2>
            {syncInfo.hasSyncedData ? (
              <div className="space-y-3">
                {syncInfo.metadata && (
                  <div className="space-y-2 text-sm">
                    {syncInfo.metadata.syncedAt && (
                      <div>
                        <span className="text-[#656d76] dark:text-[#8b949e]">Built/synced:</span>{' '}
                        <span className="text-[#24292f] dark:text-[#e6edf3] font-mono">
                          {new Date(syncInfo.metadata.syncedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {syncInfo.metadata.commitSHA && (
                      <div>
                        <span className="text-[#656d76] dark:text-[#8b949e]">Commit SHA:</span>{' '}
                        <span className="text-[#24292f] dark:text-[#e6edf3] font-mono">
                          {syncInfo.metadata.commitSHA.substring(0, 7)}
                        </span>
                      </div>
                    )}
                    {syncInfo.metadata.source && (
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
                    )}
                  </div>
                )}
                {syncInfo.files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-[#24292f] dark:text-[#e6edf3] mb-2">
                      Files ({syncInfo.files.length}):
                    </p>
                    <ul className="space-y-2 text-sm text-[#656d76] dark:text-[#8b949e]">
                      {syncInfo.files.map((file) => (
                        <li key={file.name} className="flex items-center justify-between gap-2">
                          <span className="font-mono flex-1">{file.name}</span>
                          <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
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
                Serving taxonomy directly from GitHub (no bundled data files found on this deployment).
              </p>
            )}
          </div>
        )}

        {/* Refresh control */}
        <div className="mb-6 p-6 bg-[#ffffff] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#24292f] dark:text-[#e6edf3]">
              Refresh from GitHub
            </h2>
            <button
              onClick={triggerRefresh}
              disabled={status.refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#ffffff] bg-[#0969da] hover:bg-[#0860ca] dark:bg-[#1f6feb] dark:hover:bg-[#1a5cd7] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0969da] dark:focus:ring-[#58a6ff] focus:ring-offset-2"
            >
              <RefreshCw className={`w-4 h-4 ${status.refreshing ? 'animate-spin' : ''}`} />
              {status.refreshing ? 'Refreshing...' : 'Refresh Now'}
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
                {status.refreshing ? (
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

        {/* About */}
        <div className="p-4 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md">
          <h3 className="text-lg font-semibold text-[#24292f] dark:text-[#e6edf3] mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            About
          </h3>
          <div className="text-sm text-[#656d76] dark:text-[#8b949e] space-y-2">
            <p>
              Taxonomy data is fetched from the{' '}
              <a
                href="https://github.com/NCSLI-MII/measurand-taxonomy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0969da] dark:text-[#58a6ff] hover:underline"
              >
                NCSLI-MII repository
              </a>{' '}
              and cached (ISR). This deployment does not write files at runtime.
            </p>
            <p>
              <strong>Refresh Now</strong> revalidates the cache so the next request re-fetches the
              latest catalog from GitHub. It does not download or store files locally.
            </p>
            <p>
              A daily cron job (2&nbsp;AM UTC) performs the same revalidation automatically. Revision
              history is generated at build time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
