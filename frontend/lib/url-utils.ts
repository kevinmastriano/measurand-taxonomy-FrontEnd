/**
 * URL encoding/decoding utilities for taxon names and other special characters
 */

export function encodeTaxonName(name: string): string {
  // Taxon names contain dots, so we need to encode them properly
  return encodeURIComponent(name);
}

export function decodeTaxonName(encoded: string): string {
  return decodeURIComponent(encoded);
}

export function buildTaxonURL(taxonName: string, basePath = '/'): string {
  const params = new URLSearchParams();
  params.set('taxon', taxonName);
  return `${basePath}?${params.toString()}`;
}

export function buildCompareURL(taxonNames: string[], basePath = '/compare'): string {
  const params = new URLSearchParams();
  params.set('compare', taxonNames.join(','));
  return `${basePath}?${params.toString()}`;
}

export function parseTaxonFromURL(searchParams: URLSearchParams): string | null {
  return searchParams.get('taxon');
}

export function parseCompareFromURL(searchParams: URLSearchParams): string[] {
  const compareParam = searchParams.get('compare');
  if (!compareParam) return [];
  return compareParam.split(',').filter(Boolean);
}


