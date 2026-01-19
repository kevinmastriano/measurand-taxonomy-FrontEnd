import { Suspense } from 'react';
import RevisionHistory from '@/components/RevisionHistory';
import { execSync } from 'child_process';
import { GitCommit } from '@/lib/types';
import path from 'path';

async function getGitHistory(): Promise<GitCommit[]> {
  try {
    // Get git log with detailed information
    const repoPath = path.join(process.cwd(), '..');
    const gitLog = execSync(
      'git log --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso --name-only',
      { cwd: repoPath, encoding: 'utf-8' }
    );

    const commits: GitCommit[] = [];
    const lines = gitLog.split('\n');
    let currentCommit: Partial<GitCommit> | null = null;
    const files: string[] = [];

    for (const line of lines) {
      if (line.includes('|')) {
        // Save previous commit if exists
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

        // Parse new commit
        const [hash, author, email, date, ...messageParts] = line.split('|');
        currentCommit = {
          hash: hash.substring(0, 7),
          author: `${author} <${email}>`,
          date: new Date(date).toLocaleDateString(),
          message: messageParts.join('|'),
        };
      } else if (line.trim() && currentCommit) {
        // This is a file name
        files.push(line.trim());
      }
    }

    // Don't forget the last commit
    if (currentCommit) {
      commits.push({
        hash: currentCommit.hash!,
        author: currentCommit.author!,
        date: currentCommit.date!,
        message: currentCommit.message!,
        files: files.length > 0 ? [...files] : undefined,
      });
    }

    return commits.slice(0, 100); // Limit to 100 most recent commits
  } catch (error) {
    console.error('Error getting git history:', error);
    return [];
  }
}

export default async function HistoryPage() {
  const commits = await getGitHistory();

  return (
    <div>
      <div className="mb-8 pb-8 border-b border-[#d0d7de] dark:border-[#30363d]">
        <h1 className="text-3xl font-semibold text-[#24292f] dark:text-[#e6edf3] mb-2">
          Revision History
        </h1>
        <p className="text-[#656d76] dark:text-[#8b949e] text-base">
          View the complete revision history of the Measurand Taxonomy Catalog, including all changes,
          authors, and approvals.
        </p>
      </div>
      <Suspense fallback={<div className="text-center py-8">Loading history...</div>}>
        <RevisionHistory commits={commits} />
      </Suspense>
    </div>
  );
}

