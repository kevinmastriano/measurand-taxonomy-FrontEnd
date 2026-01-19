import { execSync } from 'child_process';
import path from 'path';
import { parseTaxonomyXML } from './xml-parser';
import { Taxon, GitCommit, TaxonomyChange, TaxonChange, FieldChange } from './types';

// Cache for parsed taxons per commit hash
const taxonomyCache = new Map<string, Taxon[]>();
// Cache for full commit hashes
const fullHashCache = new Map<string, string>();

/**
 * Get the full commit hash from a short hash (with caching)
 */
function getFullCommitHash(shortHash: string, repoPath: string): string {
  if (fullHashCache.has(shortHash)) {
    return fullHashCache.get(shortHash)!;
  }
  
  try {
    const fullHash = execSync(`git rev-parse ${shortHash}`, {
      cwd: repoPath,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024, // 1MB buffer
    }).trim();
    fullHashCache.set(shortHash, fullHash);
    return fullHash;
  } catch (error) {
    console.error(`Error getting full hash for ${shortHash}:`, error);
    fullHashCache.set(shortHash, shortHash); // Cache the short hash itself to avoid retries
    return shortHash;
  }
}

/**
 * Check if a file exists at a specific commit (faster than extracting)
 */
function fileExistsAtCommit(commitHash: string, filePath: string, repoPath: string): boolean {
  try {
    const fullHash = getFullCommitHash(commitHash, repoPath);
    execSync(`git cat-file -e ${fullHash}:${filePath}`, {
      cwd: repoPath,
      encoding: 'utf-8',
      stdio: 'ignore', // Suppress output
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract XML content from Git at a specific commit
 */
function getFileAtCommit(commitHash: string, filePath: string, repoPath: string): string | null {
  try {
    const fullHash = getFullCommitHash(commitHash, repoPath);
    const content = execSync(`git show ${fullHash}:${filePath}`, {
      cwd: repoPath,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large XML files
    });
    return content;
  } catch (error) {
    // File might not exist at this commit
    return null;
  }
}

/**
 * Get source XML files at a specific commit (only called if main catalog doesn't exist)
 */
function getSourceFilesAtCommit(commitHash: string, repoPath: string): string[] {
  try {
    const fullHash = getFullCommitHash(commitHash, repoPath);
    // Get only source XML files (more efficient than getting all files)
    const files = execSync(`git ls-tree -r --name-only ${fullHash} source/`, {
      cwd: repoPath,
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024, // 1MB buffer
    })
      .split('\n')
      .filter((f) => {
        const fileName = f.trim();
        return fileName.startsWith('source/') && fileName.endsWith('.xml');
      });
    return files;
  } catch (error) {
    // source/ directory might not exist at this commit
    return [];
  }
}

/**
 * Get all taxons from a specific commit
 */
export async function getTaxonomyAtCommit(commitHash: string): Promise<Taxon[]> {
  // Check cache first
  if (taxonomyCache.has(commitHash)) {
    return taxonomyCache.get(commitHash)!;
  }

  const repoPath = path.join(process.cwd(), '..');
  const allTaxons: Taxon[] = [];

  try {
    // Check if main catalog exists first (fast check without extracting)
    if (fileExistsAtCommit(commitHash, 'MeasurandTaxonomyCatalog.xml', repoPath)) {
      // Main catalog exists - extract and parse it (most efficient path)
      const mainCatalog = getFileAtCommit(commitHash, 'MeasurandTaxonomyCatalog.xml', repoPath);
      if (mainCatalog) {
        const taxons = await parseTaxonomyXML(mainCatalog);
        allTaxons.push(...taxons);
      }
    } else {
      // Main catalog doesn't exist - try individual source files
      const sourceFiles = getSourceFilesAtCommit(commitHash, repoPath);

      // Process source files in parallel for better performance
      const filePromises = sourceFiles.map(async (file) => {
        const content = getFileAtCommit(commitHash, file, repoPath);
        if (!content) return [];

        try {
          // Individual source files might contain single Taxon elements
          // Try parsing as if wrapped in Taxonomy
          const wrappedContent = `<Taxonomy>${content}</Taxonomy>`;
          return await parseTaxonomyXML(wrappedContent);
        } catch (error) {
          // If that fails, try parsing directly
          try {
            return await parseTaxonomyXML(content);
          } catch (e) {
            console.error(`Error parsing ${file} at commit ${commitHash}:`, e);
            return [];
          }
        }
      });

      const fileResults = await Promise.all(filePromises);
      for (const taxons of fileResults) {
        allTaxons.push(...taxons);
      }
    }

    // Remove duplicates by name (in case we got taxons from multiple sources)
    const uniqueTaxons = new Map<string, Taxon>();
    for (const taxon of allTaxons) {
      if (taxon.name) {
        uniqueTaxons.set(taxon.name, taxon);
      }
    }

    const result = Array.from(uniqueTaxons.values());
    taxonomyCache.set(commitHash, result);
    return result;
  } catch (error) {
    console.error(`Error getting taxonomy at commit ${commitHash}:`, error);
    return [];
  }
}

/**
 * Deep comparison of two values
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Compare two taxons and identify field changes
 */
function compareTaxons(oldTaxon: Taxon, newTaxon: Taxon): FieldChange[] {
  const changes: FieldChange[] = [];

  // Compare deprecated status
  if (oldTaxon.deprecated !== newTaxon.deprecated) {
    changes.push({
      field: 'deprecated',
      oldValue: oldTaxon.deprecated,
      newValue: newTaxon.deprecated,
      changeType: 'modified',
    });
  }

  // Compare replacement
  if (oldTaxon.replacement !== newTaxon.replacement) {
    changes.push({
      field: 'replacement',
      oldValue: oldTaxon.replacement || '',
      newValue: newTaxon.replacement || '',
      changeType: 'modified',
    });
  }

  // Compare Definition
  if (oldTaxon.Definition !== newTaxon.Definition) {
    changes.push({
      field: 'Definition',
      oldValue: oldTaxon.Definition || '',
      newValue: newTaxon.Definition || '',
      changeType: 'modified',
    });
  }

  // Compare Result
  if (!deepEqual(oldTaxon.Result, newTaxon.Result)) {
    changes.push({
      field: 'Result',
      oldValue: oldTaxon.Result,
      newValue: newTaxon.Result,
      changeType: 'modified',
    });
  }

  // Compare Parameters
  const oldParams = oldTaxon.Parameter || [];
  const newParams = newTaxon.Parameter || [];
  const oldParamMap = new Map(oldParams.map((p) => [p.name, p]));
  const newParamMap = new Map(newParams.map((p) => [p.name, p]));

  // Find added parameters
  for (const [name, param] of newParamMap) {
    if (!oldParamMap.has(name)) {
      changes.push({
        field: `Parameter: ${name}`,
        oldValue: undefined,
        newValue: param,
        changeType: 'added',
      });
    } else if (!deepEqual(oldParamMap.get(name), param)) {
      changes.push({
        field: `Parameter: ${name}`,
        oldValue: oldParamMap.get(name),
        newValue: param,
        changeType: 'modified',
      });
    }
  }

  // Find removed parameters
  for (const [name, param] of oldParamMap) {
    if (!newParamMap.has(name)) {
      changes.push({
        field: `Parameter: ${name}`,
        oldValue: param,
        newValue: undefined,
        changeType: 'removed',
      });
    }
  }

  // Compare Disciplines
  const oldDisciplines = (oldTaxon.Discipline || []).map((d) => d.name).sort();
  const newDisciplines = (newTaxon.Discipline || []).map((d) => d.name).sort();
  if (!deepEqual(oldDisciplines, newDisciplines)) {
    changes.push({
      field: 'Disciplines',
      oldValue: oldDisciplines,
      newValue: newDisciplines,
      changeType: 'modified',
    });
  }

  // Compare ExternalReferences
  if (!deepEqual(oldTaxon.ExternalReferences, newTaxon.ExternalReferences)) {
    changes.push({
      field: 'ExternalReferences',
      oldValue: oldTaxon.ExternalReferences,
      newValue: newTaxon.ExternalReferences,
      changeType: 'modified',
    });
  }

  return changes;
}

/**
 * Compare two sets of taxons and identify changes
 */
export function diffTaxons(oldTaxons: Taxon[], newTaxons: Taxon[]): TaxonChange[] {
  const changes: TaxonChange[] = [];
  const oldTaxonMap = new Map(oldTaxons.map((t) => [t.name, t]));
  const newTaxonMap = new Map(newTaxons.map((t) => [t.name, t]));

  // Find added taxons
  for (const [name, taxon] of newTaxonMap) {
    if (!oldTaxonMap.has(name)) {
      changes.push({
        taxonName: name,
        changeType: 'added',
        newTaxon: taxon,
      });
    }
  }

  // Find removed taxons
  for (const [name, taxon] of oldTaxonMap) {
    if (!newTaxonMap.has(name)) {
      changes.push({
        taxonName: name,
        changeType: 'removed',
        oldTaxon: taxon,
      });
    }
  }

  // Find modified and deprecated taxons
  for (const [name, newTaxon] of newTaxonMap) {
    const oldTaxon = oldTaxonMap.get(name);
    if (oldTaxon) {
      const wasDeprecated = oldTaxon.deprecated;
      const isDeprecated = newTaxon.deprecated;

      // Check if deprecated status changed from false to true
      if (!wasDeprecated && isDeprecated) {
        changes.push({
          taxonName: name,
          changeType: 'deprecated',
          oldTaxon,
          newTaxon,
        });
      } else {
        // Check for other modifications
        const fieldChanges = compareTaxons(oldTaxon, newTaxon);
        if (fieldChanges.length > 0) {
          changes.push({
            taxonName: name,
            changeType: 'modified',
            oldTaxon,
            newTaxon,
            fieldChanges,
          });
        }
      }
    }
  }

  return changes;
}

/**
 * Check if a commit has taxonomy-related files
 */
function hasTaxonomyFiles(commit: GitCommit): boolean {
  if (!commit.files || commit.files.length === 0) return false;
  return commit.files.some(
    (f) =>
      f.includes('MeasurandTaxonomyCatalog.xml') ||
      (f.startsWith('source/') && f.endsWith('.xml')) ||
      f.includes('.xsd') ||
      f.includes('.xsl')
  );
}

/**
 * Filter out false positives from change history
 * Removes cases where a taxon was removed and immediately re-added (likely refactoring)
 */
function filterFalsePositives(history: TaxonomyChange[]): TaxonomyChange[] {
  // First pass: identify false positives (removed then re-added within 2 commits)
  const falsePositives = new Set<string>();
  const removedTaxons = new Map<string, { commitHash: string; commitIndex: number }>();
  
  for (let i = 0; i < history.length; i++) {
    const change = history[i];
    
    for (const taxonChange of change.changes) {
      if (taxonChange.changeType === 'removed') {
        // Track removed taxons
        removedTaxons.set(taxonChange.taxonName, {
          commitHash: change.commitHash,
          commitIndex: i,
        });
      } else if (taxonChange.changeType === 'added') {
        // Check if this taxon was recently removed
        const removal = removedTaxons.get(taxonChange.taxonName);
        if (removal && i - removal.commitIndex <= 2) {
          // Taxons removed and re-added within 2 commits are likely refactoring
          // Mark both as false positives
          falsePositives.add(`${removal.commitHash}:${taxonChange.taxonName}:removed`);
          falsePositives.add(`${change.commitHash}:${taxonChange.taxonName}:added`);
          console.log(`  Filtering out false positive: ${taxonChange.taxonName} was removed in ${removal.commitHash} and re-added in ${change.commitHash}`);
        }
        removedTaxons.delete(taxonChange.taxonName);
      }
    }
  }
  
  // Second pass: filter out false positives
  const filtered: TaxonomyChange[] = [];
  
  for (const change of history) {
    const filteredChanges = change.changes.filter(taxonChange => {
      const key = `${change.commitHash}:${taxonChange.taxonName}:${taxonChange.changeType}`;
      return !falsePositives.has(key);
    });
    
    // Only include commits that still have changes after filtering
    if (filteredChanges.length > 0) {
      filtered.push({
        ...change,
        changes: filteredChanges,
      });
    }
  }
  
  return filtered;
}

/**
 * Get taxonomy change history from Git commits
 * Only processes commits that actually changed taxonomy files for better performance
 */
export interface TaxonomyHistoryResult {
  changes: TaxonomyChange[];
  initialCommit?: {
    commitHash: string;
    commitDate: string;
    commitAuthor: string;
    commitMessage: string;
    taxonNames: Set<string>;
  };
}

export async function getTaxonomyHistory(commits: GitCommit[]): Promise<TaxonomyHistoryResult> {
  const history: TaxonomyChange[] = [];
  
  // Filter to only commits that changed taxonomy files
  const taxonomyCommits = commits.filter(hasTaxonomyFiles);
  
  console.log(`Processing ${taxonomyCommits.length} commits with taxonomy changes out of ${commits.length} total commits`);
  
  if (taxonomyCommits.length === 0) {
    return { changes: [] };
  }

  // Create a map of commit indices for quick lookup
  const commitIndexMap = new Map(commits.map((c, i) => [c.hash, i]));
  
  let previousTaxons: Taxon[] = [];
  let previousCommitIndex: number = -1;
  let initialCommit: TaxonomyHistoryResult['initialCommit'] | undefined = undefined;

  // Process commits sequentially (but optimize Git operations)
  for (let i = 0; i < taxonomyCommits.length; i++) {
    const commit = taxonomyCommits[i];
    const commitHash = commit.hash;
    const currentCommitIndex = commitIndexMap.get(commitHash) ?? i;

    try {
      console.log(`Processing commit ${i + 1}/${taxonomyCommits.length}: ${commitHash}`);
      
      // Pre-resolve hash for this commit (cached, so subsequent calls are fast)
      getFullCommitHash(commitHash, path.join(process.cwd(), '..'));
      
      // Get taxons at this commit
      const currentTaxons = await getTaxonomyAtCommit(commitHash);

      // If this isn't the first commit with taxonomy changes, we need to compare
      // with the previous commit's taxonomy state. If there's a gap, we need to
      // get the taxonomy from the commit just before this one.
      if (previousCommitIndex >= 0 && currentCommitIndex > previousCommitIndex + 1) {
        // There's a gap - get taxonomy from the commit just before this one
        const previousCommit = commits[currentCommitIndex - 1];
        if (previousCommit) {
          console.log(`  Gap detected, getting taxonomy from commit ${previousCommit.hash}`);
          // Pre-resolve hash for previous commit too
          getFullCommitHash(previousCommit.hash, path.join(process.cwd(), '..'));
          previousTaxons = await getTaxonomyAtCommit(previousCommit.hash);
        }
      }

      // Compare with previous commit's taxonomy state
      // Skip the first commit where previousTaxons is empty - that's just initial state, not real changes
      if (previousTaxons.length > 0 && currentTaxons.length > 0) {
        const changes = diffTaxons(previousTaxons, currentTaxons);

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
      } else if (previousTaxons.length === 0 && currentTaxons.length > 0) {
        // First commit with taxons - track it for later use when filtering specific taxons
        const taxonNames = new Set(currentTaxons.map(t => t.name));
        initialCommit = {
          commitHash: commit.hash,
          commitDate: commit.date,
          commitAuthor: commit.author,
          commitMessage: commit.message,
          taxonNames,
        };
        console.log(`  Tracking initial commit: ${currentTaxons.length} taxons in first commit`);
      }

      // Update previous taxons and index for next iteration
      previousTaxons = currentTaxons;
      previousCommitIndex = currentCommitIndex;
    } catch (error) {
      console.error(`Error processing commit ${commitHash}:`, error);
      // Continue with next commit, but keep previous taxons
    }
  }

  // Filter out false positives (removed then immediately re-added)
  console.log(`Filtering false positives from ${history.length} commits...`);
  const filteredHistory = filterFalsePositives(history);
  console.log(`After filtering: ${filteredHistory.length} commits remain`);

  return {
    changes: filteredHistory,
    initialCommit,
  };
}

