# Taxonomy Data Sync

This directory contains scripts and configuration for automatically syncing taxonomy data from the [NCSLI-MII measurand-taxonomy repository](https://github.com/NCSLI-MII/measurand-taxonomy) on a daily basis.

## Overview

The sync system downloads the latest taxonomy files from GitHub and stores them locally, allowing the frontend to stay up-to-date without being part of the same repository.

## Files Synced

The following files are downloaded from the NCSLI-MII repository:

1. **`MeasurandTaxonomyCatalog.xml`** - Main taxonomy catalog (required)
2. **`MeasurandTaxonomyCatalog.xsd`** - XML schema definition (optional, for validation)
3. **`MeasurandTaxonomyProperties.xml`** - Taxonomy properties (optional)

## Storage Location

Synced files are stored in: `frontend/data/taxonomy/`

## Manual Sync

To manually sync the taxonomy data:

```bash
cd frontend
npm run sync-taxonomy
```

## Automated Daily Sync (Vercel Cron)

### Setup

1. **Add Environment Variable** (optional, for security):
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `CRON_SECRET` = (generate a random secret string)

2. **Configure Cron Job in Vercel Dashboard**:
   - Go to your Vercel project → Settings → Cron Jobs
   - Click "Create Cron Job"
   - **Path**: `/api/sync-taxonomy`
   - **Schedule**: `0 2 * * *` (runs daily at 2 AM UTC)
   - **Authorization**: If you set `CRON_SECRET`, add header:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

### Alternative: Using vercel.json

The `vercel.json` file includes cron configuration, but Vercel may require you to set it up via the dashboard for the first time.

## How It Works

1. **Check for Updates**: The script queries GitHub API to get the latest commit SHA
2. **Compare**: Compares with last synced commit (stored in `.last-sync-commit`)
3. **Download**: If updates are available, downloads all files
4. **Store**: Saves files to `data/taxonomy/` directory
5. **Metadata**: Creates `.sync-metadata.json` with sync information

## Frontend Integration

The frontend automatically checks multiple locations for the taxonomy XML:

1. **Synced data** (`data/taxonomy/MeasurandTaxonomyCatalog.xml`) - Production
2. **Parent directory** (`../MeasurandTaxonomyCatalog.xml`) - Development
3. **Current directory** (`MeasurandTaxonomyCatalog.xml`) - Fallback

This allows the app to work in both scenarios:
- **Development**: When the taxonomy repo is cloned alongside the frontend
- **Production**: When files are synced via cron job

## Monitoring

### Check Sync Status

The sync endpoint returns:
```json
{
  "success": true,
  "updated": true,
  "commitSHA": "abc123...",
  "message": "Taxonomy data synced successfully",
  "timestamp": "2024-01-19T12:00:00Z"
}
```

### View Sync Metadata

Check `data/taxonomy/.sync-metadata.json`:
```json
{
  "syncedAt": "2024-01-19T12:00:00Z",
  "commitSHA": "abc123...",
  "files": ["MeasurandTaxonomyCatalog.xml", "..."],
  "source": "https://github.com/NCSLI-MII/measurand-taxonomy"
}
```

## Troubleshooting

### Sync Fails

1. Check Vercel function logs
2. Verify GitHub API rate limits (60 requests/hour for unauthenticated)
3. Ensure `data/taxonomy/` directory is writable

### Files Not Found

- The script gracefully handles missing files (404 errors)
- Only `MeasurandTaxonomyCatalog.xml` is strictly required

### Rate Limiting

If you hit GitHub API rate limits:
- Add a GitHub token to increase limits
- Or reduce sync frequency

## Security Considerations

- The sync endpoint is publicly accessible by default
- Consider adding authentication via `CRON_SECRET`
- Or restrict access via Vercel's IP allowlist

## Future Enhancements

- [ ] Add GitHub token support for higher rate limits
- [ ] Support syncing `source/` directory for Git history
- [ ] Add webhook support for real-time updates
- [ ] Add sync status dashboard page
