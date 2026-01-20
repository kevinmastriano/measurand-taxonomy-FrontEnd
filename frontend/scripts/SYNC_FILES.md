# Taxonomy Sync - Files Targeted

## Primary Files Synced from NCSLI-MII Repository

The sync script downloads the following files from:
**https://github.com/NCSLI-MII/measurand-taxonomy**

### Required Files

1. **`MeasurandTaxonomyCatalog.xml`** ⭐ **PRIMARY**
   - **Location**: Repository root
   - **Purpose**: Main taxonomy catalog containing all taxon definitions
   - **Used by**: All frontend pages and API routes
   - **Size**: ~500 KB - 2 MB (grows with taxonomy)
   - **Update frequency**: Daily via cron

### Optional Files

2. **`MeasurandTaxonomyCatalog.xsd`**
   - **Location**: Repository root
   - **Purpose**: XML schema definition for validation
   - **Used by**: XML validation (if implemented)
   - **Size**: ~50-100 KB

3. **`MeasurandTaxonomyProperties.xml`**
   - **Location**: Repository root
   - **Purpose**: Taxonomy properties and metadata
   - **Used by**: Potentially for extended features
   - **Size**: ~10-50 KB

4. **`LICENSE`**
   - **Location**: Repository root
   - **Purpose**: Full Creative Commons Attribution-ShareAlike 4.0 International License text
   - **Used by**: License page (`/license`)
   - **Size**: ~20-30 KB

5. **`COPYRIGHT`**
   - **Location**: Repository root
   - **Purpose**: Copyright information for the taxonomy
   - **Used by**: License page (`/license`)
   - **Size**: ~1-5 KB

## Files NOT Synced (But Available)

### Source Directory (`source/`)
- **Location**: `source/*.xml`
- **Purpose**: Individual taxon files (used for Git history analysis)
- **Why not synced**: 
  - Large number of files (100+)
  - Only needed for Git history feature
  - Can be accessed via Git API if needed
  - Would significantly increase sync time and storage

### Other Files
- `MeasurandTaxonomyCatalog.xsl` - XSLT stylesheet (not needed for frontend)
- `UOM_Database.xml` - Units of measure (not part of taxonomy)
- Documentation files (`.md`, `.rst`) - Not needed for runtime
- Schema files (`.xsd`) - Only main catalog schema is synced

## Storage Structure

After sync, files are stored in:
```
frontend/
└── data/
    └── taxonomy/
        ├── MeasurandTaxonomyCatalog.xml           ← Main catalog
        ├── MeasurandTaxonomyCatalog.xsd           ← Schema
        ├── MeasurandTaxonomyProperties.xml        ← Properties
        ├── LICENSE                                ← License text
        ├── COPYRIGHT                              ← Copyright information
        ├── taxonomy-history-cache.json            ← Git history cache (generated)
        ├── .last-sync-commit                      ← Last commit SHA
        └── .sync-metadata.json                    ← Sync metadata
```

## History Cache Generation

The sync process also generates a **taxonomy history cache** that enables version history features:

- **Method**: Uses GitHub API (no Git repository required)
- **Process**: 
  1. Fetches commits that modified taxonomy files
  2. Downloads XML content at each commit
  3. Compares versions to detect changes
  4. Generates comprehensive change history
- **Output**: `taxonomy-history-cache.json` (~3-5 MB)
- **Limitations**: 
  - Processes up to 50 commits per sync (to avoid rate limits)
  - Only processes commits with main catalog (skips source-only commits)
  - Requires GitHub API access (60 req/hour unauthenticated, 5000/hour authenticated)

## Update Detection

The sync script:
1. Queries GitHub API: `GET /repos/NCSLI-MII/measurand-taxonomy/commits/main`
2. Compares latest commit SHA with `.last-sync-commit`
3. Only downloads if commit SHA differs
4. Saves new commit SHA after successful sync

## GitHub API Endpoints Used

- **Get latest commit**: `https://api.github.com/repos/NCSLI-MII/measurand-taxonomy/commits/main`
- **Download files**: `https://raw.githubusercontent.com/NCSLI-MII/measurand-taxonomy/main/{file}`

## Rate Limits

- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour (if GitHub token added)

The sync uses:
- 1 API call to check for updates
- 5 file downloads (if update needed)
- **Total**: ~6 requests per sync

With daily syncs, this is well within unauthenticated limits.
