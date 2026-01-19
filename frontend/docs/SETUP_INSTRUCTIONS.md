# Setup Instructions for Measurand Taxonomy Frontend

This document provides step-by-step instructions for setting up and deploying the frontend application.

## Quick Start

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Detailed Setup

### Step 1: Verify Prerequisites

Ensure you have the following installed:

- **Node.js** (version 18.x or higher)
  - Check version: `node --version`
  - Download from: https://nodejs.org/

- **npm** (comes with Node.js)
  - Check version: `npm --version`

- **Git** (for revision history feature)
  - Check version: `git --version`
  - Download from: https://git-scm.com/

### Step 2: Install Dependencies

From the `frontend` directory:

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Verify File Structure

Ensure the following files exist:

- `../MeasurandTaxonomyCatalog.xml` (parent directory)
- `../LICENSE` (parent directory)
- `../COPYRIGHT` (parent directory)

The application reads these files at runtime.

### Step 4: Run Development Server

```bash
npm run dev
```

You should see output like:
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
```

### Step 5: Test the Application

1. Open `http://localhost:3000` in your browser
2. Test each page:
   - **Home/List View**: Should show all taxons
   - **Tree View**: Should show hierarchical structure
   - **License**: Should display copyright and license information
   - **History**: Should show Git commit history (if in a Git repo)

## Building for Production

### Local Production Build

```bash
npm run build
npm start
```

### Static Export (for static hosting)

1. Modify `next.config.js`:
   ```javascript
   const nextConfig = {
     output: 'export',
   }
   ```

2. Build:
   ```bash
   npm run build
   ```

3. The static files will be in the `out/` directory

## Deployment to Vercel

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory:**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts:**
   - Set root directory: `frontend` (or `.` if already in frontend)
   - Confirm framework: Next.js
   - Confirm build settings (defaults are usually correct)

5. **Your site will be deployed!**
   - Vercel will provide a URL like: `https://your-project.vercel.app`

### Method 2: GitHub Integration

1. **Push repository to GitHub** (if not already done)

2. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click "Add New Project"

3. **Import Repository:**
   - Select your GitHub repository
   - Click "Import"

4. **Configure Project:**
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live!

### Method 3: Vercel Dashboard (Manual)

1. **Create a new project in Vercel Dashboard**

2. **Connect your Git repository**

3. **Configure:**
   - Root Directory: `frontend`
   - Framework: Next.js
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/.next`

4. **Deploy**

## Environment Variables

Currently, no environment variables are required. If you need to add any:

1. Create `.env.local` in the `frontend` directory
2. Add variables:
   ```
   NEXT_PUBLIC_EXAMPLE_VAR=value
   ```
3. Access in code: `process.env.NEXT_PUBLIC_EXAMPLE_VAR`

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: XML file not found

**Solution:**
- Ensure `MeasurandTaxonomyCatalog.xml` is in the parent directory
- Check file path: The app looks for `../MeasurandTaxonomyCatalog.xml`

### Issue: Git history not showing

**Solution:**
- Ensure you're in a Git repository
- Check Git is installed: `git --version`
- Verify Git is accessible from the command line

### Issue: Build fails on Vercel

**Solution:**
1. Check build logs in Vercel dashboard
2. Ensure root directory is set to `frontend`
3. Verify all dependencies are in `package.json`
4. Check Node.js version (should be 18.x or higher)

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

## Updating the Application

When the taxonomy XML is updated:

1. **Update the XML file** in the parent directory
2. **Restart the dev server** (if running)
3. **Rebuild** (if deployed):
   ```bash
   npm run build
   ```

For Vercel deployments, pushing changes to Git will automatically trigger a new deployment.

## File Structure Reference

```
measurand-taxonomy/
├── MeasurandTaxonomyCatalog.xml  ← Main taxonomy file
├── LICENSE                        ← License file
├── COPYRIGHT                      ← Copyright file
└── frontend/                      ← Frontend application
    ├── app/                      ← Next.js pages
    ├── components/               ← React components
    ├── lib/                      ← Utilities
    ├── package.json              ← Dependencies
    └── README.md                 ← This file
```

## Support

For issues or questions:
1. Check the main repository README
2. Review Git issues
3. Contact the NCSL International MII Committee

## Next Steps

After setup:
- Customize styling in `tailwind.config.ts`
- Add features in `components/` or `app/`
- Modify XML parsing logic in `lib/xml-parser.ts`
- Update navigation in `app/layout.tsx`

