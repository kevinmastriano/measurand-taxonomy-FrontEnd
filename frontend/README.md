# Measurand Taxonomy Frontend

A modern web interface for browsing and exploring the NCSL International Measurement Information Infrastructure (MII) Measurand Taxonomy Catalog.

## Features

- **List View**: Browse all taxons in a searchable, sortable list with detailed information
- **Tree View**: Explore the hierarchical structure of the taxonomy
- **License Information**: View complete licensing and copyright details
- **Revision History**: See Git commit history with taxonomy changes highlighted

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git (for revision history feature)

## Installation

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running Locally

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. From the `frontend` directory, run:
   ```bash
   vercel
   ```

3. Follow the prompts to configure your deployment

### Option 2: Deploy via GitHub Integration

1. Push the repository (including the `frontend` folder) to GitHub

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure the project:
   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

6. Click "Deploy"

### Option 3: Static Export (Alternative)

If you prefer a static export, modify `next.config.js`:

```javascript
const nextConfig = {
  output: 'export',
}
```

Then build and deploy:
```bash
npm run build
# The 'out' directory will contain static files ready for deployment
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # List view (home page)
│   ├── tree/              # Tree view page
│   ├── license/           # License page
│   └── history/           # Revision history page
├── components/            # React components
│   ├── TaxonomyListView.tsx
│   ├── TaxonomyTreeView.tsx
│   └── RevisionHistory.tsx
├── lib/                   # Utilities and types
│   ├── types.ts          # TypeScript type definitions
│   ├── xml-parser.ts     # XML parsing utilities
│   └── utils.ts          # General utilities
└── package.json          # Dependencies and scripts
```

## How It Works

### XML Parsing

The application reads `../MeasurandTaxonomyCatalog.xml` (relative to the frontend directory) and parses it using `fast-xml-parser`. The parsed data is transformed into TypeScript objects for easy manipulation and display.

### Git History

The revision history page uses Git commands to fetch commit history. This requires:
- The repository to be a Git repository
- Git to be installed and accessible from the command line
- The frontend folder to be inside the Git repository

### Data Flow

1. Server-side: Next.js reads the XML file and parses it
2. The parsed taxonomy data is passed to React components
3. Components render the data with search, filter, and expand/collapse functionality
4. Git history is fetched server-side and displayed client-side

## Troubleshooting

### XML File Not Found

If you see errors about the XML file not being found:
- Ensure `MeasurandTaxonomyCatalog.xml` exists in the parent directory
- Check that the path resolution is correct (the app looks for `../MeasurandTaxonomyCatalog.xml`)

### Git History Not Showing

If revision history is empty:
- Ensure you're running this inside a Git repository
- Check that Git is installed and accessible
- Verify the Git repository has commit history

### Build Errors

If you encounter build errors:
- Clear `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18.x or higher)

## Customization

### Styling

The application uses TailwindCSS. Modify `tailwind.config.ts` to customize the design system.

### Adding Features

- New pages: Add files to the `app/` directory
- New components: Add to `components/` directory
- Utilities: Add to `lib/` directory

## License

This frontend application is part of the Measurand Taxonomy project and is licensed under the same Creative Commons Attribution-ShareAlike 4.0 International License.

## Support

For issues related to:
- **Taxonomy data**: Contact NCSL International MII Committee
- **Frontend application**: Check the repository issues or create a new one


