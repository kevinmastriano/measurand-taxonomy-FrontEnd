import { NextResponse } from 'next/server';
import { getCachedTaxonomyHistory } from '@/lib/taxonomy-history-cache';

export async function GET(request: Request) {
  try {
    // Check for force refresh parameter
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Get cached taxonomy history (will use cache if available)
    // This returns immediately even if cache is building
    const cachedHistory = await getCachedTaxonomyHistory(forceRefresh);
    
    if (!cachedHistory) {
      // Cache is building in background - return empty result immediately
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

