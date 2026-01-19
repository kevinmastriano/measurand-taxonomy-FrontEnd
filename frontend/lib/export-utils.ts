import { Taxon } from './types';

/**
 * Export taxon as JSON
 */
export function exportAsJSON(taxon: Taxon): string {
  return JSON.stringify(taxon, null, 2);
}

/**
 * Export taxon as XML (MII format)
 */
export function exportAsXML(taxon: Taxon): string {
  // Basic XML export - in production, use a proper XML builder
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += `<mtc:Taxon name="${taxon.name}" deprecated="${taxon.deprecated}" replacement="${taxon.replacement || ''}" xmlns:mtc="https://cls-schemas.s3.us-west-1.amazonaws.com/MII/MeasurandTaxonomyCatalog" xmlns:uom="https://cls-schemas.s3.us-west-1.amazonaws.com/MII/UOM_Database">\n`;
  
  if (taxon.Result) {
    xml += '  <mtc:Result';
    if (taxon.Result.name) {
      xml += ` name="${taxon.Result.name}"`;
    }
    xml += '>\n';
    if (taxon.Result.Quantity) {
      xml += `    <uom:Quantity name="${taxon.Result.Quantity.name}"></uom:Quantity>\n`;
    }
    if (taxon.Result.mLayer) {
      xml += `    <mtc:mLayer aspect="${taxon.Result.mLayer.aspect}" id="${taxon.Result.mLayer.id}"></mtc:mLayer>\n`;
    }
    xml += '  </mtc:Result>\n';
  }
  
  if (taxon.Parameter && taxon.Parameter.length > 0) {
    taxon.Parameter.forEach(param => {
      xml += `  <mtc:Parameter name="${param.name}" optional="${param.optional}">\n`;
      if (param.Definition) {
        xml += `    <mtc:Definition>${escapeXML(param.Definition)}</mtc:Definition>\n`;
      }
      if (param.Quantity) {
        xml += `    <uom:Quantity name="${param.Quantity.name}"></uom:Quantity>\n`;
      }
      if (param.mLayer) {
        xml += `    <mtc:mLayer aspect="${param.mLayer.aspect}" id="${param.mLayer.id}"></mtc:mLayer>\n`;
      }
      xml += '  </mtc:Parameter>\n';
    });
  }
  
  if (taxon.Discipline && taxon.Discipline.length > 0) {
    taxon.Discipline.forEach(disc => {
      xml += `  <mtc:Discipline name="${disc.name}"></mtc:Discipline>\n`;
    });
  }
  
  if (taxon.Definition) {
    xml += `  <mtc:Definition>${escapeXML(taxon.Definition)}</mtc:Definition>\n`;
  }
  
  xml += '</mtc:Taxon>';
  return xml;
}

/**
 * Export taxon as CSV
 */
export function exportAsCSV(taxon: Taxon): string {
  const rows: string[] = [];
  rows.push('Field,Value');
  rows.push(`Name,"${taxon.name}"`);
  rows.push(`Deprecated,${taxon.deprecated}`);
  if (taxon.replacement) {
    rows.push(`Replacement,"${taxon.replacement}"`);
  }
  if (taxon.Definition) {
    rows.push(`Definition,"${taxon.Definition.replace(/"/g, '""')}"`);
  }
  
  if (taxon.Result) {
    rows.push(`Result Name,"${taxon.Result.name || ''}"`);
    rows.push(`Result Quantity,"${taxon.Result.Quantity?.name || ''}"`);
    if (taxon.Result.mLayer) {
      rows.push(`Result M-Layer Aspect,"${taxon.Result.mLayer.aspect}"`);
      rows.push(`Result M-Layer ID,"${taxon.Result.mLayer.id}"`);
    }
  }
  
  if (taxon.Parameter && taxon.Parameter.length > 0) {
    taxon.Parameter.forEach((param, idx) => {
      rows.push(`Parameter ${idx + 1} Name,"${param.name}"`);
      rows.push(`Parameter ${idx + 1} Optional,${param.optional}`);
      if (param.Definition) {
        rows.push(`Parameter ${idx + 1} Definition,"${param.Definition.replace(/"/g, '""')}"`);
      }
      if (param.Quantity) {
        rows.push(`Parameter ${idx + 1} Quantity,"${param.Quantity.name}"`);
      }
    });
  }
  
  if (taxon.Discipline && taxon.Discipline.length > 0) {
    rows.push(`Disciplines,"${taxon.Discipline.map(d => d.name).join('; ')}"`);
  }
  
  return rows.join('\n');
}

/**
 * Export taxon as Markdown
 */
export function exportAsMarkdown(taxon: Taxon): string {
  let md = `# ${taxon.name}\n\n`;
  
  if (taxon.deprecated) {
    md += `> **Deprecated**${taxon.replacement ? ` → Replaced by: \`${taxon.replacement}\`` : ''}\n\n`;
  }
  
  if (taxon.Definition) {
    md += `## Definition\n\n${taxon.Definition}\n\n`;
  }
  
  if (taxon.Result) {
    md += `## Result\n\n`;
    if (taxon.Result.name) {
      md += `- **Name:** ${taxon.Result.name}\n`;
    }
    if (taxon.Result.Quantity) {
      md += `- **Quantity:** \`${taxon.Result.Quantity.name}\`\n`;
    }
    if (taxon.Result.mLayer) {
      md += `- **M-Layer Aspect:** \`${taxon.Result.mLayer.aspect}\` (ID: \`${taxon.Result.mLayer.id}\`)\n`;
    }
    md += '\n';
  }
  
  if (taxon.Parameter && taxon.Parameter.length > 0) {
    md += `## Parameters\n\n`;
    taxon.Parameter.forEach(param => {
      md += `### ${param.name}\n\n`;
      md += `- **Optional:** ${param.optional ? 'Yes' : 'No'}\n`;
      if (param.Definition) {
        md += `- **Definition:** ${param.Definition}\n`;
      }
      if (param.Quantity) {
        md += `- **Quantity:** \`${param.Quantity.name}\`\n`;
      }
      if (param.mLayer) {
        md += `- **M-Layer:** \`${param.mLayer.aspect}\` (ID: \`${param.mLayer.id}\`)\n`;
      }
      md += '\n';
    });
  }
  
  if (taxon.Discipline && taxon.Discipline.length > 0) {
    md += `## Disciplines\n\n`;
    taxon.Discipline.forEach(disc => {
      md += `- ${disc.name}\n`;
    });
    md += '\n';
  }
  
  return md;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Export complete taxonomy as JSON
 */
export function exportTaxonomyAsJSON(taxons: Taxon[]): string {
  return JSON.stringify(taxons, null, 2);
}

/**
 * Export complete taxonomy as XML (MII format)
 */
export function exportTaxonomyAsXML(taxons: Taxon[]): string {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<mtc:Taxonomy xmlns:mtc="https://cls-schemas.s3.us-west-1.amazonaws.com/MII/MeasurandTaxonomyCatalog" xmlns:uom="https://cls-schemas.s3.us-west-1.amazonaws.com/MII/UOM_Database">\n';
  
  taxons.forEach(taxon => {
    // Get the taxon XML without the XML declaration
    const taxonXml = exportAsXML(taxon);
    // Remove XML declaration if present and indent each line
    const taxonContent = taxonXml.replace(/^<\?xml[^>]*>\n/, '').split('\n').map(line => '  ' + line).join('\n');
    xml += taxonContent + '\n';
  });
  
  xml += '</mtc:Taxonomy>';
  return xml;
}

/**
 * Export complete taxonomy as CSV
 */
export function exportTaxonomyAsCSV(taxons: Taxon[]): string {
  const rows: string[] = [];
  
  // Header row
  rows.push('Name,Deprecated,Replacement,Definition,Result Name,Result Quantity,Result M-Layer Aspect,Result M-Layer ID,Parameters,Disciplines');
  
  taxons.forEach(taxon => {
    const resultName = taxon.Result?.name || '';
    const resultQuantity = taxon.Result?.Quantity?.name || '';
    const resultAspect = taxon.Result?.mLayer?.aspect || '';
    const resultId = taxon.Result?.mLayer?.id || '';
    
    const parameters = taxon.Parameter && taxon.Parameter.length > 0
      ? taxon.Parameter.map(p => `${p.name}${p.optional ? ' (optional)' : ''}`).join('; ')
      : '';
    
    const disciplines = taxon.Discipline && taxon.Discipline.length > 0
      ? taxon.Discipline.map(d => d.name).join('; ')
      : '';
    
    const definition = taxon.Definition ? taxon.Definition.replace(/"/g, '""').replace(/\n/g, ' ') : '';
    
    rows.push(
      `"${taxon.name}",` +
      `${taxon.deprecated},` +
      `"${taxon.replacement || ''}",` +
      `"${definition}",` +
      `"${resultName}",` +
      `"${resultQuantity}",` +
      `"${resultAspect}",` +
      `"${resultId}",` +
      `"${parameters}",` +
      `"${disciplines}"`
    );
  });
  
  return rows.join('\n');
}

/**
 * Export complete taxonomy as Markdown
 */
export function exportTaxonomyAsMarkdown(taxons: Taxon[]): string {
  let md = '# Complete Measurand Taxonomy\n\n';
  md += `Total taxons: ${taxons.length}\n\n`;
  md += '---\n\n';
  
  taxons.forEach(taxon => {
    md += exportAsMarkdown(taxon);
    md += '\n---\n\n';
  });
  
  return md;
}

