# Build Scripts

## build-history-cache.js

This script generates a pre-built static cache of the taxonomy history for deployment to serverless environments like Vercel.

### Purpose

In serverless environments, the Git repository is not available at runtime. This script runs during the build process to:

1. Extract the complete Git commit history from the parent repository
2. Parse taxonomy changes from each commit
3. Generate a comprehensive change history
4. Save it as a static JSON file that can be served at runtime

### When It Runs

The script runs automatically during the build process via the `prebuild` npm script:

```bash
npm run build  # Automatically runs prebuild first
```

### Output

- **File**: `public/taxonomy-history.json`
- **Size**: Typically 100-500 KB depending on commit history
- **Format**: JSON with complete taxonomy change history

### Environment Detection

The script intelligently handles different environments:

- **Development (with Git)**: Generates full history from Git repository
- **Vercel/CI (no Git)**: Creates empty cache with appropriate message
- **Build failures**: Creates fallback empty cache to prevent build breakage

### Usage in API Routes

API routes automatically detect the environment and use the appropriate cache:

```typescript
import { shouldUseStaticCache, getStaticHistoryCache } from '@/lib/static-history-cache';

if (shouldUseStaticCache()) {
  // Production: Use pre-built static cache
  cachedHistory = getStaticHistoryCache();
} else {
  // Development: Use dynamic Git-based cache
  cachedHistory = await getCachedTaxonomyHistory();
}
```

### Cache Contents

The generated cache includes:

```json
{
  "changes": [],           // Array of taxonomy changes
  "totalCommits": 146,     // Total commits processed
  "commitsWithChanges": 37, // Commits with taxonomy changes
  "processingTimeMs": 5432, // Time taken to generate
  "cachedAt": 1705678900000, // Timestamp
  "oldestProcessedCommitHash": "abc123", // For incremental updates
  "initialCommit": {       // First commit info
    "commitHash": "127c583",
    "commitDate": "5/5/2023",
    "commitAuthor": "Author <email>",
    "commitMessage": "Initial commit",
    "taxonNames": ["Taxon1", "Taxon2", ...]
  }
}
```

### Troubleshooting

**Build fails with Git error:**
- Ensure you're in the `frontend` directory when building
- The script expects the Git repo to be in the parent directory (`..`)

**Cache is empty on Vercel:**
- This is expected if Git is not available during build
- The app will function but won't show history data

**Cache not updating:**
- Delete `public/taxonomy-history.json` and rebuild
- Or run: `npm run prebuild` manually
