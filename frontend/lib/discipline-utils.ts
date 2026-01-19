import { Taxon } from './types';

export interface DisciplineInfo {
  name: string;
  taxonCount: number;
  taxons: Taxon[];
  commonParameters: string[];
  relatedDisciplines: string[];
}

/**
 * Extract all unique disciplines from taxons
 */
export function getAllDisciplines(taxons: Taxon[]): string[] {
  const disciplineSet = new Set<string>();
  
  taxons.forEach(taxon => {
    if (taxon.Discipline && taxon.Discipline.length > 0) {
      taxon.Discipline.forEach(disc => {
        if (disc.name && disc.name.trim()) {
          disciplineSet.add(disc.name.trim());
        }
      });
    }
  });
  
  return Array.from(disciplineSet).sort();
}

/**
 * Get detailed information about a specific discipline
 */
export function getDisciplineInfo(disciplineName: string, taxons: Taxon[]): DisciplineInfo {
  const disciplineTaxons = taxons.filter(taxon => 
    taxon.Discipline?.some(d => d.name === disciplineName)
  );
  
  // Find common parameters across taxons in this discipline
  const parameterCounts = new Map<string, number>();
  disciplineTaxons.forEach(taxon => {
    if (taxon.Parameter) {
      taxon.Parameter.forEach(param => {
        const count = parameterCounts.get(param.name) || 0;
        parameterCounts.set(param.name, count + 1);
      });
    }
  });
  
  // Get parameters that appear in at least 30% of taxons
  const threshold = Math.max(1, Math.floor(disciplineTaxons.length * 0.3));
  const commonParameters = Array.from(parameterCounts.entries())
    .filter(([_, count]) => count >= threshold)
    .map(([name]) => name)
    .sort();
  
  // Find related disciplines (disciplines that share taxons)
  const relatedDisciplineCounts = new Map<string, number>();
  disciplineTaxons.forEach(taxon => {
    if (taxon.Discipline) {
      taxon.Discipline.forEach(disc => {
        if (disc.name !== disciplineName && disc.name.trim()) {
          const count = relatedDisciplineCounts.get(disc.name) || 0;
          relatedDisciplineCounts.set(disc.name, count + 1);
        }
      });
    }
  });
  
  const relatedDisciplines = Array.from(relatedDisciplineCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);
  
  return {
    name: disciplineName,
    taxonCount: disciplineTaxons.length,
    taxons: disciplineTaxons,
    commonParameters,
    relatedDisciplines,
  };
}

/**
 * Get all disciplines with their taxon counts (optimized for list view - doesn't include full taxon arrays)
 * This function is optimized to process all disciplines in a single pass through the taxons array
 */
export function getAllDisciplineInfos(taxons: Taxon[]): DisciplineInfo[] {
  // Single-pass processing: build all maps while iterating through taxons once
  const disciplineTaxonMap = new Map<string, Taxon[]>();
  const disciplineParameterCounts = new Map<string, Map<string, number>>();
  const disciplineRelatedCounts = new Map<string, Map<string, number>>();
  
  // Single pass through all taxons
  taxons.forEach(taxon => {
    if (taxon.Discipline && taxon.Discipline.length > 0) {
      const disciplineNames = taxon.Discipline
        .map(d => d.name?.trim())
        .filter((name): name is string => !!name);
      
      // Add taxon to each discipline's map
      disciplineNames.forEach(disciplineName => {
        if (!disciplineTaxonMap.has(disciplineName)) {
          disciplineTaxonMap.set(disciplineName, []);
          disciplineParameterCounts.set(disciplineName, new Map());
          disciplineRelatedCounts.set(disciplineName, new Map());
        }
        disciplineTaxonMap.get(disciplineName)!.push(taxon);
        
        // Count parameters for this discipline
        if (taxon.Parameter) {
          const paramCounts = disciplineParameterCounts.get(disciplineName)!;
          taxon.Parameter.forEach(param => {
            const count = paramCounts.get(param.name) || 0;
            paramCounts.set(param.name, count + 1);
          });
        }
        
        // Count related disciplines (other disciplines this taxon belongs to)
        const relatedCounts = disciplineRelatedCounts.get(disciplineName)!;
        disciplineNames.forEach(otherDisc => {
          if (otherDisc !== disciplineName) {
            const count = relatedCounts.get(otherDisc) || 0;
            relatedCounts.set(otherDisc, count + 1);
          }
        });
      });
    }
  });
  
  // Build results efficiently
  const disciplines = Array.from(disciplineTaxonMap.keys()).sort();
  
  return disciplines.map(disciplineName => {
    const disciplineTaxons = disciplineTaxonMap.get(disciplineName)!;
    const parameterCounts = disciplineParameterCounts.get(disciplineName)!;
    const relatedCounts = disciplineRelatedCounts.get(disciplineName)!;
    
    // Get parameters that appear in at least 30% of taxons
    const threshold = Math.max(1, Math.floor(disciplineTaxons.length * 0.3));
    const commonParameters = Array.from(parameterCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([name]) => name)
      .sort();
    
    // Get top 5 related disciplines
    const relatedDisciplines = Array.from(relatedCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
    
    return {
      name: disciplineName,
      taxonCount: disciplineTaxons.length,
      taxons: [], // Don't include full taxon arrays for list view - saves memory and processing
      commonParameters,
      relatedDisciplines,
    };
  });
}

/**
 * Filter taxons by discipline
 */
export function filterTaxonsByDiscipline(taxons: Taxon[], disciplineName: string): Taxon[] {
  return taxons.filter(taxon => 
    taxon.Discipline?.some(d => d.name === disciplineName)
  );
}

/**
 * Filter taxons by multiple disciplines (OR logic)
 */
export function filterTaxonsByDisciplines(taxons: Taxon[], disciplineNames: string[]): Taxon[] {
  if (disciplineNames.length === 0) return taxons;
  
  return taxons.filter(taxon => 
    taxon.Discipline?.some(d => disciplineNames.includes(d.name))
  );
}

