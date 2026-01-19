import { Taxon } from './types';

export interface RelatedTaxon {
  taxon: Taxon;
  relationshipType: 'same_quantity' | 'same_parameters' | 'measure_source_pair' | 'same_discipline' | 'similar_name';
  similarityScore: number;
  sharedElements?: {
    quantities?: string[];
    parameters?: string[];
    disciplines?: string[];
  };
}

/**
 * Find taxons that share the same quantity kind (via mLayer aspect)
 */
export function findTaxonsWithSameQuantity(taxon: Taxon, allTaxons: Taxon[]): RelatedTaxon[] {
  if (!taxon.Result?.mLayer?.aspect) return [];
  
  const aspect = taxon.Result.mLayer.aspect;
  const related: RelatedTaxon[] = [];
  
  allTaxons.forEach(other => {
    if (other.name === taxon.name) return; // Skip self
    
    if (other.Result?.mLayer?.aspect === aspect) {
      related.push({
        taxon: other,
        relationshipType: 'same_quantity',
        similarityScore: 0.8,
        sharedElements: {
          quantities: [aspect],
        },
      });
    }
  });
  
  return related.sort((a, b) => b.similarityScore - a.similarityScore);
}

/**
 * Find taxons that share parameters
 */
export function findTaxonsWithSharedParameters(taxon: Taxon, allTaxons: Taxon[]): RelatedTaxon[] {
  if (!taxon.Parameter || taxon.Parameter.length === 0) return [];
  
  const taxonParamNames = new Set(taxon.Parameter.map(p => p.name));
  const related: RelatedTaxon[] = [];
  
  allTaxons.forEach(other => {
    if (other.name === taxon.name) return; // Skip self
    if (!other.Parameter || other.Parameter.length === 0) return;
    
    const otherParamNames = new Set(other.Parameter.map(p => p.name));
    const sharedParams = Array.from(taxonParamNames).filter(name => otherParamNames.has(name));
    
    if (sharedParams.length > 0) {
      const overlap = sharedParams.length / Math.max(taxonParamNames.size, otherParamNames.size);
      related.push({
        taxon: other,
        relationshipType: 'same_parameters',
        similarityScore: overlap,
        sharedElements: {
          parameters: sharedParams,
        },
      });
    }
  });
  
  return related.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
}

/**
 * Find Measure/Source pairs (e.g., Measure.Temperature ↔ Source.Temperature)
 */
export function findMeasureSourcePairs(taxon: Taxon, allTaxons: Taxon[]): RelatedTaxon[] {
  const parts = taxon.name.split('.');
  if (parts.length < 2) return [];
  
  const processType = parts[0]; // 'Measure' or 'Source'
  const quantityPart = parts.slice(1).join('.');
  
  const oppositeProcessType = processType === 'Measure' ? 'Source' : 'Measure';
  const pairName = `${oppositeProcessType}.${quantityPart}`;
  
  const pair = allTaxons.find(t => t.name === pairName);
  
  if (pair) {
    return [{
      taxon: pair,
      relationshipType: 'measure_source_pair',
      similarityScore: 0.9,
    }];
  }
  
  return [];
}

/**
 * Find taxons in the same discipline
 */
export function findTaxonsInSameDiscipline(taxon: Taxon, allTaxons: Taxon[]): RelatedTaxon[] {
  if (!taxon.Discipline || taxon.Discipline.length === 0) return [];
  
  const disciplineNames = new Set(taxon.Discipline.map(d => d.name));
  const related: RelatedTaxon[] = [];
  
  allTaxons.forEach(other => {
    if (other.name === taxon.name) return; // Skip self
    
    const otherDisciplines = other.Discipline?.map(d => d.name) || [];
    const sharedDisciplines = otherDisciplines.filter(d => disciplineNames.has(d));
    
    if (sharedDisciplines.length > 0) {
      related.push({
        taxon: other,
        relationshipType: 'same_discipline',
        similarityScore: 0.6,
        sharedElements: {
          disciplines: sharedDisciplines,
        },
      });
    }
  });
  
  return related.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
}

/**
 * Find taxons with similar names (fuzzy matching)
 */
export function findTaxonsWithSimilarNames(taxon: Taxon, allTaxons: Taxon[]): RelatedTaxon[] {
  const taxonNameLower = taxon.name.toLowerCase();
  const taxonParts = taxon.name.split('.');
  const related: RelatedTaxon[] = [];
  
  allTaxons.forEach(other => {
    if (other.name === taxon.name) return; // Skip self
    
    const otherNameLower = other.name.toLowerCase();
    const otherParts = other.name.split('.');
    
    // Check if they share common prefix parts
    let commonParts = 0;
    const minLength = Math.min(taxonParts.length, otherParts.length);
    for (let i = 0; i < minLength; i++) {
      if (taxonParts[i].toLowerCase() === otherParts[i].toLowerCase()) {
        commonParts++;
      } else {
        break;
      }
    }
    
    if (commonParts >= 2) {
      const similarity = commonParts / Math.max(taxonParts.length, otherParts.length);
      related.push({
        taxon: other,
        relationshipType: 'similar_name',
        similarityScore: similarity,
      });
    }
  });
  
  return related.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
}

/**
 * Get all related taxons for a given taxon
 */
export function getAllRelatedTaxons(taxon: Taxon, allTaxons: Taxon[]): RelatedTaxon[] {
  const relatedMap = new Map<string, RelatedTaxon>();
  
  // Combine all relationship types
  const allRelated = [
    ...findMeasureSourcePairs(taxon, allTaxons),
    ...findTaxonsWithSameQuantity(taxon, allTaxons),
    ...findTaxonsWithSharedParameters(taxon, allTaxons),
    ...findTaxonsInSameDiscipline(taxon, allTaxons),
    ...findTaxonsWithSimilarNames(taxon, allTaxons),
  ];
  
  // Deduplicate and merge relationships
  allRelated.forEach(related => {
    const existing = relatedMap.get(related.taxon.name);
    if (!existing || existing.similarityScore < related.similarityScore) {
      relatedMap.set(related.taxon.name, related);
    }
  });
  
  return Array.from(relatedMap.values())
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 15); // Limit to top 15
}

/**
 * Calculate parameter overlap percentage between two taxons
 */
export function calculateParameterOverlap(taxon1: Taxon, taxon2: Taxon): number {
  if (!taxon1.Parameter || !taxon2.Parameter) return 0;
  
  const params1 = new Set(taxon1.Parameter.map(p => p.name));
  const params2 = new Set(taxon2.Parameter.map(p => p.name));
  
  const intersection = Array.from(params1).filter(p => params2.has(p));
  const union = new Set([...params1, ...params2]);
  
  return union.size > 0 ? intersection.length / union.size : 0;
}


