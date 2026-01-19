import { NextResponse } from 'next/server';
import { TaxonomyChange, GitCommit } from '@/lib/types';
import { getTaxonomyHistory } from '@/lib/taxonomy-diff';
import { execSync } from 'child_process';
import path from 'path';

async function getGitHistory(): Promise<GitCommit[]> {
  try {
    const repoPath = path.join(process.cwd(), '..', '..');
    const gitLog = execSync(
      'git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso --name-only -100',
      { 
        cwd: repoPath, 
        encoding: 'utf-8',
        maxBuffer: 5 * 1024 * 1024,
      }
    );

    const commits: GitCommit[] = [];
    const lines = gitLog.split('\n');
    let currentCommit: Partial<GitCommit> | null = null;
    const files: string[] = [];

    for (const line of lines) {
      if (line.includes('|')) {
        if (currentCommit) {
          commits.push({
            hash: currentCommit.hash!,
            author: currentCommit.author!,
            date: currentCommit.date!,
            message: currentCommit.message!,
            files: files.length > 0 ? [...files] : undefined,
          });
          files.length = 0;
        }

        const [hash, author, email, date, ...messageParts] = line.split('|');
        currentCommit = {
          hash: hash.substring(0, 7),
          author: `${author} <${email}>`,
          date: new Date(date).toLocaleDateString(),
          message: messageParts.join('|'),
        };
      } else if (line.trim() && currentCommit) {
        files.push(line.trim());
      }
    }

    if (currentCommit) {
      commits.push({
        hash: currentCommit.hash!,
        author: currentCommit.author!,
        date: currentCommit.date!,
        message: currentCommit.message!,
        files: files.length > 0 ? [...files] : undefined,
      });
    }

    return commits.slice(0, 100);
  } catch (error) {
    console.error('Error getting git history:', error);
    return [];
  }
}

function filterDisciplineChanges(
  changes: TaxonomyChange[],
  disciplineName: string
): TaxonomyChange[] {
  return changes
    .map((change) => {
      const filteredChanges = change.changes.filter((taxonChange) => {
        // Check if this change affects the discipline
        const oldDisciplines = taxonChange.oldTaxon?.Discipline?.map((d) => d.name) || [];
        const newDisciplines = taxonChange.newTaxon?.Discipline?.map((d) => d.name) || [];
        
        // Include if:
        // 1. Taxon was added and has this discipline
        // 2. Taxon was removed and had this discipline
        // 3. Taxon was modified and discipline changed (added/removed this discipline)
        // 4. Taxon was deprecated and has/had this discipline
        
        if (taxonChange.changeType === 'added') {
          return newDisciplines.includes(disciplineName);
        }
        
        if (taxonChange.changeType === 'removed') {
          return oldDisciplines.includes(disciplineName);
        }
        
        if (taxonChange.changeType === 'deprecated') {
          return oldDisciplines.includes(disciplineName) || newDisciplines.includes(disciplineName);
        }
        
        if (taxonChange.changeType === 'modified') {
          const hadDiscipline = oldDisciplines.includes(disciplineName);
          const hasDiscipline = newDisciplines.includes(disciplineName);
          
          // Check if discipline was added, removed, or if taxon already had it
          if (hadDiscipline !== hasDiscipline) {
            // Discipline was added or removed
            return true;
          }
          
          // Check field changes for discipline changes
          if (taxonChange.fieldChanges) {
            const disciplineFieldChange = taxonChange.fieldChanges.find(
              (fc) => fc.field === 'Disciplines'
            );
            if (disciplineFieldChange) {
              const oldDiscs = disciplineFieldChange.oldValue || [];
              const newDiscs = disciplineFieldChange.newValue || [];
              return oldDiscs.includes(disciplineName) || newDiscs.includes(disciplineName);
            }
          }
          
          // If taxon had/has this discipline, include the change
          return hadDiscipline || hasDiscipline;
        }
        
        return false;
      });

      if (filteredChanges.length === 0) {
        return null;
      }

      return {
        ...change,
        changes: filteredChanges,
      };
    })
    .filter((change): change is TaxonomyChange => change !== null);
}

export async function GET(
  request: Request,
  { params }: { params: { discipline: string } }
) {
  try {
    const disciplineName = decodeURIComponent(params.discipline);
    
    const commits = await getGitHistory();
    
    if (commits.length === 0) {
      return NextResponse.json({ changes: [] });
    }

    const taxonomyHistory = await getTaxonomyHistory(commits);
    const disciplineHistory = filterDisciplineChanges(taxonomyHistory, disciplineName);

    return NextResponse.json({
      changes: disciplineHistory,
      discipline: disciplineName,
      totalCommits: commits.length,
      commitsWithChanges: disciplineHistory.length,
    });
  } catch (error) {
    console.error('Error getting discipline history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discipline history', changes: [] },
      { status: 500 }
    );
  }
}

