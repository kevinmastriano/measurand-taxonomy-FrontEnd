import { Taxon } from './types';

export interface QuantityInfo {
  name: string;
  aspect: string;
  id: string;
  taxons: Taxon[];
  taxonCount: number;
  disciplines: string[];
  commonParameters: string[];
}

/**
 * Extract all unique quantity kinds from taxons
 */
export function getAllQuantityKinds(taxons: Taxon[]): Map<string, QuantityInfo> {
  const quantityMap = new Map<string, QuantityInfo>();
  
  taxons.forEach(taxon => {
    // Check Result quantity
    if (taxon.Result?.mLayer?.aspect && taxon.Result?.mLayer?.id) {
      const key = `${taxon.Result.mLayer.aspect}:${taxon.Result.mLayer.id}`;
      
      if (!quantityMap.has(key)) {
        quantityMap.set(key, {
          name: taxon.Result.Quantity?.name || taxon.Result.mLayer.aspect,
          aspect: taxon.Result.mLayer.aspect,
          id: taxon.Result.mLayer.id,
          taxons: [],
          taxonCount: 0,
          disciplines: [],
          commonParameters: [],
        });
      }
      
      const info = quantityMap.get(key)!;
      info.taxons.push(taxon);
      info.taxonCount++;
      
      // Collect disciplines
      if (taxon.Discipline) {
        taxon.Discipline.forEach(disc => {
          if (disc.name && !info.disciplines.includes(disc.name)) {
            info.disciplines.push(disc.name);
          }
        });
      }
    }
    
    // Check Parameter quantities
    if (taxon.Parameter) {
      taxon.Parameter.forEach(param => {
        if (param.mLayer?.aspect && param.mLayer?.id) {
          const key = `${param.mLayer.aspect}:${param.mLayer.id}`;
          
          if (!quantityMap.has(key)) {
            quantityMap.set(key, {
              name: param.Quantity?.name || param.mLayer.aspect,
              aspect: param.mLayer.aspect,
              id: param.mLayer.id,
              taxons: [],
              taxonCount: 0,
              disciplines: [],
              commonParameters: [],
            });
          }
          
          const info = quantityMap.get(key)!;
          if (!info.taxons.includes(taxon)) {
            info.taxons.push(taxon);
            info.taxonCount++;
          }
          
          // Collect disciplines
          if (taxon.Discipline) {
            taxon.Discipline.forEach(disc => {
              if (disc.name && !info.disciplines.includes(disc.name)) {
                info.disciplines.push(disc.name);
              }
            });
          }
        }
      });
    }
  });
  
  // Calculate common parameters for each quantity
  quantityMap.forEach((info, key) => {
    const parameterCounts = new Map<string, number>();
    info.taxons.forEach(taxon => {
      if (taxon.Parameter) {
        taxon.Parameter.forEach(param => {
          const count = parameterCounts.get(param.name) || 0;
          parameterCounts.set(param.name, count + 1);
        });
      }
    });
    
    const threshold = Math.max(1, Math.floor(info.taxons.length * 0.3));
    info.commonParameters = Array.from(parameterCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([name]) => name)
      .sort();
  });
  
  return quantityMap;
}

/**
 * Get quantity info by aspect and id
 */
export function getQuantityInfo(aspect: string, id: string, taxons: Taxon[]): QuantityInfo | null {
  const quantities = getAllQuantityKinds(taxons);
  const key = `${aspect}:${id}`;
  return quantities.get(key) || null;
}

/**
 * Get M-Layer registry URL (if pattern exists)
 */
export function getMLayerRegistryUrl(aspect: string, id: string): string | null {
  // M-Layer registry URL pattern
  return `https://api.mlayer.org/aspects/${id}`;
}


