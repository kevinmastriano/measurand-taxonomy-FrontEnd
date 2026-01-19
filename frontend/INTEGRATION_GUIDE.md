# Frontend Integration Guide

This document explains how to integrate the frontend application into the main measurand-taxonomy repository.

## What Was Created

A complete Next.js frontend application has been created in the `frontend/` directory. This application provides:

1. **List View**: Searchable, sortable list of all taxons
2. **Tree View**: Hierarchical tree visualization of the taxonomy
3. **License Page**: Complete licensing and copyright information
4. **Revision History**: Git commit history with taxonomy changes highlighted

## Directory Structure

```
measurand-taxonomy/
├── frontend/                    ← New frontend application
│   ├── app/                    ← Next.js pages
│   │   ├── layout.tsx         ← Main layout with navigation
│   │   ├── page.tsx           ← List view (home)
│   │   ├── tree/              ← Tree view page
│   │   ├── license/           ← License page
│   │   └── history/           ← Git history page
│   ├── components/            ← React components
│   ├── lib/                   ← Utilities and parsers
│   ├── package.json           ← Dependencies
│   ├── README.md              ← User documentation
│   ├── SETUP_INSTRUCTIONS.md  ← Detailed setup guide
│   └── vercel.json            ← Vercel deployment config
├── MeasurandTaxonomyCatalog.xml ← Required by frontend
├── LICENSE                     ← Required by frontend
└── COPYRIGHT                   ← Required by frontend
```

## Integration Steps

### 1. Add the Frontend Folder

Simply copy the entire `frontend/` folder into your repository root. The folder is self-contained and doesn't modify any existing files.

### 2. Update .gitignore (Optional)

You may want to add frontend-specific ignores to your `.gitignore`:

```gitignore
# Frontend
frontend/node_modules/
frontend/.next/
frontend/out/
frontend/.vercel/
```

### 3. Test Locally

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser

### 4. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Push the repository (with frontend folder) to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
6. Click "Deploy"

#### Option B: Deploy via CLI

```bash
cd frontend
npm i -g vercel
vercel
```

## How It Works

### XML Reading

The frontend reads `MeasurandTaxonomyCatalog.xml` from the parent directory (`../MeasurandTaxonomyCatalog.xml`). This means:

- The XML file must be in the repository root
- The frontend folder must be in the repository root
- When deployed, the XML file is bundled with the application

### Git History

The revision history feature uses Git commands to fetch commit history. This works:

- **Locally**: Uses `execSync` to run Git commands
- **On Vercel**: May require Git to be available in the build environment

If Git history doesn't work on Vercel, you can:
1. Disable the history page
2. Use a Git API instead
3. Pre-generate history data

## File Dependencies

The frontend requires these files from the parent directory:

- `MeasurandTaxonomyCatalog.xml` - Main taxonomy data
- `LICENSE` - License text
- `COPYRIGHT` - Copyright information

These files are read at build time and included in the application bundle.

## Customization

### Changing Colors/Styling

Edit `frontend/tailwind.config.ts` to customize the design system.

### Adding Pages

Add new files to `frontend/app/` directory. Next.js will automatically create routes.

### Modifying Navigation

Edit `frontend/app/layout.tsx` to add/remove navigation items.

### Updating XML Parser

Modify `frontend/lib/xml-parser.ts` if the XML schema changes.

## Maintenance

### When Taxonomy XML Updates

1. Update `MeasurandTaxonomyCatalog.xml` in the repository root
2. The frontend will automatically pick up changes on next build/deployment
3. For local development, restart the dev server

### When Adding New Dependencies

1. Add to `frontend/package.json`
2. Run `npm install` in the frontend directory
3. Commit `package.json` and `package-lock.json`

### Updating Next.js

1. Update version in `frontend/package.json`
2. Run `npm install`
3. Test thoroughly
4. Check Next.js migration guide for breaking changes

## Troubleshooting

### Build Fails

- Check Node.js version (requires 18.x+)
- Clear `.next` directory: `rm -rf frontend/.next`
- Reinstall dependencies: `rm -rf frontend/node_modules && npm install`

### XML Not Found

- Ensure `MeasurandTaxonomyCatalog.xml` is in repository root
- Check file path in `frontend/app/page.tsx` (should be `../MeasurandTaxonomyCatalog.xml`)

### Git History Not Working

- Ensure repository is a Git repository
- Check Git is installed and accessible
- On Vercel, Git may not be available - consider alternative approach

## Next Steps

1. **Test locally** to ensure everything works
2. **Deploy to Vercel** for public access
3. **Customize** styling and content as needed
4. **Update documentation** if you make significant changes

## Support

For questions or issues:
- Check `frontend/README.md` for user documentation
- Check `frontend/SETUP_INSTRUCTIONS.md` for detailed setup
- Review Next.js documentation: https://nextjs.org/docs

## Notes

- The frontend is completely self-contained in the `frontend/` directory
- No changes are made to existing repository files
- The application can be removed by simply deleting the `frontend/` folder
- All dependencies are listed in `frontend/package.json`

