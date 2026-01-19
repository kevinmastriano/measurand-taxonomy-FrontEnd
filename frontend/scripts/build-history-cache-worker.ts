#!/usr/bin/env tsx

/**
 * Worker script for building taxonomy history cache
 * This is called by build-history-cache.js and does the actual work
 * 
 * Uses GitHub API to fetch history from NCSLI-MII/measurand-taxonomy repository
 */

import { generateHistoryCache } from './generate-history-via-api';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('Generating taxonomy history cache from NCSLI-MII/measurand-taxonomy...');
    
    // Generate history cache using GitHub API
    const result = await generateHistoryCache();

    if (!result.success || !result.cache) {
      console.error('Failed to generate history cache:', result.error);
      process.exit(1);
    }

    // Save to public directory as static JSON (for build-time cache)
    const outputPath = path.join(process.cwd(), 'public', 'taxonomy-history.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(result.cache, null, 2));

    console.log(`✓ Cache written to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error in cache builder worker:', error);
    process.exit(1);
  }
}

main();
