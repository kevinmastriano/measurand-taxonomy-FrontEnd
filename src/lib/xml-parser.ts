import { XMLParser } from 'fast-xml-parser';
import { Taxonomy, Taxon, Parameter, Result, Discipline } from '../types/taxonomy';

// Define interfaces for XML parsing
interface ParsedXMLData {
  'mtc:Taxonomy'?: {
    'mtc:Taxon'?: XMLTaxonData | XMLTaxonData[];
  };
}

interface XMLTaxonData {
  '@_name': string;
  '@_deprecated'?: string;
  '@_replacement'?: string;
  'mtc:Definition'?: string;
  'mtc:Result'?: XMLResultData;
  'mtc:Disciplines'?: {
    'mtc:Discipline'?: string | string[];
  };
  'mtc:Parameter'?: XMLParameterData | XMLParameterData[];
}

interface XMLResultData {
  'uom:Quantity'?: {
    '@_name': string;
  };
  'mtc:mLayer'?: {
    '@_aspect': string;
    '@_id': string;
  };
}

interface XMLParameterData {
  '@_name': string;
  '@_optional'?: string;
  'mtc:Definition'?: string;
  'uom:Quantity'?: {
    '@_name': string;
  };
  'mtc:mLayer'?: {
    '@_aspect': string;
    '@_id': string;
  };
}

export function parseTaxonomyXML(xmlContent: string): Taxonomy {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });

  const parsed = parser.parse(xmlContent) as ParsedXMLData;
  const catalog = parsed['mtc:Taxonomy'];
  
  if (!catalog) {
    throw new Error('Invalid taxonomy XML structure');
  }

  const taxons: Taxon[] = [];
  const taxonData = catalog['mtc:Taxon'];

  if (taxonData) {
    const taxonArray = Array.isArray(taxonData) ? taxonData : [taxonData];
    
    taxonArray.forEach(taxonXML => {
      const taxon = parseTaxon(taxonXML);
      if (taxon) {
        taxons.push(taxon);
      }
    });
  }

  return {
    taxons
  };
}

function parseTaxon(taxonData: XMLTaxonData): Taxon | undefined {
  if (!taxonData['@_name']) return undefined;

  const result = parseResult(taxonData['mtc:Result']);
  const parameters = parseParameters(taxonData['mtc:Parameter']);
  const disciplines = parseDisciplines(taxonData['mtc:Disciplines']);

  return {
    name: taxonData['@_name'],
    deprecated: taxonData['@_deprecated'] === 'true',
    replacement: taxonData['@_replacement'] || '',
    definition: taxonData['mtc:Definition'] || '',
    result,
    disciplines,
    parameters
  };
}

function parseResult(resultData: XMLResultData | undefined): Result | undefined {
  if (!resultData || !resultData['uom:Quantity']) return undefined;

  return {
    quantity: { name: resultData['uom:Quantity']['@_name'] },
    mLayer: resultData['mtc:mLayer'] ? {
      aspect: resultData['mtc:mLayer']['@_aspect'],
      id: resultData['mtc:mLayer']['@_id']
    } : undefined
  };
}

function parseDisciplines(disciplinesData: { 'mtc:Discipline'?: string | string[] } | undefined): Discipline[] {
  if (!disciplinesData?.['mtc:Discipline']) return [];
  
  const disciplines = Array.isArray(disciplinesData['mtc:Discipline']) 
    ? disciplinesData['mtc:Discipline'] 
    : [disciplinesData['mtc:Discipline']];
  
  return disciplines.map(name => ({ name }));
}

function parseParameters(parametersData: XMLParameterData | XMLParameterData[] | undefined): Parameter[] {
  if (!parametersData) return [];

  const parameters = Array.isArray(parametersData) 
    ? parametersData 
    : [parametersData];

  return parameters.map(paramData => parseParameter(paramData)).filter((param): param is Parameter => param !== undefined);
}

function parseParameter(paramData: XMLParameterData): Parameter | undefined {
  if (!paramData['@_name']) return undefined;

  return {
    name: paramData['@_name'],
    optional: paramData['@_optional'] === 'true',
    definition: paramData['mtc:Definition'] || '',
    quantity: paramData['uom:Quantity'] ? { name: paramData['uom:Quantity']['@_name'] } : undefined,
    mLayer: paramData['mtc:mLayer'] ? {
      aspect: paramData['mtc:mLayer']['@_aspect'],
      id: paramData['mtc:mLayer']['@_id']
    } : undefined
  };
}

// Generate XML function (existing implementation can stay the same for now)
export function generateTaxonXML(taxon: Taxon): string {
  let xml = `<mtc:Taxon name="${taxon.name}" deprecated="${taxon.deprecated}" replacement="${taxon.replacement || ''}">\n`;
  
  if (taxon.definition) {
    xml += `  <mtc:Definition>${taxon.definition}</mtc:Definition>\n`;
  }
  
  if (taxon.result) {
    xml += `  <mtc:Result>\n`;
    if (taxon.result.quantity?.name) {
      xml += `    <uom:Quantity name="${taxon.result.quantity.name}"></uom:Quantity>\n`;
    }
    if (taxon.result.mLayer) {
      xml += `    <mtc:mLayer aspect="${taxon.result.mLayer.aspect}" id="${taxon.result.mLayer.id}"></mtc:mLayer>\n`;
    }
    xml += `  </mtc:Result>\n`;
  }
  
  if (taxon.disciplines && taxon.disciplines.length > 0) {
    xml += `  <mtc:Disciplines>\n`;
    taxon.disciplines.forEach(discipline => {
      xml += `    <mtc:Discipline>${discipline.name}</mtc:Discipline>\n`;
    });
    xml += `  </mtc:Disciplines>\n`;
  }
  
  if (taxon.parameters && taxon.parameters.length > 0) {
    taxon.parameters.forEach(param => {
      xml += `  <mtc:Parameter name="${param.name}" optional="${param.optional}">\n`;
      if (param.definition) {
        xml += `    <mtc:Definition>${param.definition}</mtc:Definition>\n`;
      }
      if (param.quantity) {
        xml += `    <uom:Quantity name="${param.quantity.name}"></uom:Quantity>\n`;
      }
      if (param.mLayer) {
        xml += `    <mtc:mLayer aspect="${param.mLayer.aspect}" id="${param.mLayer.id}"></mtc:mLayer>\n`;
      }
      xml += `  </mtc:Parameter>\n`;
    });
  }
  
  xml += `</mtc:Taxon>`;
  
  return xml;
} 