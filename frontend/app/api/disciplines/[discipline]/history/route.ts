import { NextResponse } from 'next/server';
import { TaxonomyChange } from '@/lib/types';
import { getCachedTaxonomyHistory } from '@/lib/taxonomy-history-cache';
import { getStaticHistoryCache, shouldUseStaticCache } from '@/lib/static-history-cache';

function filterDisciplineChanges(
  changes: TaxonomyChange[],
  disciplineName: string
): TaxonomyChange[] {
  return changes
    .map((change) => {
      const filteredChanges = change.changes.filter((taxonChange) => {
        // Check if this change affects the discipline
        const oldDisciplines = taxonChange.oldTaxon?.Discipline?.map((d) => d.name) || [];
        const newDisciplines = taxonChange.newTaxon?.Discipline?.map((d) => d.name) || [];
        
        // Include if:
        // 1. Taxon was added and has this discipline
        // 2. Taxon was removed and had this discipline
        // 3. Taxon was modified and discipline changed (added/removed this discipline)
        // 4. Taxon was deprecated and has/had this discipline
        
        if (taxonChange.changeType === 'added') {
          return newDisciplines.includes(disciplineName);
        }
        
        if (taxonChange.changeType === 'removed') {
          return oldDisciplines.includes(disciplineName);
        }
        
        if (taxonChange.changeType === 'deprecated') {
          return oldDisciplines.includes(disciplineName) || newDisciplines.includes(disciplineName);
        }
        
        if (taxonChange.changeType === 'modified') {
          const hadDiscipline = oldDisciplines.includes(disciplineName);
          const hasDiscipline = newDisciplines.includes(disciplineName);
          
          // Check if discipline was added, removed, or if taxon already had it
          if (hadDiscipline !== hasDiscipline) {
            // Discipline was added or removed
            return true;
          }
          
          // Check field changes for discipline changes
          if (taxonChange.fieldChanges) {
            const disciplineFieldChange = taxonChange.fieldChanges.find(
              (fc) => fc.field === 'Disciplines'
            );
            if (disciplineFieldChange) {
              const oldDiscs = disciplineFieldChange.oldValue || [];
              const newDiscs = disciplineFieldChange.newValue || [];
              return oldDiscs.includes(disciplineName) || newDiscs.includes(disciplineName);
            }
          }
          
          // If taxon had/has this discipline, include the change
          return hadDiscipline || hasDiscipline;
        }
        
        return false;
      });

      if (filteredChanges.length === 0) {
        return null;
      }

      return {
        ...change,
        changes: filteredChanges,
      };
    })
    .filter((change): change is TaxonomyChange => change !== null);
}

export async function GET(
  request: Request,
  { params }: { params: { discipline: string } }
) {
  try {
    const disciplineName = decodeURIComponent(params.discipline);
    console.log(`[DisciplineHistory] Request for discipline: "${disciplineName}"`);
    
    let cachedHistory;
    let isStatic = false;
    
    // In production/serverless environments, use pre-built static cache
    if (shouldUseStaticCache()) {
      console.log('[DisciplineHistory] Using static pre-built history cache');
      cachedHistory = getStaticHistoryCache();
      isStatic = true;
    } else {
      // In development, use dynamic Git-based cache
      console.log('[DisciplineHistory] Using dynamic Git-based history cache');
      cachedHistory = await getCachedTaxonomyHistory();
    }
    
    if (!cachedHistory) {
      console.error('[DisciplineHistory] No cached history available');
      return NextResponse.json({ 
        changes: [],
        discipline: disciplineName,
        totalCommits: 0,
        commitsWithChanges: 0,
        error: 'Taxonomy history cache not available. Please try again in a moment.',
      });
    }
    
    if (cachedHistory.changes.length === 0) {
      console.log('[DisciplineHistory] Cached history exists but has no changes');
      return NextResponse.json({ 
        changes: [],
        discipline: disciplineName,
        totalCommits: cachedHistory.totalCommits,
        commitsWithChanges: 0,
        message: 'No taxonomy changes found in history',
      });
    }

    console.log(`[DisciplineHistory] Cached history has ${cachedHistory.changes.length} commits with changes`);

    const disciplineHistory = filterDisciplineChanges(cachedHistory.changes, disciplineName);

    return NextResponse.json({
      changes: disciplineHistory,
      discipline: disciplineName,
      totalCommits: cachedHistory.totalCommits,
      commitsWithChanges: disciplineHistory.length,
      fromCache: true,
      cacheAgeMs: Date.now() - cachedHistory.cachedAt,
      isStatic,
      note: isStatic ? 'Using pre-built cache from build time' : undefined,
    });
  } catch (error) {
    console.error('Error getting discipline history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discipline history', changes: [] },
      { status: 500 }
    );
  }
}

