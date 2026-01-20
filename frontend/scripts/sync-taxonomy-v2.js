#!/usr/bin/env node

/**
 * Optimized Sync Taxonomy Data from NCSLI-MII Repository
 * 
 * Elite-level implementation with:
 * - Parallel downloads using Promise.allSettled
 * - Modern fetch API with streaming
 * - ETag-based conditional requests (only download if changed)
 * - Retry logic with exponential backoff
 * - Fire-and-forget pattern for background processing
 */

const fs = require('fs');
const path = require('path');

// Ensure fetch is available (Node.js 18+ has native fetch)
// For older Node versions, you'd need to install node-fetch
if (typeof fetch === 'undefined') {
  throw new Error('fetch API is not available. Node.js 18+ is required, or install node-fetch.');
}

const REPO_OWNER = 'NCSLI-MII';
const REPO_NAME = 'measurand-taxonomy';
const BRANCH = 'main';
const BASE_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`;

// Files to download (ordered by priority - critical files first)
const FILES_TO_SYNC = [
  'MeasurandTaxonomyCatalog.xml',      // Critical - must succeed
  'MeasurandTaxonomyCatalog.xsd',       // Important
  'MeasurandTaxonomyProperties.xml',    // Important
  'LICENSE',                            // Optional
  'COPYRIGHT',                          // Optional
];

// Directory to store synced files
const SYNC_DIR = path.join(process.cwd(), 'data', 'taxonomy');
const ETAGS_FILE = path.join(SYNC_DIR, '.etags.json');
const SYNC_LOCK_FILE = path.join(SYNC_DIR, '.sync-in-progress.json');

// Ensure sync directory exists
function ensureSyncDir() {
  if (!fs.existsSync(SYNC_DIR)) {
    fs.mkdirSync(SYNC_DIR, { recursive: true });
    console.log(`Created sync directory: ${SYNC_DIR}`);
  }
}

// Load ETags from disk
function loadETags() {
  try {
    if (fs.existsSync(ETAGS_FILE)) {
      return JSON.parse(fs.readFileSync(ETAGS_FILE, 'utf-8'));
    }
  } catch (error) {
    console.warn('Failed to load ETags:', error.message);
  }
  return {};
}

// Save ETags to disk
function saveETags(etags) {
  try {
    fs.writeFileSync(ETAGS_FILE, JSON.stringify(etags, null, 2));
  } catch (error) {
    console.warn('Failed to save ETags:', error.message);
  }
}

// Download a single file with modern fetch API, ETag support, and retry logic
async function downloadFile(filePath, outputPath, options = {}) {
  const {
    timeoutMs = 15000,
    maxRetries = 3,
    useETag = true,
    etag = null,
  } = options;

  const url = `${BASE_URL}/${filePath}`;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const headers = {
        'User-Agent': 'measurand-taxonomy-sync/2.0',
      };

      // Add ETag for conditional request (only download if changed)
      if (useETag && etag) {
        headers['If-None-Match'] = etag;
      }

      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // If not modified (304), skip download
      if (response.status === 304) {
        console.log(`✓ ${filePath} unchanged (ETag match)`);
        return { 
          success: true, 
          filePath, 
          skipped: true, 
          etag: response.headers.get('etag') || etag 
        };
      }

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠ File not found: ${filePath} (404)`);
          return { success: true, filePath, skipped: true, notFound: true };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Stream response to file
      const fileStream = fs.createWriteStream(outputPath);
      const reader = response.body.getReader();
      let totalBytes = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          fileStream.write(Buffer.from(value));
          totalBytes += value.length;
        }
        fileStream.end();

        // Wait for file to finish writing
        await new Promise((resolve, reject) => {
          fileStream.on('finish', resolve);
          fileStream.on('error', reject);
        });

        const etagHeader = response.headers.get('etag');
        const sizeKB = (totalBytes / 1024).toFixed(2);
        
        console.log(`✓ Downloaded: ${filePath} (${sizeKB} KB)`);
        
        return { 
          success: true, 
          filePath, 
          size: totalBytes,
          etag: etagHeader,
          attempt: attempt + 1
        };
      } catch (streamError) {
        // Clean up partial file
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        throw streamError;
      }
    } catch (error) {
      lastError = error;
      
      // Don't retry on abort (timeout) or 404
      if (error.name === 'AbortError' || error.message.includes('404')) {
        break;
      }

      // Exponential backoff: wait 1s, 2s, 4s before retry
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(`⚠ Retry ${attempt + 1}/${maxRetries} for ${filePath} after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  const errorMsg = lastError?.name === 'AbortError' 
    ? `Timeout after ${timeoutMs}ms`
    : lastError?.message || 'Unknown error';
  
  console.error(`✗ Failed to download ${filePath} after ${maxRetries + 1} attempts: ${errorMsg}`);
  return { success: false, filePath, error: errorMsg };
}

// Get latest commit SHA (optimized with fetch)
async function getLatestCommitSHA() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/${BRANCH}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'measurand-taxonomy-sync/2.0',
        'Accept': 'application/vnd.github.v3+json',
      },
      // Cache for 60 seconds to reduce API calls
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const commit = await response.json();
    return commit.sha;
  } catch (error) {
    throw new Error(`Failed to get commit SHA: ${error.message}`);
  }
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
    console.error('Error checking for updates:', error.message);
    // Continue with sync even if we can't check
    return true;
  }
}

// Write sync lock file
function writeSyncLock(startTime) {
  try {
    ensureSyncDir();
    const lockData = {
      startedAt: new Date().toISOString(),
      startTime,
      pid: process.pid,
    };
    fs.writeFileSync(SYNC_LOCK_FILE, JSON.stringify(lockData, null, 2));
  } catch (error) {
    console.warn('Failed to write sync lock file:', error.message);
  }
}

// Remove sync lock file
function removeSyncLock() {
  try {
    if (fs.existsSync(SYNC_LOCK_FILE)) {
      fs.unlinkSync(SYNC_LOCK_FILE);
    }
  } catch (error) {
    console.warn('Failed to remove sync lock file:', error.message);
  }
}

// Check if sync is in progress
function isSyncInProgress() {
  try {
    if (!fs.existsSync(SYNC_LOCK_FILE)) {
      return false;
    }
    const lockData = JSON.parse(fs.readFileSync(SYNC_LOCK_FILE, 'utf-8'));
    const lockAge = Date.now() - lockData.startTime;
    // If lock is older than 5 minutes, consider it stale (sync probably crashed)
    if (lockAge > 5 * 60 * 1000) {
      console.warn('Stale sync lock detected, removing...');
      removeSyncLock();
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Main sync function - optimized with parallel downloads
async function syncTaxonomy(options = {}) {
  const { skipHistory = false, files = null } = options;
  
  // Check if sync is already in progress
  if (isSyncInProgress()) {
    console.log('Sync already in progress, skipping...');
    return { success: false, error: 'Sync already in progress', alreadyRunning: true };
  }
  
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Syncing Taxonomy Data (Optimized v2)                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  
  const startTime = Date.now();
  writeSyncLock(startTime);
  
  try {
    ensureSyncDir();
    
    // Load existing ETags for conditional requests
    const etags = loadETags();
    
    // Determine files to download
    const filesToDownload = files && Array.isArray(files) ? files : FILES_TO_SYNC;
    
    // Only check for updates if syncing all files
    let updateNeeded = true;
    if (!files || files.length === FILES_TO_SYNC.length) {
      updateNeeded = await needsUpdate();
      if (updateNeeded === false) {
        console.log('No updates available. Exiting.');
        return { success: true, updated: false };
      }
    }
    
    // Validate file names
    const invalidFiles = filesToDownload.filter(f => !FILES_TO_SYNC.includes(f));
    if (invalidFiles.length > 0) {
      throw new Error(`Invalid file names: ${invalidFiles.join(', ')}`);
    }
    
    console.log(`Downloading ${filesToDownload.length} file(s) in parallel...`);
    
    // Download all files in parallel with Promise.allSettled
    // This is MUCH faster than sequential downloads
    const downloadPromises = filesToDownload.map(file => {
      const outputPath = path.join(SYNC_DIR, file);
      return downloadFile(file, outputPath, {
        timeoutMs: 15000, // 15 seconds per file (reduced since parallel)
        maxRetries: 2,    // Fewer retries since we have parallel redundancy
        useETag: true,
        etag: etags[file],
      });
    });
    
    const results = await Promise.allSettled(downloadPromises);
    
    // Process results
    const downloadedFiles = [];
    const skippedFiles = [];
    const failedFiles = [];
    const newETags = { ...etags };
    
    results.forEach((result, index) => {
      const file = filesToDownload[index];
      
      if (result.status === 'fulfilled') {
        const data = result.value;
        if (data.success) {
          if (data.skipped) {
            skippedFiles.push(file);
          } else {
            downloadedFiles.push(file);
            if (data.etag) {
              newETags[file] = data.etag;
            }
          }
        } else {
          failedFiles.push({ file, error: data.error });
        }
      } else {
        failedFiles.push({ file, error: result.reason?.message || 'Unknown error' });
      }
    });
    
    // Save updated ETags
    saveETags(newETags);
    
    // Report results
    if (downloadedFiles.length > 0) {
      console.log(`✓ Downloaded ${downloadedFiles.length} file(s)`);
    }
    if (skippedFiles.length > 0) {
      console.log(`⊘ Skipped ${skippedFiles.length} unchanged file(s)`);
    }
    if (failedFiles.length > 0) {
      console.warn(`✗ Failed ${failedFiles.length} file(s):`);
      failedFiles.forEach(({ file, error }) => {
        console.warn(`  - ${file}: ${error}`);
      });
      
      // Fail if critical files failed
      const criticalFiles = ['MeasurandTaxonomyCatalog.xml'];
      const criticalFailed = failedFiles.some(({ file }) => criticalFiles.includes(file));
      if (criticalFailed) {
        throw new Error(`Critical file download failed: ${failedFiles.find(({ file }) => criticalFiles.includes(file)).file}`);
      }
    }
    
    // Generate history cache (optional)
    if (!skipHistory) {
      console.log('');
      console.log('Generating taxonomy history cache...');
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
      }
    }
    
    // Update metadata only for full syncs
    if (!files || files.length === FILES_TO_SYNC.length) {
      if (typeof updateNeeded === 'string') {
        const commitFile = path.join(SYNC_DIR, '.last-sync-commit');
        fs.writeFileSync(commitFile, updateNeeded);
        console.log(`✓ Saved commit SHA: ${updateNeeded.substring(0, 7)}`);
      }
      
      const metadata = {
        syncedAt: new Date().toISOString(),
        commitSHA: typeof updateNeeded === 'string' ? updateNeeded : null,
        files: FILES_TO_SYNC,
        source: `https://github.com/${REPO_OWNER}/${REPO_NAME}`,
      };
      
      const metadataPath = path.join(SYNC_DIR, '.sync-metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    }
    
    const duration = Date.now() - startTime;
    
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  Sync Completed Successfully!                         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📊 Statistics:`);
    console.log(`   • Files downloaded:    ${downloadedFiles.length}`);
    console.log(`   • Files skipped:       ${skippedFiles.length}`);
    console.log(`   • Files failed:        ${failedFiles.length}`);
    console.log(`   • Sync duration:       ${duration}ms`);
    console.log(`   • Speed:               ${((downloadedFiles.length + skippedFiles.length) / (duration / 1000)).toFixed(2)} files/sec`);
    console.log('');
    
    // Remove lock file on success
    removeSyncLock();
    
    return { 
      success: true, 
      updated: downloadedFiles.length > 0,
      commitSHA: typeof updateNeeded === 'string' ? updateNeeded : null,
      downloaded: downloadedFiles.length,
      skipped: skippedFiles.length,
      failed: failedFiles.length,
    };
    
  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════╗');
    console.error('║  Sync Failed                                           ║');
    console.error('╚════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    // Remove lock file on error
    removeSyncLock();
    
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

module.exports = { syncTaxonomy, FILES_TO_SYNC };
