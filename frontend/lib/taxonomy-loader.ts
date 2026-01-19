import fs from 'fs';
import { parseTaxonomyXML } from './xml-parser';
import { findTaxonomyXML, getTaxonomySearchPaths } from './taxonomy-file-finder';
import { Taxon } from './types';

/**
 * Load taxonomy data from XML file
 * Automatically finds the XML file in multiple possible locations:
 * 1. Synced data directory (data/taxonomy/) - for production
 * 2. Parent directory (../) - for development
 * 3. Current directory - fallback
 */
export async function loadTaxonomyData(): Promise<Taxon[]> {
  try {
    const xmlPath = findTaxonomyXML();
    
    if (!xmlPath) {
      const searchPaths = getTaxonomySearchPaths();
      console.error('XML file not found. Searched paths:', searchPaths);
      console.error('Current working directory:', process.cwd());
      return [];
    }
    
    console.log('Loading XML from:', xmlPath);
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    const taxons = await parseTaxonomyXML(xmlContent);
    console.log(`Successfully loaded ${taxons.length} taxons`);
    return taxons;
  } catch (error) {
    console.error('Error loading taxonomy:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
}
