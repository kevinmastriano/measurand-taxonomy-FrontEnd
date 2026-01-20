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

/**
 * Check if sync is currently in progress
 */
export function isSyncInProgress(): boolean {
  try {
    const lockPath = path.join(process.cwd(), 'data', 'taxonomy', '.sync-in-progress.json');
    if (!fs.existsSync(lockPath)) {
      return false;
    }
    const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
    const lockAge = Date.now() - lockData.startTime;
    // If lock is older than 5 minutes, consider it stale (sync probably crashed)
    if (lockAge > 5 * 60 * 1000) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get sync progress info if available
 */
export function getSyncProgress(): { startedAt: string; duration: number } | null {
  try {
    const lockPath = path.join(process.cwd(), 'data', 'taxonomy', '.sync-in-progress.json');
    if (fs.existsSync(lockPath)) {
      const lockData = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
      const duration = Date.now() - lockData.startTime;
      return {
        startedAt: lockData.startedAt,
        duration,
      };
    }
  } catch (error) {
    // Ignore errors reading lock file
  }
  return null;
}
