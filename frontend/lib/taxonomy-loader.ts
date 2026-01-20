import fs from 'fs';
import { parseTaxonomyXML } from './xml-parser';
import { findTaxonomyXML, getTaxonomySearchPaths } from './taxonomy-file-finder';
import { Taxon } from './types';

const GITHUB_XML_URL = 'https://raw.githubusercontent.com/NCSLI-MII/measurand-taxonomy/main/MeasurandTaxonomyCatalog.xml';

/**
 * Load taxonomy data from XML file
 * Automatically finds the XML file in multiple possible locations:
 * 1. Synced data directory (data/taxonomy/) - for production
 * 2. Parent directory (../) - for development
 * 3. Current directory - fallback
 * 4. GitHub (fallback if local file not found) - for Vercel before cron runs
 */
export async function loadTaxonomyData(): Promise<Taxon[]> {
  try {
    const xmlPath = findTaxonomyXML();
    let xmlContent: string;
    let source: string;
    
    if (xmlPath) {
      // Load from local file
      console.log('Loading XML from local file:', xmlPath);
      xmlContent = fs.readFileSync(xmlPath, 'utf-8');
      source = xmlPath;
    } else {
      // Fallback to GitHub if local file not found
      const searchPaths = getTaxonomySearchPaths();
      console.warn('XML file not found locally. Searched paths:', searchPaths);
      console.warn('Current working directory:', process.cwd());
      console.log('Fetching XML from GitHub as fallback:', GITHUB_XML_URL);
      
      try {
        const response = await fetch(GITHUB_XML_URL, {
          next: { revalidate: 3600 }, // Revalidate every hour
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch from GitHub: ${response.status} ${response.statusText}`);
        }
        
        xmlContent = await response.text();
        source = 'GitHub (NCSLI-MII/measurand-taxonomy)';
        console.log('Successfully fetched XML from GitHub');
      } catch (fetchError) {
        console.error('Error fetching from GitHub:', fetchError);
        throw new Error(`Taxonomy XML not found locally and failed to fetch from GitHub: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }
    }
    
    const taxons = await parseTaxonomyXML(xmlContent);
    console.log(`Successfully loaded ${taxons.length} taxons from ${source}`);
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
