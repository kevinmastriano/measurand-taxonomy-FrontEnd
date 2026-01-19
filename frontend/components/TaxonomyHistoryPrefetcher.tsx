'use client';

import { useEffect, useRef } from 'react';

// Singleton flag to ensure we only fetch once per session
let hasPrefetched = false;
let prefetchPromise: Promise<void> | null = null;

export default function TaxonomyHistoryPrefetcher() {
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Only run once per component mount
    if (hasRunRef.current) {
      return;
    }
    hasRunRef.current = true;

    // If already prefetched or currently prefetching, skip
    if (hasPrefetched || prefetchPromise) {
      return;
    }

    // Start prefetching in the background
    // Use a small delay to ensure it doesn't block initial page load
    setTimeout(() => {
      prefetchPromise = fetch('/api/history/taxonomy')
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Failed to fetch');
        })
        .then(() => {
          hasPrefetched = true;
          console.log('[Prefetch] Taxonomy history loaded in background');
        })
        .catch((err) => {
          console.error('[Prefetch] Error pre-fetching taxonomy history:', err);
          // Reset promise on error so it can be retried
          prefetchPromise = null;
        })
        .finally(() => {
          // Keep promise reference for a bit to prevent rapid re-fetches
          setTimeout(() => {
            prefetchPromise = null;
          }, 5000);
        });
    }, 100); // Small delay to let page render first
  }, []);

  // This component doesn't render anything
  return null;
}

