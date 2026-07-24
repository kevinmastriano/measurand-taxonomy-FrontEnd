import { TaxonomyChange, GitCommit } from '@/lib/types';
import { getTaxonomyHistory } from './taxonomy-diff';
import { execSync } from 'child_process';
import path from 'path';
import { promises as fs } from 'fs';

// Cache for taxonomy history with timestamp
export interface CachedTaxonomyHistory {
  changes: TaxonomyChange[];
  totalCommits: number;
  commitsWithChanges: number;
  processingTimeMs: number;
  cachedAt: number;
  oldestProcessedCommitHash?: string; // Track the oldest commit we've processed for incremental updates
  initialCommit?: {
    commitHash: string;
    commitDate: string;
    commitAuthor: string;
    commitMessage: string;
    taxonNames: string[]; // Store as array for JSON serialization
  };
}

let taxonomyHistoryCache: CachedTaxonomyHistory | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
let refreshInterval: NodeJS.Timeout | null = null;

// Cache file path - stored in .next/cache directory
const getCacheFilePath = (): string => {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  return path.join(cacheDir, 'taxonomy-history-cache.json');
};

// Load cache from disk
async function loadCacheFromDisk(): Promise<CachedTaxonomyHistory | null> {
  try {
    const cachePath = getCacheFilePath();
    const cacheData = await fs.readFile(cachePath, 'utf-8');
    const cache: CachedTaxonomyHistory = JSON.parse(cacheData);
    
    // Validate cache is not expired
    const now = Date.now();
    const isCacheValid = (now - cache.cachedAt) < CACHE_TTL_MS;
    
    if (isCacheValid) {
      console.log(`[Cache] Loaded valid cache from disk (age: ${Math.round((now - cache.cachedAt) / 1000 / 60)} minutes)`);
      return cache;
    } else {
      console.log('[Cache] Disk cache expired, will refresh');
      return null;
    }
  } catch (error) {
    // Cache file doesn't exist or is invalid - that's okay
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('[Cache] Error loading cache from disk:', error);
    }
    return null;
  }
}

// Save cache to disk
async function saveCacheToDisk(cache: CachedTaxonomyHistory): Promise<void> {
  try {
    const cachePath = getCacheFilePath();
    const cacheDir = path.dirname(cachePath);
    
    // Ensure cache directory exists
    await fs.mkdir(cacheDir, { recursive: true });
    
    // Write cache to file atomically
    await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf-8');
    console.log(`[Cache] Saved cache to disk (${cache.changes.length} changes)`);
  } catch (error) {
    console.error('[Cache] Error saving cache to disk:', error);
    // Don't throw - cache saving failure shouldn't break the app
  }
}

async function getGitHistory(): Promise<GitCommit[]> {
  try {
    const repoPath = path.join(process.cwd(), '..');

    // Always fetch the full history and rebuild from scratch. The previous
    // "incremental" path combined `--all` with a revision, which makes git
    // return the union of all refs (ignoring the range), so every change was
    // re-processed and duplicated on each refresh. The history is small, so a
    // full rebuild is cheap and correct.
    const gitLogCommand = 'git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso --name-only';
    console.log('[Cache] Fetching full commit history');

    const gitLog = execSync(
      gitLogCommand,
      { 
        cwd: repoPath, 
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large git histories
      }
    );

    const commits: GitCommit[] = [];
    const lines = gitLog.split('\n');
    let currentCommit: Partial<GitCommit> | null = null;
    const files: string[] = [];

    for (const line of lines) {
      if (line.includes('|')) {
        if (currentCommit) {
          commits.push({
            hash: currentCommit.hash!,
            author: currentCommit.author!,
            date: currentCommit.date!,
            message: currentCommit.message!,
            files: files.length > 0 ? [...files] : undefined,
          });
          files.length = 0;
        }

        const [hash, author, email, date, ...messageParts] = line.split('|');
        
        // Parse date more reliably - git --date=iso format is like "2023-05-05 14:30:00 -0400"
        // or "2023-05-05T14:30:00-04:00" or "2023-05-05 14:30:00"
        let formattedDate: string;
        const dateStr = date.trim();
        
        try {
          // Try parsing ISO format manually first (more reliable)
          // Format: "YYYY-MM-DD HH:MM:SS +/-HHMM" or "YYYY-MM-DDTHH:MM:SS+/-HH:MM"
          const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}):(\d{2})(?:[+-]\d{2}:?\d{2})?)?/);
          
          if (isoMatch) {
            const year = parseInt(isoMatch[1], 10);
            const month = parseInt(isoMatch[2], 10);
            const day = parseInt(isoMatch[3], 10);
            
            // Validate date
            if (year >= 1970 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
              formattedDate = `${month}/${day}/${year}`;
            } else {
              console.warn(`[Cache] Invalid date values: year=${year}, month=${month}, day=${day} from "${dateStr}"`);
              formattedDate = dateStr; // Fallback
            }
          } else {
            // Try JavaScript Date parsing as fallback
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              const year = dateObj.getFullYear();
              formattedDate = `${month}/${day}/${year}`;
            } else {
              console.warn(`[Cache] Could not parse date: "${dateStr}"`);
              formattedDate = dateStr; // Fallback to original
            }
          }
        } catch (error) {
          console.warn(`[Cache] Error parsing date "${dateStr}":`, error);
          formattedDate = dateStr; // Fallback to original
        }
        
        currentCommit = {
          hash: hash.substring(0, 7),
          author: `${author} <${email}>`,
          date: formattedDate,
          message: messageParts.join('|'),
        };
      } else if (line.trim() && currentCommit) {
        files.push(line.trim());
      }
    }

    if (currentCommit) {
      commits.push({
        hash: currentCommit.hash!,
        author: currentCommit.author!,
        date: currentCommit.date!,
        message: currentCommit.message!,
        files: files.length > 0 ? [...files] : undefined,
      });
    }

    console.log(`[Cache] Fetched ${commits.length} commits from Git`);
    return commits;
  } catch (error) {
    console.error('[Cache] Error getting git history:', error);
    return [];
  }
}

// Background refresh function (non-blocking)
export async function refreshTaxonomyHistoryCache(force = false): Promise<CachedTaxonomyHistory | null> {
  try {
    console.log('[Cache] Refreshing taxonomy history cache...');
    const startTime = Date.now();
    // `force` is retained for API compatibility; a refresh always does a full
    // rebuild now, so there is no separate incremental path to force.
    void force;

    const existingCache = taxonomyHistoryCache || await loadCacheFromDisk();

    // Always fetch the full history and rebuild from scratch (see getGitHistory).
    const commits = await getGitHistory();

    if (commits.length === 0) {
      // git unavailable / no commits - keep any existing cache rather than
      // clobbering it with an empty result.
      if (existingCache) {
        console.log('[Cache] No commits returned, keeping existing cache');
        return existingCache;
      }
      const result = {
        changes: [],
        totalCommits: 0,
        commitsWithChanges: 0,
        processingTimeMs: Date.now() - startTime,
        cachedAt: Date.now(),
      };
      taxonomyHistoryCache = result;
      await saveCacheToDisk(result);
      return result;
    }

    // Rebuild the full change set from all commits.
    const taxonomyHistoryResult = await getTaxonomyHistory(commits);
    const changes = taxonomyHistoryResult.changes;
    const duration = Date.now() - startTime;
    console.log(`[Cache] Processed ${changes.length} taxonomy changes from ${commits.length} commits in ${duration}ms`);

    // commits is newest-first; the last entry is the oldest commit processed.
    const oldestHash = commits[commits.length - 1]?.hash;

    const result = {
      changes,
      totalCommits: commits.length,
      commitsWithChanges: changes.length,
      processingTimeMs: duration,
      cachedAt: Date.now(),
      oldestProcessedCommitHash: oldestHash,
      initialCommit: taxonomyHistoryResult.initialCommit ? {
        ...taxonomyHistoryResult.initialCommit,
        taxonNames: Array.from(taxonomyHistoryResult.initialCommit.taxonNames),
      } : undefined,
    };

    taxonomyHistoryCache = result;
    await saveCacheToDisk(result);
    console.log(`[Cache] Cache rebuilt successfully at ${new Date().toISOString()}`);
    return result;
  } catch (error) {
    console.error('[Cache] Error refreshing taxonomy history cache:', error);
    return null;
  }
}

// Initialize background refresh interval (only in Node.js runtime, not serverless)
export async function initializeBackgroundRefresh() {
  // Only set up interval in Node.js runtime (not in serverless/edge)
  if (typeof setInterval === 'undefined' || refreshInterval) {
    return; // Already initialized or not available
  }
  
  // Try to load cache from disk first
  if (!taxonomyHistoryCache) {
    const diskCache = await loadCacheFromDisk();
    if (diskCache) {
      taxonomyHistoryCache = diskCache;
      console.log('[Cache] Loaded cache from disk on startup');
    }
  }
  
  // Refresh immediately on first load if cache is empty
  // Use setImmediate to ensure this doesn't block the current request
  if (!taxonomyHistoryCache) {
    setImmediate(() => {
      refreshTaxonomyHistoryCache().catch(console.error);
    });
  }
  
  // Then refresh every 30 minutes
  refreshInterval = setInterval(() => {
    refreshTaxonomyHistoryCache().catch(console.error);
  }, CACHE_TTL_MS);
  
  console.log('[Cache] Background refresh initialized (30 minute interval)');
}

// Track if cache is currently being refreshed
let isRefreshing = false;
let refreshPromise: Promise<CachedTaxonomyHistory | null> | null = null;

// Get cached taxonomy history, refreshing if needed
export async function getCachedTaxonomyHistory(forceRefresh = false): Promise<CachedTaxonomyHistory | null> {
  // Initialize background refresh if not already done
  await initializeBackgroundRefresh();
  
  // Check if we have valid cached data
  const now = Date.now();
  const isCacheValid = taxonomyHistoryCache && 
                      (now - taxonomyHistoryCache.cachedAt) < CACHE_TTL_MS;
  
  // If cache is valid and not forcing refresh, return cached data immediately
  if (isCacheValid && !forceRefresh && taxonomyHistoryCache) {
    console.log('[Cache] Returning cached taxonomy history');
    
    // Trigger background refresh if cache is getting old (but don't wait for it)
    const cacheAge = now - taxonomyHistoryCache.cachedAt;
    const refreshThreshold = CACHE_TTL_MS * 0.8; // Refresh when 80% of TTL has passed
    if (cacheAge > refreshThreshold) {
      console.log('[Cache] Cache is getting old, triggering background refresh...');
      refreshTaxonomyHistoryCache().catch(console.error); // Non-blocking
    }
    
    return taxonomyHistoryCache;
  }
  
  // If already refreshing and not forcing refresh, return stale cache or null immediately
  // Don't wait for refresh to complete - let it happen in background
  if (isRefreshing && refreshPromise && !forceRefresh) {
    console.log('[Cache] Cache refresh in progress, returning stale cache if available...');
    // Return stale cache if available, otherwise return null (don't wait)
    return taxonomyHistoryCache;
  }
  
  // Cache expired or force refresh requested - fetch fresh data
  if (forceRefresh) {
    console.log('[Cache] Force refresh requested, fetching fresh data...');
  } else {
    console.log('[Cache] Cache expired or missing, will start refresh in background...');
  }
  
  // Set refreshing flag and create promise
  // Use setImmediate to ensure refresh starts after current request completes
  // This prevents blocking the event loop
  isRefreshing = true;
  
  const startRefresh = () => {
    // Double-check we're still supposed to be refreshing (avoid race conditions)
    if (!isRefreshing && !forceRefresh) {
      return;
    }
    
    refreshPromise = refreshTaxonomyHistoryCache(forceRefresh)
      .then((result) => {
        isRefreshing = false;
        refreshPromise = null;
        return result;
      })
      .catch((error) => {
        isRefreshing = false;
        refreshPromise = null;
        console.error('[Cache] Error during refresh:', error);
        // Return stale cache if available
        if (taxonomyHistoryCache) {
          console.log('[Cache] Returning stale cache after refresh error');
          return taxonomyHistoryCache;
        }
        return null;
      });
  };
  
  // If forcing refresh, start it immediately and wait
  if (forceRefresh) {
    startRefresh();
    const result = await refreshPromise;
    if (!result && taxonomyHistoryCache) {
      console.log('[Cache] Refresh failed, returning stale cache');
      return taxonomyHistoryCache;
    }
    return result;
  }
  
  // If not forcing refresh, defer refresh to next tick to avoid blocking
  // This ensures current request returns immediately and doesn't block other requests
  // Use setImmediate to yield to the event loop before starting heavy work
  if (typeof setImmediate !== 'undefined') {
    setImmediate(() => {
      startRefresh();
    });
  } else if (typeof process !== 'undefined' && process.nextTick) {
    process.nextTick(() => {
      startRefresh();
    });
  } else {
    // Fallback: use Promise to defer
    Promise.resolve().then(() => {
      startRefresh();
    });
  }
  
  // Return stale cache if available, otherwise null (refresh happening in background)
  if (taxonomyHistoryCache) {
    console.log('[Cache] Returning stale cache while refresh happens in background');
    return taxonomyHistoryCache;
  }
  
  console.log('[Cache] No cache available, refresh started in background (non-blocking)');
  return null;
}

