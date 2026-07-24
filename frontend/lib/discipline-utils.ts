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
  const target = disciplineName.toLowerCase();
  const disciplineTaxons = taxons.filter(taxon =>
    taxon.Discipline?.some(d => d.name?.toLowerCase() === target)
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
  
  // Related = other disciplines that share result quantity kinds
  const relatedDisciplines = findRelatedBySharedQuantities(
    disciplineName,
    disciplineTaxons,
    taxons
  );

  return {
    name: disciplineName,
    taxonCount: disciplineTaxons.length,
    taxons: disciplineTaxons,
    commonParameters,
    relatedDisciplines,
  };
}

/**
 * Top related disciplines by shared Result.Quantity names.
 * (Catalog taxons almost never list multiple Discipline entries, so
 * co-membership is empty; quantity overlap is the useful signal.)
 */
function findRelatedBySharedQuantities(
  disciplineName: string,
  disciplineTaxons: Taxon[],
  allTaxons: Taxon[]
): string[] {
  const quantities = new Set<string>();
  disciplineTaxons.forEach((taxon) => {
    const q = taxon.Result?.Quantity?.name?.trim().toLowerCase();
    if (q) quantities.add(q);
  });
  if (quantities.size === 0) return [];

  const target = disciplineName.trim().toLowerCase();
  const relatedCounts = new Map<string, number>();

  allTaxons.forEach((taxon) => {
    const q = taxon.Result?.Quantity?.name?.trim().toLowerCase();
    if (!q || !quantities.has(q)) return;
    taxon.Discipline?.forEach((disc) => {
      const name = disc.name?.trim();
      if (!name || name.toLowerCase() === target) return;
      relatedCounts.set(name, (relatedCounts.get(name) || 0) + 1);
    });
  });

  return Array.from(relatedCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([name]) => name);
}

/**
 * Get all disciplines with their taxon counts (optimized for list view - doesn't include full taxon arrays)
 * This function is optimized to process all disciplines in a single pass through the taxons array
 */
export function getAllDisciplineInfos(taxons: Taxon[]): DisciplineInfo[] {
  // Single-pass: discipline → taxons + parameter counts
  const disciplineTaxonMap = new Map<string, Taxon[]>();
  const disciplineParameterCounts = new Map<string, Map<string, number>>();

  taxons.forEach((taxon) => {
    if (!taxon.Discipline?.length) return;
    const disciplineNames = taxon.Discipline.map((d) => d.name?.trim()).filter(
      (name): name is string => !!name
    );

    disciplineNames.forEach((disciplineName) => {
      if (!disciplineTaxonMap.has(disciplineName)) {
        disciplineTaxonMap.set(disciplineName, []);
        disciplineParameterCounts.set(disciplineName, new Map());
      }
      disciplineTaxonMap.get(disciplineName)!.push(taxon);

      if (taxon.Parameter) {
        const paramCounts = disciplineParameterCounts.get(disciplineName)!;
        taxon.Parameter.forEach((param) => {
          paramCounts.set(param.name, (paramCounts.get(param.name) || 0) + 1);
        });
      }
    });
  });

  const disciplines = Array.from(disciplineTaxonMap.keys()).sort();

  return disciplines.map((disciplineName) => {
    const disciplineTaxons = disciplineTaxonMap.get(disciplineName)!;
    const parameterCounts = disciplineParameterCounts.get(disciplineName)!;

    const threshold = Math.max(1, Math.floor(disciplineTaxons.length * 0.3));
    const commonParameters = Array.from(parameterCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([name]) => name)
      .sort();

    return {
      name: disciplineName,
      taxonCount: disciplineTaxons.length,
      taxons: [], // list view omits full arrays
      commonParameters,
      relatedDisciplines: findRelatedBySharedQuantities(
        disciplineName,
        disciplineTaxons,
        taxons
      ),
    };
  });
}

/**
 * Filter taxons by discipline (case-insensitive)
 */
export function filterTaxonsByDiscipline(taxons: Taxon[], disciplineName: string): Taxon[] {
  const target = disciplineName.toLowerCase();
  return taxons.filter(taxon =>
    taxon.Discipline?.some(d => d.name?.toLowerCase() === target)
  );
}

/**
 * Filter taxons by multiple disciplines (OR logic, case-insensitive)
 */
export function filterTaxonsByDisciplines(taxons: Taxon[], disciplineNames: string[]): Taxon[] {
  if (disciplineNames.length === 0) return taxons;

  const targets = new Set(disciplineNames.map(n => n.toLowerCase()));
  return taxons.filter(taxon =>
    taxon.Discipline?.some(d => d.name && targets.has(d.name.toLowerCase()))
  );
}

