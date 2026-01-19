# Files Safe to Remove

Based on analysis of the frontend codebase, the following files/directories are **NOT used** by the frontend and can be safely removed:

## Directories to Remove

1. **`dev/`** - Development XML files (auv.xml, dimensional.xml, photometry_radiometry.xml)
   - Not referenced by frontend
   - Appears to be temporary development files

2. **`docs/`** - Sphinx documentation directory
   - Contains .rst files, conf.py, Makefile, etc.
   - Not used by frontend (frontend has its own docs/)
   - Used for generating ReadTheDocs documentation

3. **`examples/`** - Example XML files
   - Not referenced by frontend code
   - Only mentioned in documentation

4. **`scripts/`** (root level) - Python/shell processing scripts
   - combiner.sh, roundtrip.sh, splitter.py, validator.py
   - Used for processing/validating taxonomy, not needed for frontend

## Files to Remove

1. **`MeasurandTaxonomyCatalog.xsl`** - XSLT stylesheet
   - Only used for generating HTML from XML
   - Not needed by frontend (frontend uses React/Next.js)
   - Mentioned in docs but not actually used

2. **`MII_Taxonomy_Specification.md`** and **`MII_Taxonomy_Specification.pdf`**
   - Documentation files
   - Not needed for frontend runtime

3. **`Permissions.docx`** - Word document
   - Not used by frontend

4. **`requirements.txt`** - Python dependencies
   - Only needed for Python scripts/docs generation
   - Not needed for frontend (uses package.json)

5. **`UOM_Database.xml`** and **`UOM_Database.xsd`** - Units of Measure database
   - Separate from taxonomy
   - Referenced in XML namespaces but file itself not read by frontend

## Files to KEEP

✅ **`MeasurandTaxonomyCatalog.xml`** - Main taxonomy file (REQUIRED)
✅ **`MeasurandTaxonomyCatalog.xsd`** - Schema (useful for validation)
✅ **`MeasurandTaxonomyProperties.xml`** - Properties (synced via cron)
✅ **`source/`** - Individual taxon files (needed for Git history feature)
✅ **`frontend/`** - The entire frontend application
✅ **`LICENSE`** and **`COPYRIGHT`** - Legal files
✅ **`README.md`** - Repository documentation

## Summary

**Total files/directories that can be removed:**
- 4 directories (dev/, docs/, examples/, scripts/)
- 7 files (xsl, md, pdf, docx, txt, 2x UOM files)

**Estimated space savings:** ~5-10 MB (mostly from docs/ and source/ if not needed)

**Note:** The `source/` directory is needed for the Git history feature to work properly, as it contains individual taxon files that are analyzed at each commit.
