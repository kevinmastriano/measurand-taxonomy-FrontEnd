#!/usr/bin/env tsx

/**
 * Worker script for building taxonomy history cache
 * This is called by build-history-cache.js and does the actual work
 */

import { refreshTaxonomyHistoryCache } from '../lib/taxonomy-history-cache';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  try {
    console.log('Generating taxonomy history cache...');
    
    // Force a full refresh of the cache
    const history = await refreshTaxonomyHistoryCache(true);

    if (!history) {
      console.error('Failed to generate history cache');
      process.exit(1);
    }

    // Save to public directory as static JSON
    const outputPath = path.join(process.cwd(), 'public', 'taxonomy-history.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(history, null, 2));

    console.log(`✓ Cache written to: ${outputPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Error in cache builder worker:', error);
    process.exit(1);
  }
}

main();
