# Frontend Repository Cleanup Plan

This document identifies files that can be safely removed from the **measurand-taxonomy-FrontEnd** repository.

## Analysis

Since the frontend syncs taxonomy data from the NCSLI-MII repository via cron, many files in the root directory are **only needed for local development** and can be removed if you want a cleaner, frontend-only repository.

## Option 1: Minimal Frontend-Only Repository (Recommended)

Remove everything except the frontend application:

### Directories to Remove:
- ✅ **`dev/`** - Development XML files
- ✅ **`docs/`** - Sphinx documentation (frontend has its own docs/)
- ✅ **`examples/`** - Example files
- ✅ **`scripts/`** (root) - Python/shell scripts
- ✅ **`source/`** - Individual taxon files (synced from NCSLI-MII repo)

### Files to Remove:
- ✅ **`MeasurandTaxonomyCatalog.xml`** - Synced via cron to `frontend/data/taxonomy/`
- ✅ **`MeasurandTaxonomyCatalog.xsd`** - Synced via cron
- ✅ **`MeasurandTaxonomyCatalog.xsl`** - Not used by frontend
- ✅ **`MeasurandTaxonomyProperties.xml`** - Synced via cron
- ✅ **`UOM_Database.xml`** and **`UOM_Database.xsd`** - Not part of taxonomy
- ✅ **`MII_Taxonomy_Specification.md`** and **`.pdf`** - Documentation
- ✅ **`Permissions.docx`** - Word document
- ✅ **`requirements.txt`** - Python dependencies
- ✅ **`COPYRIGHT`** - Can be moved to frontend/docs/ if needed

### Files to KEEP:
- ✅ **`frontend/`** - The entire frontend application
- ✅ **`LICENSE`** - Repository license
- ✅ **`README.md`** - Repository documentation
- ✅ **`.gitignore`** - Git ignore rules

**Note:** This approach means local development would rely on the synced data in `frontend/data/taxonomy/` or you'd need to manually sync.

## Option 2: Keep Development Files (Current Setup)

Keep taxonomy files for local development but remove unnecessary ones:

### Still Remove:
- ✅ **`dev/`** - Development XML files
- ✅ **`docs/`** - Sphinx documentation
- ✅ **`examples/`** - Example files  
- ✅ **`scripts/`** (root) - Python/shell scripts
- ✅ **`MeasurandTaxonomyCatalog.xsl`** - XSLT (not used)
- ✅ **`MII_Taxonomy_Specification.md`** and **`.pdf`** - Documentation
- ✅ **`Permissions.docx`** - Word document
- ✅ **`requirements.txt`** - Python dependencies
- ✅ **`UOM_Database.xml`** and **`.xsd`** - Separate database

### Keep for Local Development:
- ✅ **`MeasurandTaxonomyCatalog.xml`** - For local dev
- ✅ **`MeasurandTaxonomyCatalog.xsd`** - For validation
- ✅ **`MeasurandTaxonomyProperties.xml`** - For local dev
- ✅ **`source/`** - For Git history feature in dev

## Recommendation

**Option 1 (Minimal)** is recommended because:
1. Frontend syncs data automatically via cron
2. Cleaner repository focused only on frontend code
3. Easier to maintain and understand
4. Local dev can use synced data or manual sync

**Trade-off:** Local development requires running sync first or cloning NCSLI-MII repo alongside.
