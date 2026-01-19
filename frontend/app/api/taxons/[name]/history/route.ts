import { NextResponse } from 'next/server';
import { TaxonomyChange } from '@/lib/types';
import { getCachedTaxonomyHistory } from '@/lib/taxonomy-history-cache';

function normalizeTaxonName(name: string): string {
  // Normalize taxon name for comparison: trim whitespace
  return name.trim();
}

function filterTaxonChanges(
  changes: TaxonomyChange[],
  taxonName: string
): TaxonomyChange[] {
  // Normalize taxon name for comparison
  const normalizedTaxonName = normalizeTaxonName(taxonName);
  
  console.log(`[TaxonHistory] Filtering changes for taxon: "${normalizedTaxonName}"`);
  console.log(`[TaxonHistory] Total commits to check: ${changes.length}`);
  
  // Collect all unique taxon names from history for debugging
  const allTaxonNamesInHistory = new Set<string>();
  changes.forEach(change => {
    change.changes.forEach(taxonChange => {
      allTaxonNamesInHistory.add(taxonChange.taxonName);
    });
  });
  
  console.log(`[TaxonHistory] Total unique taxon names in history: ${allTaxonNamesInHistory.size}`);
  
  // Try exact match first (case-sensitive)
  let matchingName: string | null = null;
  const exactMatch = Array.from(allTaxonNamesInHistory).find(
    name => normalizeTaxonName(name) === normalizedTaxonName
  );
  
  if (exactMatch) {
    matchingName = exactMatch;
    console.log(`[TaxonHistory] Found exact match: "${exactMatch}"`);
  } else if (allTaxonNamesInHistory.size > 0) {
    // Try case-insensitive match
    const caseInsensitiveMatch = Array.from(allTaxonNamesInHistory).find(
      name => normalizeTaxonName(name).toLowerCase() === normalizedTaxonName.toLowerCase()
    );
    if (caseInsensitiveMatch) {
      console.log(`[TaxonHistory] Found case-insensitive match: "${caseInsensitiveMatch}" (searching for "${normalizedTaxonName}")`);
      matchingName = caseInsensitiveMatch;
    } else {
      // Log debugging info
      console.log(`[TaxonHistory] No match found for "${normalizedTaxonName}"`);
      console.log(`[TaxonHistory] Available taxon names in history (first 50):`, Array.from(allTaxonNamesInHistory).slice(0, 50));
      
      // Log similar names for debugging
      const similarNames = Array.from(allTaxonNamesInHistory).filter(name => 
        name.toLowerCase().includes(normalizedTaxonName.toLowerCase()) || 
        normalizedTaxonName.toLowerCase().includes(name.toLowerCase())
      );
      if (similarNames.length > 0) {
        console.log(`[TaxonHistory] Similar names found (${similarNames.length}):`, similarNames.slice(0, 10));
      }
    }
  }
  
  // Use the matching name if found, otherwise use the normalized search name
  const nameToMatch = matchingName || normalizedTaxonName;
  
  const filtered = changes
    .map((change) => {
      const filteredChanges = change.changes.filter(
        (taxonChange) => {
          // Match using normalized names (case-sensitive if exact match, case-insensitive if not)
          const taxonNameNormalized = normalizeTaxonName(taxonChange.taxonName);
          const searchNameNormalized = normalizeTaxonName(nameToMatch);
          
          // If we found an exact match, use case-sensitive comparison
          // Otherwise, use case-insensitive comparison
          const matches = matchingName 
            ? taxonNameNormalized === searchNameNormalized
            : taxonNameNormalized.toLowerCase() === searchNameNormalized.toLowerCase();
            
          if (matches) {
            console.log(`[TaxonHistory] ✓ Match in commit ${change.commitHash}: ${taxonChange.changeType} (taxon: "${taxonChange.taxonName}")`);
          }
          return matches;
        }
      );

      if (filteredChanges.length === 0) {
        return null;
      }

      return {
        ...change,
        changes: filteredChanges,
      };
    })
    .filter((change): change is TaxonomyChange => change !== null);
  
  console.log(`[TaxonHistory] Found ${filtered.length} commits with changes for "${normalizedTaxonName}"`);
  
  return filtered;
}

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const taxonName = decodeURIComponent(params.name);
    console.log(`[TaxonHistory] Request for taxon: "${taxonName}" (decoded from: "${params.name}")`);
    
    // Use cached taxonomy history (will be instant if already cached)
    const cachedHistory = await getCachedTaxonomyHistory();
    
    if (!cachedHistory) {
      console.error('[TaxonHistory] No cached history available');
      return NextResponse.json({ 
        changes: [],
        taxon: taxonName,
        totalCommits: 0,
        commitsWithChanges: 0,
        error: 'Taxonomy history cache not available. Please try again in a moment.',
      });
    }
    
    if (cachedHistory.changes.length === 0) {
      console.log('[TaxonHistory] Cached history exists but has no changes');
      return NextResponse.json({ 
        changes: [],
        taxon: taxonName,
        totalCommits: cachedHistory.totalCommits,
        commitsWithChanges: 0,
        message: 'No taxonomy changes found in history',
      });
    }

    console.log(`[TaxonHistory] Cached history has ${cachedHistory.changes.length} commits with changes`);

    // Filter for this specific taxon
    const taxonHistory = filterTaxonChanges(cachedHistory.changes, taxonName);
    
    // Check if this taxon was in the initial commit but doesn't have an "added" entry
    const normalizedTaxonName = taxonName.trim();
    const hasAddedEntry = taxonHistory.some(change => 
      change.changes.some(tc => 
        tc.taxonName.trim() === normalizedTaxonName && tc.changeType === 'added'
      )
    );
    
    // If no "added" entry found and taxon was in initial commit, add it
    if (!hasAddedEntry && cachedHistory.initialCommit) {
      const initialTaxonNames = cachedHistory.initialCommit.taxonNames.map(n => n.trim());
      const wasInInitialCommit = initialTaxonNames.some(name => 
        name === normalizedTaxonName || name.toLowerCase() === normalizedTaxonName.toLowerCase()
      );
      
      if (wasInInitialCommit) {
        console.log(`[TaxonHistory] Adding initial "added" entry for "${taxonName}" from initial commit ${cachedHistory.initialCommit.commitHash}`);
        const initialAddedChange: TaxonomyChange = {
          commitHash: cachedHistory.initialCommit.commitHash,
          commitDate: cachedHistory.initialCommit.commitDate,
          commitAuthor: cachedHistory.initialCommit.commitAuthor,
          commitMessage: cachedHistory.initialCommit.commitMessage,
          changes: [{
            taxonName: normalizedTaxonName,
            changeType: 'added',
            newTaxon: undefined, // We don't have the full taxon data here, but that's okay
          }],
        };
        // Add at the beginning (it's the oldest, will be at bottom after reverse)
        taxonHistory.unshift(initialAddedChange);
      }
    }

    // Reverse to show newest first (most recent changes at the top)
    // Initial commit (oldest) will be at the bottom
    const reversedHistory = [...taxonHistory].reverse();

    const response = {
      changes: reversedHistory,
      taxon: taxonName,
      totalCommits: cachedHistory.totalCommits,
      commitsWithChanges: taxonHistory.length,
      fromCache: true,
      cacheAgeMs: Date.now() - cachedHistory.cachedAt,
    };
    
    console.log(`[TaxonHistory] Returning ${taxonHistory.length} commits for "${taxonName}"`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('[TaxonHistory] Error getting taxon history:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[TaxonHistory] Error details:', { errorMessage, errorStack });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch taxon history',
        errorDetails: errorMessage,
        changes: [],
        taxon: params?.name || 'unknown',
      },
      { status: 500 }
    );
  }
}

