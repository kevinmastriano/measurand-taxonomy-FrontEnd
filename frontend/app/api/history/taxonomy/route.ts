import { NextResponse } from 'next/server';
import { getCachedTaxonomyHistory } from '@/lib/taxonomy-history-cache';
import { getStaticHistoryCache, shouldUseStaticCache } from '@/lib/static-history-cache';

export async function GET(request: Request) {
  try {
    // Check for force refresh parameter
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    let cachedHistory;
    let isStatic = false;
    
    // Always prefer static cache (from NCSLI-MII/measurand-taxonomy via GitHub API)
    // This ensures we're showing history from the taxonomy repository, not the frontend repo
    const staticCache = getStaticHistoryCache();
    if (staticCache) {
      console.log('[API] Using static history cache from NCSLI-MII/measurand-taxonomy');
      cachedHistory = staticCache;
      isStatic = true;
    } else if (shouldUseStaticCache()) {
      // In production/serverless, static cache should always be available
      console.log('[API] Static cache not found in production - this should not happen');
      cachedHistory = null;
    } else {
      // In development, fall back to dynamic cache only if static cache unavailable
      console.log('[API] Static cache not found, falling back to dynamic cache');
      cachedHistory = await getCachedTaxonomyHistory(forceRefresh);
    }
    
    if (!cachedHistory) {
      // Cache is building in background or not available
      return NextResponse.json(
        { 
          changes: [],
          message: 'Taxonomy history is being processed. Please refresh in a moment.',
          totalCommits: 0,
          commitsWithChanges: 0,
        },
        { status: 200 } // Return 200, not 500, since this is expected during initial load
      );
    }

    const now = Date.now();
    const cacheAge = now - cachedHistory.cachedAt;
    const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
    const isFromCache = cacheAge < CACHE_TTL_MS && !forceRefresh;

    return NextResponse.json({
      ...cachedHistory,
      fromCache: isFromCache,
      cacheAgeMs: cacheAge,
      isStatic,
      note: isStatic ? 'History from NCSLI-MII/measurand-taxonomy repository (via GitHub API)' : 'History from local Git repository',
    });
  } catch (error) {
    console.error('Error getting taxonomy history:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch taxonomy history',
        errorDetails: errorMessage,
        changes: [] 
      },
      { status: 500 }
    );
  }
}

