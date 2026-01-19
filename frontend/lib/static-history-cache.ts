import { CachedTaxonomyHistory } from './taxonomy-history-cache';
import path from 'path';
import fs from 'fs';

/**
 * Read the pre-built static history cache
 * This is used in production/serverless environments where Git is not available
 */
export function getStaticHistoryCache(): CachedTaxonomyHistory | null {
  try {
    const historyPath = path.join(process.cwd(), 'public', 'taxonomy-history.json');
    
    // Check if file exists
    if (!fs.existsSync(historyPath)) {
      console.warn('[StaticCache] History cache file not found at:', historyPath);
      return null;
    }
    
    const historyData = fs.readFileSync(historyPath, 'utf-8');
    const history = JSON.parse(historyData) as CachedTaxonomyHistory;
    
    console.log(`[StaticCache] Loaded static history cache: ${history.changes.length} changes from ${history.totalCommits} commits`);
    
    return history;
  } catch (error) {
    console.error('[StaticCache] Error reading static history cache:', error);
    return null;
  }
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
