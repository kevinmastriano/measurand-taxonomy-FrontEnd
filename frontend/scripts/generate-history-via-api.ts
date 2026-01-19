#!/usr/bin/env tsx

/**
 * Generate Taxonomy History Cache using GitHub API
 * 
 * This script generates the taxonomy history cache without requiring Git access.
 * It uses the GitHub API to fetch commit history and file contents at each commit.
 * 
 * Designed to run as part of the daily sync process on Vercel.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { parseTaxonomyXML } from '../lib/xml-parser';
import { TaxonomyChange } from '../lib/types';

const REPO_OWNER = 'NCSLI-MII';
const REPO_NAME = 'measurand-taxonomy';
const BRANCH = 'main';
const GITHUB_API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// Output directory
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'taxonomy');
const HISTORY_CACHE_FILE = path.join(OUTPUT_DIR, 'taxonomy-history-cache.json');

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

interface GitHubCommitDetail {
  files: Array<{
    filename: string;
  }>;
}

interface GitHubContent {
  encoding: string;
  content: string;
}

// Rate limit tracking
let rateLimitRemaining = 60;
let rateLimitReset = 0;

// GitHub API helper with rate limit handling and retry logic
async function githubAPIRequest<T>(
  endpoint: string, 
  options: { headers?: Record<string, string> } = {},
  retries = 3
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const url = `${GITHUB_API_BASE}${endpoint}`;
    const token = process.env.GITHUB_TOKEN; // Optional GitHub token for higher rate limits
    
    // Check rate limit before making request
    // During builds (VERCEL), don't wait - fail fast so we can save partial cache
    const isBuild = process.env.VERCEL === '1' || process.env.CI === 'true';
    const now = Math.floor(Date.now() / 1000);
    if (rateLimitRemaining <= 5 && rateLimitReset > now) {
      if (isBuild) {
        // During build, reject immediately so we can save partial cache
        reject(new Error(`Rate limit exhausted (${rateLimitRemaining} remaining). Saving partial cache.`));
        return;
      }
      const waitTime = rateLimitReset - now + 1;
      console.log(`⚠ Rate limit low (${rateLimitRemaining} remaining). Waiting ${waitTime}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
    
    const makeRequest = (attempt: number) => {
      https.get(url, {
        headers: {
          'User-Agent': 'measurand-taxonomy-sync',
          'Accept': 'application/vnd.github.v3+json',
          ...(token && { 'Authorization': `token ${token}` }),
          ...options.headers,
        }
      }, (response) => {
        // Update rate limit tracking from headers
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];
        if (remaining) {
          const remainingStr = Array.isArray(remaining) ? remaining[0] : remaining;
          rateLimitRemaining = parseInt(remainingStr, 10);
        }
        if (reset) {
          const resetStr = Array.isArray(reset) ? reset[0] : reset;
          rateLimitReset = parseInt(resetStr, 10);
        }
        
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          if (response.statusCode === 200) {
            try {
              resolve(JSON.parse(data) as T);
            } catch (error) {
              reject(new Error('Failed to parse API response'));
            }
          } else if (response.statusCode === 404) {
            resolve(null as T);
          } else if (response.statusCode === 403 && data.includes('rate limit')) {
            // Rate limit exceeded
            const resetTime = rateLimitReset || Math.floor(Date.now() / 1000) + 3600;
            const waitTime = resetTime - Math.floor(Date.now() / 1000);
            
            // During builds, don't retry - fail fast so we can save partial cache
            const isBuildEnv = process.env.VERCEL === '1' || process.env.CI === 'true';
            if (isBuildEnv) {
              reject(new Error(`Rate limit exceeded during build. Saving partial cache. Set GITHUB_TOKEN for complete history.`));
              return;
            }
            
            if (attempt < retries && waitTime < 3600) {
              console.log(`⚠ Rate limit exceeded. Retrying in ${waitTime}s (attempt ${attempt + 1}/${retries})...`);
              setTimeout(() => {
                makeRequest(attempt + 1);
              }, waitTime * 1000);
            } else {
              reject(new Error(`GitHub API rate limit exceeded. Reset at ${new Date(resetTime * 1000).toISOString()}. ${token ? '' : 'Consider setting GITHUB_TOKEN environment variable for higher limits (5000/hour).'}`));
            }
          } else {
            const errorMsg = data ? JSON.parse(data).message || response.statusMessage : response.statusMessage;
            reject(new Error(`API request failed: ${response.statusCode} ${errorMsg}`));
          }
        });
      }).on('error', reject);
    };
    
    makeRequest(0);
  });
}

// Get all commits that modified taxonomy files
async function getTaxonomyCommits(): Promise<Array<{
  hash: string;
  fullHash: string;
  author: string;
  date: string;
  message: string;
  files: string[];
}>> {
  console.log('Fetching commits from GitHub API...');
  const hasToken = !!process.env.GITHUB_TOKEN;
  console.log(`Using ${hasToken ? 'authenticated' : 'unauthenticated'} API (${hasToken ? '5000' : '60'} requests/hour limit)`);
  
  const commits: Array<{
    hash: string;
    fullHash: string;
    author: string;
    date: string;
    message: string;
    files: string[];
  }> = [];
  let page = 1;
  const perPage = 100;
  const maxCommits = hasToken ? 100 : 30; // Lower limit for unauthenticated requests
  
  while (commits.length < maxCommits) {
    try {
      const response = await githubAPIRequest<GitHubCommit[]>(
        `/commits?sha=${BRANCH}&per_page=${perPage}&page=${page}`
      );
      
      if (!response || response.length === 0) {
        break;
      }
      
      // Filter commits that modified taxonomy files
      // First pass: check commit message and basic info (no extra API call)
      const potentialCommits = response.filter(commit => {
        const message = commit.commit.message.toLowerCase();
        return message.includes('taxonomy') || 
               message.includes('taxon') || 
               message.includes('xml') ||
               message.includes('catalog');
      });
      
      // If no obvious matches, check all commits (but limit detail fetches)
      const commitsToCheck = potentialCommits.length > 0 ? potentialCommits : response.slice(0, 20);
      
      for (const commit of commitsToCheck) {
        if (commits.length >= maxCommits) break;
        
        // Check rate limit before making another request
        if (rateLimitRemaining <= 10) {
          console.log(`⚠ Rate limit getting low (${rateLimitRemaining} remaining). Stopping at ${commits.length} commits.`);
          break;
        }
        
        // Get commit details to see which files were changed
        const commitDetail = await githubAPIRequest<GitHubCommitDetail>(`/commits/${commit.sha}`);
        
        if (commitDetail && commitDetail.files) {
          const hasTaxonomyFiles = commitDetail.files.some(file => 
            file.filename.includes('MeasurandTaxonomyCatalog.xml') ||
            (file.filename.startsWith('source/') && file.filename.endsWith('.xml')) ||
            file.filename.includes('.xsd') ||
            file.filename.includes('.xsl')
          );
          
          if (hasTaxonomyFiles) {
            commits.push({
              hash: commit.sha.substring(0, 7),
              fullHash: commit.sha,
              author: `${commit.commit.author.name} <${commit.commit.author.email}>`,
              date: formatDate(commit.commit.author.date),
              message: commit.commit.message.split('\n')[0],
              files: commitDetail.files.map(f => f.filename),
            });
            console.log(`  ✓ Found taxonomy commit: ${commit.sha.substring(0, 7)} (${commits.length}/${maxCommits})`);
          }
        }
        
        // Delay between requests to avoid rate limiting
        // Longer delay for unauthenticated requests
        await new Promise(resolve => setTimeout(resolve, hasToken ? 200 : 500));
      }
      
      if (response.length < perPage || commits.length >= maxCommits || rateLimitRemaining <= 10) {
        break;
      }
      
      page++;
      
      // Delay between pages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error('Error fetching commits:', error.message);
      if (error.message.includes('rate limit')) {
        console.error('⚠ Rate limit hit. Stopping commit fetch.');
      }
      break;
    }
  }
  
  console.log(`Found ${commits.length} commits with taxonomy changes`);
  return commits;
}

// Get file content at a specific commit using GitHub API
async function getFileAtCommit(filePath: string, commitSha: string): Promise<string | null> {
  try {
    const content = await githubAPIRequest<GitHubContent>(`/contents/${filePath}?ref=${commitSha}`);
    
    if (content && content.encoding === 'base64') {
      return Buffer.from(content.content, 'base64').toString('utf-8');
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Format date from ISO string to MM/DD/YYYY
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Compare two taxon arrays to find changes (simplified version)
function diffTaxons(oldTaxons: any[], newTaxons: any[]) {
  const changes: any[] = [];
  const oldMap = new Map(oldTaxons.map(t => [t.name, t]));
  const newMap = new Map(newTaxons.map(t => [t.name, t]));
  
  // Find added taxons
  for (const [name, taxon] of newMap) {
    if (!oldMap.has(name)) {
      changes.push({
        taxonName: name,
        changeType: 'added',
        newTaxon: taxon,
      });
    }
  }
  
  // Find removed taxons
  for (const [name, taxon] of oldMap) {
    if (!newMap.has(name)) {
      changes.push({
        taxonName: name,
        changeType: 'removed',
        oldTaxon: taxon,
      });
    }
  }
  
  // Find modified taxons (simplified - just check if they're different)
  for (const [name, newTaxon] of newMap) {
    if (oldMap.has(name)) {
      const oldTaxon = oldMap.get(name);
      if (JSON.stringify(oldTaxon) !== JSON.stringify(newTaxon)) {
        changes.push({
          taxonName: name,
          changeType: 'modified',
          oldTaxon,
          newTaxon,
        });
      }
    }
  }
  
  return changes;
}

// Generate history cache
async function generateHistoryCache() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Generating Taxonomy History Cache via GitHub API      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Warn if no GitHub token (lower rate limits)
  if (!process.env.GITHUB_TOKEN) {
    console.log('⚠ WARNING: No GITHUB_TOKEN set. Using unauthenticated API.');
    console.log('   Rate limit: 60 requests/hour (may be insufficient)');
    console.log('   To increase limit to 5000/hour, set GITHUB_TOKEN environment variable');
    console.log('   Create token at: https://github.com/settings/tokens');
    console.log('');
  }
  
  const startTime = Date.now();
  
  try {
    // Get commits
    const commits = await getTaxonomyCommits();
    
    if (commits.length === 0) {
      console.log('No taxonomy commits found');
      return { success: false, error: 'No commits found' };
    }
    
    // Reverse to process oldest first
    commits.reverse();
    
    const history: TaxonomyChange[] = [];
    let previousTaxons: any[] = [];
    let initialCommit: any = null;
    
    console.log(`Processing ${commits.length} commits...`);
    
    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      
      // Check rate limit before processing each commit
      const now = Math.floor(Date.now() / 1000);
      if (rateLimitRemaining <= 3) {
        console.log(`⚠ Rate limit exhausted (${rateLimitRemaining} remaining). Saving partial cache...`);
        console.log(`  Processed ${i}/${commits.length} commits before rate limit`);
        break; // Exit loop and save partial cache
      }
      
      console.log(`Processing commit ${i + 1}/${commits.length}: ${commit.hash} (${rateLimitRemaining} API calls remaining)`);
      
      try {
        // Get taxonomy XML at this commit
        let xmlContent = await getFileAtCommit('MeasurandTaxonomyCatalog.xml', commit.fullHash);
        
        // If main catalog doesn't exist, try source files
        if (!xmlContent) {
          // For now, skip commits without main catalog (would need to fetch multiple source files)
          console.log(`  Skipping - no main catalog at this commit`);
          continue;
        }
        
        const taxons = await parseTaxonomyXML(xmlContent);
        
        // Track initial commit
        if (i === 0) {
          initialCommit = {
            commitHash: commit.hash,
            commitDate: commit.date,
            commitAuthor: commit.author,
            commitMessage: commit.message,
            taxonNames: taxons.map(t => t.name),
          };
        }
        
        // Compare with previous commit
        if (previousTaxons.length > 0 && taxons.length > 0) {
          const changes = diffTaxons(previousTaxons, taxons);
          
          if (changes.length > 0) {
            history.push({
              commitHash: commit.hash,
              commitDate: commit.date,
              commitAuthor: commit.author,
              commitMessage: commit.message,
              changes,
            });
            console.log(`  Found ${changes.length} taxonomy changes`);
          }
        }
        
        previousTaxons = taxons;
        
        // Rate limiting delay (longer delay if rate limit is getting low)
        const delay = rateLimitRemaining < 10 ? 1000 : 200;
        await new Promise(resolve => setTimeout(resolve, delay));
        
      } catch (error: any) {
        // If rate limit error, break and save partial cache
        if (error.message.includes('rate limit')) {
          console.log(`⚠ Rate limit hit during commit processing. Saving partial cache...`);
          console.log(`  Processed ${i}/${commits.length} commits before rate limit`);
          break;
        }
        console.error(`  Error processing commit ${commit.hash}:`, error.message);
        continue;
      }
    }
    
    // Check if we hit rate limit (partial processing)
    const processedCommits = history.length + (initialCommit ? 1 : 0);
    const hitRateLimit = rateLimitRemaining <= 3 || processedCommits < commits.length;
    
    // Create cache object
    const cache = {
      changes: history.reverse(), // Reverse to show newest first
      totalCommits: commits.length,
      commitsWithChanges: history.length,
      processingTimeMs: Date.now() - startTime,
      cachedAt: Date.now(),
      oldestProcessedCommitHash: commits[0]?.hash,
      initialCommit,
      ...(hitRateLimit && {
        warning: `Partial cache: Rate limit reached. Processed ${processedCommits} of ${commits.length} commits. Set GITHUB_TOKEN for complete history.`,
        partial: true,
      }),
    };
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Save cache
    fs.writeFileSync(HISTORY_CACHE_FILE, JSON.stringify(cache, null, 2));
    
    const duration = Date.now() - startTime;
    const fileSizeKB = Math.round(fs.statSync(HISTORY_CACHE_FILE).size / 1024);
    
    console.log('');
    if (hitRateLimit) {
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  Partial History Cache Generated (Rate Limit Hit)     ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`⚠ Warning: Rate limit reached. Cache contains partial data.`);
      console.log(`   Set GITHUB_TOKEN environment variable for complete history.`);
      console.log('');
    } else {
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  History Cache Generated Successfully!                 ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
    }
    console.log(`📊 Statistics:`);
    console.log(`   • Total commits found:         ${commits.length}`);
    console.log(`   • Commits processed:           ${processedCommits}`);
    console.log(`   • Commits with changes:        ${history.length}`);
    console.log(`   • Total taxonomy changes:     ${cache.changes.reduce((sum, h) => sum + h.changes.length, 0)}`);
    console.log(`   • Processing time:             ${duration}ms`);
    console.log(`   • Cache file size:             ${fileSizeKB} KB`);
    console.log(`   • Output location:             ${HISTORY_CACHE_FILE}`);
    if (hitRateLimit) {
      console.log(`   • API calls remaining:         ${rateLimitRemaining}`);
    }
    console.log('');
    
    // Return success even for partial cache (build should continue)
    return { success: true, cache, partial: hitRateLimit };
    
  } catch (error: any) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════╗');
    
    // If we got some commits before failing, it's a partial success
    if (commits.length > 0) {
      console.error('║  History Cache Generation Partially Completed      ║');
      console.error('╚════════════════════════════════════════════════════════╝');
      console.error('');
      console.error(`⚠ Warning: ${error.message}`);
      console.error(`✓ Successfully processed ${commits.length} commits before error`);
      console.error('');
      console.error('This may be due to GitHub API rate limits.');
      console.error('To fix:');
      console.error('  1. Set GITHUB_TOKEN environment variable');
      console.error('  2. Create token at: https://github.com/settings/tokens');
      console.error('  3. Token only needs "public_repo" scope');
      console.error('');
      console.error('Saving partial cache...');
      
      // Save partial cache
      try {
        const partialCache = {
          changes: history.reverse(),
          totalCommits: commits.length,
          commitsWithChanges: history.length,
          processingTimeMs: Date.now() - startTime,
          cachedAt: Date.now(),
          oldestProcessedCommitHash: commits[0]?.hash,
          initialCommit,
          warning: `Partial cache: ${error.message}`,
        };
        
        if (!fs.existsSync(OUTPUT_DIR)) {
          fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }
        fs.writeFileSync(HISTORY_CACHE_FILE, JSON.stringify(partialCache, null, 2));
        console.error(`✓ Partial cache saved with ${commits.length} commits`);
      } catch (saveError) {
        console.error('Failed to save partial cache:', saveError);
      }
      
      return { success: false, error: error.message, partial: true, commitsProcessed: commits.length };
    } else {
      console.error('║  History Cache Generation Failed                     ║');
      console.error('╚════════════════════════════════════════════════════════╝');
      console.error('');
      console.error('Error:', error.message);
      console.error('');
      
      if (error.message.includes('rate limit')) {
        console.error('GitHub API rate limit exceeded.');
        console.error('Solutions:');
        console.error('  1. Set GITHUB_TOKEN environment variable for higher limits');
        console.error('  2. Wait for rate limit to reset (usually 1 hour)');
        console.error('  3. Reduce maxCommits limit in the script');
        console.error('');
      }
      
      return { success: false, error: error.message };
    }
  }
}

// Run if called directly
if (require.main === module) {
  generateHistoryCache()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { generateHistoryCache };
