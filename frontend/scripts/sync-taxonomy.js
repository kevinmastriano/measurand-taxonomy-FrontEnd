#!/usr/bin/env node

/**
 * Sync Taxonomy Data from NCSLI-MII Repository
 * 
 * This script fetches the latest taxonomy files from GitHub and stores them locally.
 * Designed to run as a cron job (daily) to keep the frontend up-to-date.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'NCSLI-MII';
const REPO_NAME = 'measurand-taxonomy';
const BRANCH = 'main';
const BASE_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;

// Files to download
const FILES_TO_SYNC = [
  'MeasurandTaxonomyCatalog.xml',
  'MeasurandTaxonomyCatalog.xsd',
  'MeasurandTaxonomyProperties.xml',
  'LICENSE',
  'COPYRIGHT',
];

// Directory to store synced files
const SYNC_DIR = path.join(process.cwd(), 'data', 'taxonomy');

// Ensure sync directory exists
function ensureSyncDir() {
  if (!fs.existsSync(SYNC_DIR)) {
    fs.mkdirSync(SYNC_DIR, { recursive: true });
    console.log(`Created sync directory: ${SYNC_DIR}`);
  }
}

// Download a file from GitHub
function downloadFile(filePath, outputPath) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${filePath}`;
    console.log(`Downloading: ${url}`);
    
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${filePath}`);
          resolve();
        });
      } else if (response.statusCode === 404) {
        file.close();
        fs.unlinkSync(outputPath); // Delete empty file
        console.warn(`⚠ File not found: ${filePath} (404)`);
        resolve(); // Don't fail on missing files
      } else {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`Failed to download ${filePath}: ${response.statusCode} ${response.statusMessage}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(err);
    });
  });
}

// Get latest commit SHA to check if update is needed
async function getLatestCommitSHA() {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/${BRANCH}`;
    
    https.get(url, {
      headers: {
        'User-Agent': 'measurand-taxonomy-sync',
        'Accept': 'application/vnd.github.v3+json',
      }
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            const commit = JSON.parse(data);
            resolve(commit.sha);
          } catch (error) {
            reject(new Error('Failed to parse commit data'));
          }
        } else {
          reject(new Error(`Failed to get commit SHA: ${response.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Check if update is needed
async function needsUpdate() {
  const commitFile = path.join(SYNC_DIR, '.last-sync-commit');
  
  try {
    const latestSHA = await getLatestCommitSHA();
    
    if (fs.existsSync(commitFile)) {
      const lastSHA = fs.readFileSync(commitFile, 'utf-8').trim();
      if (lastSHA === latestSHA) {
        console.log(`No updates needed. Last sync: ${lastSHA.substring(0, 7)}`);
        return false;
      }
      console.log(`Update available: ${lastSHA.substring(0, 7)} → ${latestSHA.substring(0, 7)}`);
    } else {
      console.log(`First sync. Latest commit: ${latestSHA.substring(0, 7)}`);
    }
    
    return latestSHA;
  } catch (error) {
    console.error('Error checking for updates:', error);
    // Continue with sync even if we can't check
    return true;
  }
}

// Main sync function
async function syncTaxonomy(options = {}) {
  const { skipHistory = false } = options;
  
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Syncing Taxonomy Data from NCSLI-MII Repository      ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // Check if update is needed
    const updateNeeded = await needsUpdate();
    if (updateNeeded === false) {
      console.log('No updates available. Exiting.');
      return { success: true, updated: false };
    }
    
    // Ensure sync directory exists
    ensureSyncDir();
    
    // Download all files
    console.log('Downloading taxonomy files...');
    const downloadPromises = FILES_TO_SYNC.map(file => {
      const outputPath = path.join(SYNC_DIR, file);
      return downloadFile(file, outputPath);
    });
    
    await Promise.all(downloadPromises);
    console.log(`✓ Downloaded ${FILES_TO_SYNC.length} files`);
    
    // Generate history cache using GitHub API (optional, can be slow)
    if (!skipHistory) {
      console.log('');
      console.log('Generating taxonomy history cache (this may take a few minutes)...');
      try {
        const { execSync } = require('child_process');
        execSync('npx tsx scripts/generate-history-via-api.ts', {
          cwd: process.cwd(),
          stdio: 'inherit',
          maxBuffer: 50 * 1024 * 1024,
        });
        console.log('✓ History cache generated');
      } catch (error) {
        console.warn('⚠ History cache generation failed (non-critical):', error.message);
        // Don't fail the sync if history generation fails
      }
    } else {
      console.log('');
      console.log('⚠ Skipping history cache generation (use skipHistory=false to enable)');
    }
    
    // Save commit SHA if we got it
    if (typeof updateNeeded === 'string') {
      const commitFile = path.join(SYNC_DIR, '.last-sync-commit');
      fs.writeFileSync(commitFile, updateNeeded);
      console.log(`✓ Saved commit SHA: ${updateNeeded.substring(0, 7)}`);
    }
    
    // Save sync metadata
    const metadata = {
      syncedAt: new Date().toISOString(),
      commitSHA: typeof updateNeeded === 'string' ? updateNeeded : null,
      files: FILES_TO_SYNC,
      source: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
    };
    
    const metadataPath = path.join(SYNC_DIR, '.sync-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    const duration = Date.now() - startTime;
    
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  Sync Completed Successfully!                         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📊 Statistics:`);
    console.log(`   • Files synced:        ${FILES_TO_SYNC.length}`);
    console.log(`   • Sync duration:       ${duration}ms`);
    console.log(`   • Output directory:    ${SYNC_DIR}`);
    console.log('');
    
    return { success: true, updated: true, commitSHA: typeof updateNeeded === 'string' ? updateNeeded : null };
    
  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════╗');
    console.error('║  Sync Failed                                           ║');
    console.error('╚════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    return { success: false, error: error.message };
  }
}

// Run if called directly
if (require.main === module) {
  syncTaxonomy()
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { syncTaxonomy };
