import fs from 'fs';
import path from 'path';

/**
 * Find the taxonomy XML file, checking multiple possible locations:
 * 1. Synced data directory (data/taxonomy/) - for production/cron synced files
 * 2. Parent directory (../) - for development when repo is cloned
 * 3. Current directory - fallback
 */
export function findTaxonomyXML(): string | null {
  const currentDir = process.cwd();
  
  // Possible paths in order of preference
  const possiblePaths = [
    // 1. Synced data directory (production)
    path.join(currentDir, 'data', 'taxonomy', 'MeasurandTaxonomyCatalog.xml'),
    // 2. Parent directory (development - when frontend is in a subdirectory)
    path.resolve(currentDir, '..', 'MeasurandTaxonomyCatalog.xml'),
    // 3. Current directory
    path.resolve(currentDir, 'MeasurandTaxonomyCatalog.xml'),
    // 4. Alternative parent path
    path.join(process.cwd(), '..', 'MeasurandTaxonomyCatalog.xml'),
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      return testPath;
    }
  }
  
  return null;
}

/**
 * Get all possible paths for debugging
 */
export function getTaxonomySearchPaths(): string[] {
  const currentDir = process.cwd();
  return [
    path.join(currentDir, 'data', 'taxonomy', 'MeasurandTaxonomyCatalog.xml'),
    path.resolve(currentDir, '..', 'MeasurandTaxonomyCatalog.xml'),
    path.resolve(currentDir, 'MeasurandTaxonomyCatalog.xml'),
    path.join(process.cwd(), '..', 'MeasurandTaxonomyCatalog.xml'),
  ];
}

/**
 * Check if synced data exists
 */
export function hasSyncedData(): boolean {
  const syncDir = path.join(process.cwd(), 'data', 'taxonomy');
  const xmlPath = path.join(syncDir, 'MeasurandTaxonomyCatalog.xml');
  return fs.existsSync(xmlPath);
}

/**
 * Get sync metadata if available
 */
export function getSyncMetadata(): { syncedAt: string; commitSHA: string; source: string } | null {
  try {
    const metadataPath = path.join(process.cwd(), 'data', 'taxonomy', '.sync-metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      return metadata;
    }
  } catch (error) {
    // Ignore errors reading metadata
  }
  return null;
}
