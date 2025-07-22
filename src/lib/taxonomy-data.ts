import { parseTaxonomyXML } from './xml-parser';
import { Taxonomy, Taxon } from '@/types/taxonomy';

// Cache for taxonomy data
let cachedTaxonomy: Taxonomy | null = null;

export async function loadTaxonomyData(): Promise<Taxonomy> {
  // Return cached data if available
  if (cachedTaxonomy) {
    return cachedTaxonomy;
  }

  try {
    const response = await fetch('/data/MeasurandTaxonomyCatalog.xml');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlContent = await response.text();
    const taxonomy = parseTaxonomyXML(xmlContent);
    
    // Cache the parsed data
    cachedTaxonomy = taxonomy;
    
    return taxonomy;
  } catch (error) {
    console.error('Error loading taxonomy data:', error);
    throw new Error('Failed to load taxonomy data from XML file');
  }
}

export async function loadDocumentContent(filename: string): Promise<string> {
  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Error loading document ${filename}:`, error);
    throw new Error(`Failed to load document: ${filename}`);
  }
}

// Utility functions for taxonomy data
export function getUniqueDisciplines(taxonomy: Taxonomy | null): string[] {
  if (!taxonomy || !taxonomy.taxons) {
    return [];
  }
  
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

export function getQuantityKinds(taxonomy: Taxonomy | null): string[] {
  if (!taxonomy || !taxonomy.taxons) {
    return [];
  }
  
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

// Define proper types for the tree structure
interface TreeNode {
  name: string;
  fullName: string;
  children: Record<string, TreeNode>;
  taxon: Taxon | null;
  isLeaf: boolean;
}

export function buildTaxonomyTree(taxonomy: Taxonomy | null): Record<string, TreeNode> {
  // Build a hierarchical tree structure based on taxon names
  // e.g., "Measure.Temperature.Simulated.Thermocouple" becomes a nested structure
  
  if (!taxonomy || !taxonomy.taxons || taxonomy.taxons.length === 0) {
    return {};
  }
  
  const tree: Record<string, TreeNode> = {};
  
  taxonomy.taxons.forEach(taxon => {
    const parts = taxon.name.split('.');
    let current: Record<string, TreeNode> = tree;
    
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