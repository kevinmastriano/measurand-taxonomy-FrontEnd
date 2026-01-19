import { XMLParser } from 'fast-xml-parser';
import { Taxon, Taxonomy } from './types';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text',
  parseAttributeValue: true,
  trimValues: true,
  removeNSPrefix: true, // Remove namespace prefixes to simplify parsing
  parseTagValue: true,
});

export async function parseTaxonomyXML(xmlContent: string): Promise<Taxon[]> {
  try {
    const result = parser.parse(xmlContent) as any;
    
    // With removeNSPrefix: true, namespaces are removed, so it should be 'Taxonomy'
    const taxonomy = result.Taxonomy;
    
    if (!taxonomy) {
      console.error('No Taxonomy found in XML. Result keys:', Object.keys(result));
      return [];
    }
    
    if (!taxonomy.Taxon) {
      console.error('No Taxon found in Taxonomy. Taxonomy keys:', Object.keys(taxonomy));
      return [];
    }

    // Handle both single taxon and array of taxons
    const taxons = Array.isArray(taxonomy.Taxon)
      ? taxonomy.Taxon
      : [taxonomy.Taxon];

    console.log(`Parsed ${taxons.length} taxons from XML`);
    return taxons.map(normalizeTaxon);
  } catch (error) {
    console.error('Error parsing XML:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
    return [];
  }
}

function normalizeTaxon(taxon: any): Taxon {
  // Normalize the taxon structure
  const normalized: Taxon = {
    name: taxon.name || '',
    deprecated: taxon.deprecated === true || taxon.deprecated === 'true',
    replacement: taxon.replacement || '',
    Definition: taxon.Definition?.text || taxon.Definition || '',
  };

  // Handle Result
  if (taxon.Result) {
    normalized.Result = {
      name: taxon.Result.name,
      Quantity: taxon.Result.Quantity ? {
        name: taxon.Result.Quantity.name || taxon.Result.Quantity.text || '',
      } : undefined,
      mLayer: taxon.Result.mLayer ? {
        aspect: taxon.Result.mLayer.aspect || '',
        id: taxon.Result.mLayer.id || '',
      } : undefined,
    };
  }

  // Handle Parameters (can be single or array)
  if (taxon.Parameter) {
    const params = Array.isArray(taxon.Parameter) ? taxon.Parameter : [taxon.Parameter];
    normalized.Parameter = params.map((param: any) => ({
      name: param.name || '',
      optional: param.optional === true || param.optional === 'true',
      Definition: param.Definition?.text || param.Definition || '',
      Quantity: param.Quantity ? {
        name: param.Quantity.name || param.Quantity.text || '',
      } : undefined,
      mLayer: param.mLayer ? {
        aspect: param.mLayer.aspect || '',
        id: param.mLayer.id || '',
      } : undefined,
      Property: param.Property ? {
        name: param.Property.name || '',
        id: param.Property.id || '',
        Definition: param.Property.Definition?.text || param.Property.Definition || '',
        NominalValues: param.Property.NominalValues?.text?.split(' ') || 
                      (Array.isArray(param.Property.NominalValues) ? param.Property.NominalValues : []),
        ExternalReferences: param.Property.ExternalReferences,
      } : undefined,
    }));
  }

  // Handle Disciplines (can be single or array)
  if (taxon.Discipline) {
    const disciplines = Array.isArray(taxon.Discipline) ? taxon.Discipline : [taxon.Discipline];
    normalized.Discipline = disciplines.map((disc: any) => ({
      name: disc.name || disc.text || '',
    }));
  }

  // Handle ExternalReferences
  if (taxon.ExternalReferences) {
    normalized.ExternalReferences = taxon.ExternalReferences;
  }

  return normalized;
}

export function buildTaxonomyTree(taxons: Taxon[]): any {
  const root: any = {
    name: 'Root',
    fullName: '',
    children: [],
    level: 0,
  };

  taxons.forEach((taxon) => {
    const parts = taxon.name.split('.');
    let current = root;

    parts.forEach((part, index) => {
      let child = current.children.find((c: any) => c.name === part);
      
      if (!child) {
        child = {
          name: part,
          fullName: parts.slice(0, index + 1).join('.'),
          children: [],
          level: index + 1,
          taxon: index === parts.length - 1 ? taxon : undefined,
        };
        current.children.push(child);
      }
      
      current = child;
    });
  });

  return root;
}

