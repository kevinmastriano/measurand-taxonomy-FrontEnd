#!/usr/bin/env node

/**
 * Pre-build script to generate taxonomy history cache
 * This runs during the build process to create a static JSON file
 * that can be served in serverless environments (like Vercel)
 * 
 * Note: This script uses tsx to run TypeScript code directly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function buildCache() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Building Taxonomy History Cache (Pre-build Step)     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');

  const startTime = Date.now();

  try {
    // Check if we're in a git repository
    try {
      const repoPath = path.join(process.cwd(), '..');
      execSync('git rev-parse --git-dir', { 
        cwd: repoPath, 
        stdio: 'ignore' 
      });
      console.log('✓ Git repository detected');
    } catch (error) {
      console.error('✗ Not a git repository - history cache will be empty');
      console.error('  This is expected on Vercel during build.');
      console.error('  For local development, ensure you run this from the frontend directory.');
      
      // Create empty cache file
      const emptyCache = {
        changes: [],
        totalCommits: 0,
        commitsWithChanges: 0,
        processingTimeMs: 0,
        cachedAt: Date.now(),
        note: 'Built without Git repository access'
      };
      
      const outputPath = path.join(process.cwd(), 'public', 'taxonomy-history.json');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(emptyCache, null, 2));
      
      console.log('✓ Created empty history cache file');
      return;
    }

    console.log('Starting history cache generation...');
    console.log('This may take a few minutes for large repositories...');
    console.log('');

    // Run the TypeScript builder using tsx
    try {
      execSync('npx tsx scripts/build-history-cache-worker.ts', {
        cwd: process.cwd(),
        stdio: 'inherit',
        maxBuffer: 50 * 1024 * 1024,
      });
    } catch (error) {
      console.error('Error running cache builder worker:', error.message);
      throw error;
    }

    const duration = Date.now() - startTime;
    
    // Check if output file was created
    const outputPath = path.join(process.cwd(), 'public', 'taxonomy-history.json');
    if (fs.existsSync(outputPath)) {
      const history = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      const fileSizeKB = Math.round(fs.statSync(outputPath).size / 1024);

      console.log('');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  History Cache Built Successfully!                     ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`📊 Statistics:`);
      console.log(`   • Total commits processed:     ${history.totalCommits}`);
      console.log(`   • Commits with changes:        ${history.commitsWithChanges}`);
      console.log(`   • Total taxonomy changes:      ${history.changes.length}`);
      console.log(`   • Processing time:             ${history.processingTimeMs}ms`);
      console.log(`   • Total build time:            ${duration}ms`);
      console.log(`   • Cache file size:             ${fileSizeKB} KB`);
      console.log(`   • Output location:             public/taxonomy-history.json`);
      console.log('');

      if (history.initialCommit) {
        console.log(`📌 Initial Commit: ${history.initialCommit.commitHash}`);
        console.log(`   • Date:    ${history.initialCommit.commitDate}`);
        console.log(`   • Author:  ${history.initialCommit.commitAuthor}`);
        console.log(`   • Taxons:  ${history.initialCommit.taxonNames.length}`);
        console.log('');
      }
    } else {
      throw new Error('Cache file was not created');
    }

  } catch (error) {
    console.error('');
    console.error('╔════════════════════════════════════════════════════════╗');
    console.error('║  Error Building History Cache                         ║');
    console.error('╚════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error details:', error);
    console.error('');
    
    // Don't fail the build - create an empty cache instead
    console.log('Creating empty cache file as fallback...');
    const emptyCache = {
      changes: [],
      totalCommits: 0,
      commitsWithChanges: 0,
      processingTimeMs: 0,
      cachedAt: Date.now(),
      error: error.message,
      note: 'Cache generation failed - using empty cache'
    };
    
    const outputPath = path.join(process.cwd(), 'public', 'taxonomy-history.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(emptyCache, null, 2));
    
    console.log('✓ Created empty cache file - build will continue');
  }
}

// Run the cache builder
buildCache().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
