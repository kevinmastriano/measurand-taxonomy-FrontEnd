import { CachedTaxonomyHistory } from './taxonomy-history-cache';
import path from 'path';
import fs from 'fs';

/**
 * Read the pre-built static history cache
 * This is used in production/serverless environments where Git is not available
 * Checks multiple locations:
 * 1. Synced data directory (data/taxonomy/) - from daily cron sync
 * 2. Public directory (public/) - from build-time generation
 */
export function getStaticHistoryCache(): CachedTaxonomyHistory | null {
  // Try multiple possible locations
  const possiblePaths = [
    // 1. Synced data directory (from cron sync)
    path.join(process.cwd(), 'data', 'taxonomy', 'taxonomy-history-cache.json'),
    // 2. Public directory (from build-time generation)
    path.join(process.cwd(), 'public', 'taxonomy-history.json'),
    // 3. Alternative synced location
    path.join(process.cwd(), '..', 'data', 'taxonomy', 'taxonomy-history-cache.json'),
  ];
  
  for (const historyPath of possiblePaths) {
    try {
      if (fs.existsSync(historyPath)) {
        const historyData = fs.readFileSync(historyPath, 'utf-8');
        const history = JSON.parse(historyData) as CachedTaxonomyHistory;
        
        console.log(`[StaticCache] Loaded static history cache from ${historyPath}: ${history.changes.length} changes from ${history.totalCommits} commits`);
        
        return history;
      }
    } catch (error) {
      // Try next path
      continue;
    }
  }
  
  console.warn('[StaticCache] History cache file not found in any location. Tried:', possiblePaths);
  return null;
}

/**
 * Check if we should use static cache (i.e., in production/serverless environment)
 */
export function shouldUseStaticCache(): boolean {
  // Use static cache if:
  // 1. VERCEL environment variable is set (we're on Vercel)
  // 2. NODE_ENV is production and we're not in a git repo
  
  if (process.env.VERCEL === '1') {
    return true;
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Check if .git directory exists
    try {
      const gitPath = path.join(process.cwd(), '..', '.git');
      return !fs.existsSync(gitPath);
    } catch {
      return true;
    }
  }
  
  return false;
}
