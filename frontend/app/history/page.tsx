import { Suspense } from 'react';
import RevisionHistory from '@/components/RevisionHistory';
import { GitCommit } from '@/lib/types';

const REPO_OWNER = 'NCSLI-MII';
const REPO_NAME = 'measurand-taxonomy';
const BRANCH = 'main';
const GITHUB_API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

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
  files?: Array<{
    filename: string;
  }>;
}

// GitHub API helper function
async function githubAPIRequest<T>(endpoint: string): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const token = process.env.GITHUB_TOKEN;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'measurand-taxonomy-frontend',
      'Accept': 'application/vnd.github.v3+json',
      ...(token && { 'Authorization': `token ${token}` }),
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Set GITHUB_TOKEN for higher limits.');
    }
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getGitHistory(): Promise<GitCommit[]> {
  try {
    const commits: GitCommit[] = [];
    let page = 1;
    const perPage = 100;
    const maxCommits = 100; // Limit to 100 most recent commits

    // Fetch commits from GitHub API
    while (commits.length < maxCommits) {
      const response = await githubAPIRequest<GitHubCommit[]>(
        `/commits?sha=${BRANCH}&per_page=${perPage}&page=${page}`
      );

      if (!response || response.length === 0) {
        break;
      }

      // Process each commit
      for (const commit of response) {
        if (commits.length >= maxCommits) break;

        // Only fetch file details for the first 10 commits to avoid rate limits
        // File details are nice-to-have but not essential for the history view
        let files: string[] = [];
        if (commits.length < 10) {
          try {
            const commitDetail = await githubAPIRequest<{ files: Array<{ filename: string }> }>(
              `/commits/${commit.sha}`
            );
            if (commitDetail?.files) {
              files = commitDetail.files.map(f => f.filename);
            }
          } catch (error) {
            // If we can't get file details, continue without them
            // This is non-critical, so we don't log warnings
          }
        }

        // Format date from ISO string to MM/DD/YYYY
        const date = new Date(commit.commit.author.date);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
        });

        commits.push({
          hash: commit.sha.substring(0, 7),
          author: `${commit.commit.author.name} <${commit.commit.author.email}>`,
          date: formattedDate,
          message: commit.commit.message.split('\n')[0], // Use first line of commit message
          files: files.length > 0 ? files : undefined,
        });
      }

      if (response.length < perPage || commits.length >= maxCommits) {
        break;
      }

      page++;
    }

    return commits;
  } catch (error) {
    console.error('Error getting git history from GitHub API:', error);
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

