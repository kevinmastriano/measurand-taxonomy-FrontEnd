'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * Hook for managing URL state synchronization
 * Note: This hook must be used within a component that's wrapped in Suspense
 * or useSearchParams must be called conditionally
 */
export function useURLState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current URL state
  const urlState = useMemo(() => {
    return {
      taxon: searchParams.get('taxon'),
      q: searchParams.get('q') || '',
      discipline: searchParams.getAll('discipline'),
      deprecated: searchParams.get('deprecated') === 'true',
      view: (searchParams.get('view') || 'list') as 'list' | 'tree',
      compare: searchParams.get('compare')?.split(',').filter(Boolean) || [],
    };
  }, [searchParams]);

  // Update URL with new state
  const updateURL = useCallback((updates: Partial<typeof urlState>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Handle taxon
    if (updates.taxon !== undefined) {
      if (updates.taxon) {
        params.set('taxon', updates.taxon);
      } else {
        params.delete('taxon');
      }
    }

    // Handle search query
    if (updates.q !== undefined) {
      if (updates.q) {
        params.set('q', updates.q);
      } else {
        params.delete('q');
      }
    }

    // Handle disciplines (array)
    if (updates.discipline !== undefined) {
      params.delete('discipline');
      updates.discipline.forEach(disc => {
        params.append('discipline', disc);
      });
    }

    // Handle deprecated
    if (updates.deprecated !== undefined) {
      if (updates.deprecated) {
        params.set('deprecated', 'true');
      } else {
        params.delete('deprecated');
      }
    }

    // Handle view mode
    if (updates.view !== undefined) {
      if (updates.view === 'tree') {
        params.set('view', 'tree');
      } else {
        params.delete('view');
      }
    }

    // Handle compare
    if (updates.compare !== undefined) {
      if (updates.compare.length > 0) {
        params.set('compare', updates.compare.join(','));
      } else {
        params.delete('compare');
      }
    }

    // Update URL without page reload
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Clear all URL parameters
  const clearURL = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // Get shareable URL
  const getShareableURL = useCallback(() => {
    return typeof window !== 'undefined' ? window.location.href : '';
  }, []);

  return {
    urlState,
    updateURL,
    clearURL,
    getShareableURL,
  };
}

