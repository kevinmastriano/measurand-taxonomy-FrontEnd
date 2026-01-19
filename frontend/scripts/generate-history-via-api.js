#!/usr/bin/env node

/**
 * Generate Taxonomy History Cache using GitHub API
 * 
 * This script generates the taxonomy history cache without requiring Git access.
 * It uses the GitHub API to fetch commit history and file contents at each commit.
 * 
 * Designed to run as part of the daily sync process on Vercel.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { parseTaxonomyXML } = require('../lib/xml-parser');

const REPO_OWNER = 'NCSLI-MII';
const REPO_NAME = 'measurand-taxonomy';
const BRANCH = 'main';
const GITHUB_API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// Output directory
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'taxonomy');
const HISTORY_CACHE_FILE = path.join(OUTPUT_DIR, 'taxonomy-history-cache.json');

// GitHub API helper
function githubAPIRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${GITHUB_API_BASE}${endpoint}`;
    const token = process.env.GITHUB_TOKEN; // Optional GitHub token for higher rate limits
    
    https.get(url, {
      headers: {
        'User-Agent': 'measurand-taxonomy-sync',
        'Accept': 'application/vnd.github.v3+json',
        ...(token && { 'Authorization': `token ${token}` }),
        ...options.headers,
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error('Failed to parse API response'));
          }
        } else if (response.statusCode === 404) {
          resolve(null);
        } else {
          reject(new Error(`API request failed: ${response.statusCode} ${response.statusMessage}`));
        }
      });
    }).on('error', reject);
  });
}

// Get all commits that modified taxonomy files
async function getTaxonomyCommits() {
  console.log('Fetching commits from GitHub API...');
  
  const commits = [];
  let page = 1;
  const perPage = 100;
  
  while (true) {
    try {
      const response = await githubAPIRequest(
        `/commits?sha=${BRANCH}&per_page=${perPage}&page=${page}`
      );
      
      if (!response || response.length === 0) {
        break;
      }
      
      // Filter commits that modified taxonomy files
      for (const commit of response) {
        // Get commit details to see which files were changed
        const commitDetail = await githubAPIRequest(`/commits/${commit.sha}`);
        
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
          }
        }
        
        // Rate limit: GitHub API allows 60 requests/hour unauthenticated, 5000/hour authenticated
        // We're making 2 requests per commit (list + detail), so limit to avoid hitting limits
        if (commits.length >= 50) {
          console.log(`Limiting to first 50 taxonomy commits to avoid rate limits`);
          break;
        }
      }
      
      if (commits.length >= 50 || response.length < perPage) {
        break;
      }
      
      page++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error('Error fetching commits:', error);
      break;
    }
  }
  
  console.log(`Found ${commits.length} commits with taxonomy changes`);
  return commits;
}

// Get file content at a specific commit using GitHub API
async function getFileAtCommit(filePath, commitSha) {
  try {
    const content = await githubAPIRequest(`/contents/${filePath}?ref=${commitSha}`);
    
    if (content && content.encoding === 'base64') {
      return Buffer.from(content.content, 'base64').toString('utf-8');
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Format date from ISO string to MM/DD/YYYY
function formatDate(isoString) {
  const date = new Date(isoString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

// Compare two taxon arrays to find changes
function diffTaxons(oldTaxons, newTaxons) {
  const changes = [];
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
    
    const history = [];
    let previousTaxons = [];
    let initialCommit = null;
    
    console.log(`Processing ${commits.length} commits...`);
    
    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      console.log(`Processing commit ${i + 1}/${commits.length}: ${commit.hash}`);
      
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
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`  Error processing commit ${commit.hash}:`, error.message);
        continue;
      }
    }
    
    // Create cache object
    const cache = {
      changes: history.reverse(), // Reverse to show newest first
      totalCommits: commits.length,
      commitsWithChanges: history.length,
      processingTimeMs: Date.now() - startTime,
      cachedAt: Date.now(),
      oldestProcessedCommitHash: commits[0]?.hash,
      initialCommit,
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
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  History Cache Generated Successfully!                 ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📊 Statistics:`);
    console.log(`   • Total commits processed:     ${commits.length}`);
    console.log(`   • Commits with changes:        ${history.length}`);
    console.log(`   • Total taxonomy changes:     ${cache.changes.reduce((sum, h) => sum + h.changes.length, 0)}`);
    console.log(`   • Processing time:             ${duration}ms`);
    console.log(`   • Cache file size:             ${fileSizeKB} KB`);
    console.log(`   • Output location:             ${HISTORY_CACHE_FILE}`);
    console.log('');
    
    return { success: true, cache };
    
  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════╗');
    console.error('║  History Cache Generation Failed                     ║');
    console.error('╚════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    return { success: false, error: error.message };
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

module.exports = { generateHistoryCache };
