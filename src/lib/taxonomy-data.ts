import { parseTaxonomyXML } from './xml-parser';
import { Taxonomy } from '@/types/taxonomy';

// Cache for taxonomy data
let cachedTaxonomy: Taxonomy | null = null;

export async function loadTaxonomyData(): Promise<Taxonomy> {
  if (cachedTaxonomy) {
    return cachedTaxonomy;
  }

  try {
    const response = await fetch('/data/MeasurandTaxonomyCatalog.xml');
    if (!response.ok) {
      throw new Error(`Failed to fetch taxonomy data: ${response.statusText}`);
    }
    
    const xmlContent = await response.text();
    const taxonomy = parseTaxonomyXML(xmlContent);
    
    cachedTaxonomy = taxonomy;
    return taxonomy;
  } catch (error) {
    console.error('Error loading taxonomy data:', error);
    throw error;
  }
}

export async function loadDocumentContent(filename: string): Promise<string> {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error loading document ${filename}:`, error);
    throw error;
  }
}

// Utility functions for taxonomy data
export function getUniqueDisciplines(taxonomy: Taxonomy): string[] {
  const disciplines = new Set<string>();
  
  taxonomy.taxons.forEach(taxon => {
    taxon.disciplines.forEach(discipline => {
      if (discipline.name) {
        disciplines.add(discipline.name);
      }
    });
  });
  
  return Array.from(disciplines).sort();
}

export function getQuantityKinds(taxonomy: Taxonomy): string[] {
  const quantities = new Set<string>();
  
  taxonomy.taxons.forEach(taxon => {
    if (taxon.result?.quantity?.name) {
      quantities.add(taxon.result.quantity.name);
    }
    taxon.parameters.forEach(param => {
      if (param.quantity?.name) {
        quantities.add(param.quantity.name);
      }
    });
  });
  
  return Array.from(quantities).sort();
}

export function buildTaxonomyTree(taxonomy: Taxonomy) {
  // Build a hierarchical tree structure based on taxon names
  // e.g., "Measure.Temperature.Simulated.Thermocouple" becomes a nested structure
  
  const tree: any = {};
  
  taxonomy.taxons.forEach(taxon => {
    const parts = taxon.name.split('.');
    let current = tree;
    
    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          name: part,
          fullName: parts.slice(0, index + 1).join('.'),
          children: {},
          taxon: index === parts.length - 1 ? taxon : null,
          isLeaf: index === parts.length - 1
        };
      }
      current = current[part].children;
    });
  });
  
  return tree;
} 