import { Taxon } from './types';
import { calculateParameterOverlap } from './relationship-analyzer';

export interface ComparisonResult {
  taxon1: Taxon;
  taxon2: Taxon;
  similarityScore: number;
  differences: {
    parameters: {
      onlyIn1: string[];
      onlyIn2: string[];
      common: string[];
      differentOptionality: Array<{ name: string; taxon1Optional: boolean; taxon2Optional: boolean }>;
    };
    disciplines: {
      onlyIn1: string[];
      onlyIn2: string[];
      common: string[];
    };
    quantities: {
      taxon1: string | null;
      taxon2: string | null;
      same: boolean;
    };
  };
}

/**
 * Compare two taxons and calculate similarity
 */
export function compareTaxons(taxon1: Taxon, taxon2: Taxon): ComparisonResult {
  // Parameter comparison
  const params1 = new Set(taxon1.Parameter?.map(p => p.name) || []);
  const params2 = new Set(taxon2.Parameter?.map(p => p.name) || []);
  
  const onlyIn1 = Array.from(params1).filter(p => !params2.has(p));
  const onlyIn2 = Array.from(params2).filter(p => !params1.has(p));
  const common = Array.from(params1).filter(p => params2.has(p));
  
  // Check optionality differences
  const differentOptionality: Array<{ name: string; taxon1Optional: boolean; taxon2Optional: boolean }> = [];
  common.forEach(paramName => {
    const param1 = taxon1.Parameter?.find(p => p.name === paramName);
    const param2 = taxon2.Parameter?.find(p => p.name === paramName);
    if (param1 && param2 && param1.optional !== param2.optional) {
      differentOptionality.push({
        name: paramName,
        taxon1Optional: param1.optional,
        taxon2Optional: param2.optional,
      });
    }
  });
  
  // Discipline comparison
  const disc1 = new Set(taxon1.Discipline?.map(d => d.name) || []);
  const disc2 = new Set(taxon2.Discipline?.map(d => d.name) || []);
  
  const discOnlyIn1 = Array.from(disc1).filter(d => !disc2.has(d));
  const discOnlyIn2 = Array.from(disc2).filter(d => !disc1.has(d));
  const discCommon = Array.from(disc1).filter(d => disc2.has(d));
  
  // Quantity comparison
  const qty1 = taxon1.Result?.Quantity?.name || taxon1.Result?.mLayer?.aspect || null;
  const qty2 = taxon2.Result?.Quantity?.name || taxon2.Result?.mLayer?.aspect || null;
  
  // Calculate similarity score
  const paramOverlap = calculateParameterOverlap(taxon1, taxon2);
  const discOverlap = discCommon.length / Math.max(disc1.size, disc2.size, 1);
  const qtyMatch = qty1 && qty2 && qty1 === qty2 ? 1 : 0;
  
  const similarityScore = (paramOverlap * 0.6 + discOverlap * 0.2 + qtyMatch * 0.2);
  
  return {
    taxon1,
    taxon2,
    similarityScore,
    differences: {
      parameters: {
        onlyIn1,
        onlyIn2,
        common,
        differentOptionality,
      },
      disciplines: {
        onlyIn1: discOnlyIn1,
        onlyIn2: discOnlyIn2,
        common: discCommon,
      },
      quantities: {
        taxon1: qty1,
        taxon2: qty2,
        same: qty1 === qty2,
      },
    },
  };
}

/**
 * Compare multiple taxons (2-4)
 */
export function compareMultipleTaxons(taxons: Taxon[]): ComparisonResult[] {
  if (taxons.length < 2) return [];
  
  const comparisons: ComparisonResult[] = [];
  for (let i = 0; i < taxons.length; i++) {
    for (let j = i + 1; j < taxons.length; j++) {
      comparisons.push(compareTaxons(taxons[i], taxons[j]));
    }
  }
  
  return comparisons;
}


