import { XMLParser } from 'fast-xml-parser';
import { Taxon, Taxonomy, Parameter, Result, Discipline } from '@/types/taxonomy';

// XML Parser configuration
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  trimValues: true,
  parseTrueNumberOnly: false,
  arrayMode: false,
  processEntities: true,
};

const parser = new XMLParser(parserOptions);

export function parseTaxonomyXML(xmlContent: string): Taxonomy {
  try {
    const parsedXML = parser.parse(xmlContent);
    
    // Handle the main taxonomy catalog structure
    const taxonomyRoot = parsedXML['mtc:Taxonomy'] || parsedXML.Taxonomy;
    
    if (!taxonomyRoot) {
      throw new Error('Invalid taxonomy XML structure');
    }

    // Extract taxons
    let taxonArray = taxonomyRoot['mtc:Taxon'] || taxonomyRoot.Taxon || [];
    
    // Ensure taxonArray is always an array
    if (!Array.isArray(taxonArray)) {
      taxonArray = [taxonArray];
    }

    const taxons: Taxon[] = taxonArray.map((taxonData: any) => parseTaxon(taxonData));

    return {
      taxons
    };
  } catch (error) {
    console.error('Error parsing taxonomy XML:', error);
    throw new Error(`Failed to parse taxonomy XML: ${error}`);
  }
}

function parseTaxon(taxonData: any): Taxon {
  const name = taxonData['@_name'] || '';
  const deprecated = taxonData['@_deprecated'] === 'true' || taxonData['@_deprecated'] === true;
  const replacement = taxonData['@_replacement'] || '';
  
  // Parse result
  const resultData = taxonData['mtc:Result'] || taxonData.Result;
  const result: Result | undefined = resultData ? parseResult(resultData) : undefined;

  // Parse parameters
  let parameterArray = taxonData['mtc:Parameter'] || taxonData.Parameter || [];
  if (!Array.isArray(parameterArray)) {
    parameterArray = parameterArray ? [parameterArray] : [];
  }
  const parameters: Parameter[] = parameterArray.map((param: any) => parseParameter(param));

  // Parse disciplines
  let disciplineArray = taxonData['mtc:Discipline'] || taxonData.Discipline || [];
  if (!Array.isArray(disciplineArray)) {
    disciplineArray = disciplineArray ? [disciplineArray] : [];
  }
  const disciplines: Discipline[] = disciplineArray.map((disc: any) => ({
    name: disc['@_name'] || disc['#text'] || ''
  }));

  // Parse definition
  const definition = taxonData['mtc:Definition'] || taxonData.Definition || '';

  return {
    name,
    deprecated,
    replacement: replacement || undefined,
    result,
    parameters,
    disciplines,
    definition: definition || undefined,
  };
}

function parseResult(resultData: any): Result {
  const name = resultData['@_name'];
  
  // Parse quantity
  const quantityData = resultData['uom:Quantity'] || resultData.Quantity;
  const quantity = quantityData ? {
    name: quantityData['@_name'] || ''
  } : undefined;

  // Parse mLayer
  const mLayerData = resultData['mtc:mLayer'] || resultData.mLayer;
  const mLayer = mLayerData ? {
    aspect: mLayerData['@_aspect'] || '',
    id: mLayerData['@_id'] || ''
  } : undefined;

  return {
    name,
    quantity,
    mLayer,
  };
}

function parseParameter(paramData: any): Parameter {
  const name = paramData['@_name'] || '';
  const optional = paramData['@_optional'] === 'true' || paramData['@_optional'] === true;
  const definition = paramData['mtc:Definition'] || paramData.Definition || '';
  
  // Parse quantity
  const quantityData = paramData['uom:Quantity'] || paramData.Quantity;
  const quantity = quantityData ? {
    name: quantityData['@_name'] || ''
  } : undefined;

  // Parse mLayer
  const mLayerData = paramData['mtc:mLayer'] || paramData.mLayer;
  const mLayer = mLayerData ? {
    aspect: mLayerData['@_aspect'] || '',
    id: mLayerData['@_id'] || ''
  } : undefined;

  return {
    name,
    optional,
    definition: definition || undefined,
    quantity,
    mLayer,
  };
}

export function parseSingleTaxonXML(xmlContent: string): Taxon {
  try {
    const parsedXML = parser.parse(xmlContent);
    const taxonData = parsedXML.Taxon || parsedXML['mtc:Taxon'];
    
    if (!taxonData) {
      throw new Error('Invalid taxon XML structure');
    }

    return parseTaxon(taxonData);
  } catch (error) {
    console.error('Error parsing taxon XML:', error);
    throw new Error(`Failed to parse taxon XML: ${error}`);
  }
}

export function generateTaxonXML(taxon: Taxon): string {
  // Generate XML string from taxon object
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += `<Taxon xmlns:mtc="https://cls-schemas.s3.us-west-1.amazonaws.com/MetrologyTaxonomyCatalog" xmlns:uom="https://cls-schemas.s3.us-west-1.amazonaws.com/UOM_Database" name="${taxon.name}" deprecated="${taxon.deprecated}" replacement="${taxon.replacement || ''}">\n`;
  
  // Add result
  if (taxon.result) {
    xml += '  <mtc:Result' + (taxon.result.name ? ` name="${taxon.result.name}"` : '') + '>\n';
    if (taxon.result.quantity) {
      xml += `    <uom:Quantity name="${taxon.result.quantity.name}" />\n`;
    }
    if (taxon.result.mLayer) {
      xml += `    <mtc:mLayer aspect="${taxon.result.mLayer.aspect}" id="${taxon.result.mLayer.id}" />\n`;
    }
    xml += '  </mtc:Result>\n';
  }

  // Add parameters
  taxon.parameters.forEach(param => {
    xml += `  <mtc:Parameter name="${param.name}" optional="${param.optional}">\n`;
    if (param.definition) {
      xml += `    <mtc:Definition>${param.definition}</mtc:Definition>\n`;
    }
    if (param.quantity) {
      xml += `    <uom:Quantity name="${param.quantity.name}" />\n`;
    }
    if (param.mLayer) {
      xml += `    <mtc:mLayer aspect="${param.mLayer.aspect}" id="${param.mLayer.id}" />\n`;
    }
    xml += '  </mtc:Parameter>\n';
  });

  // Add disciplines
  taxon.disciplines.forEach(disc => {
    xml += `  <mtc:Discipline name="${disc.name}" />\n`;
  });

  // Add definition
  if (taxon.definition) {
    xml += `  <mtc:Definition>${taxon.definition}</mtc:Definition>\n`;
  }

  xml += '</Taxon>';
  
  return xml;
} 