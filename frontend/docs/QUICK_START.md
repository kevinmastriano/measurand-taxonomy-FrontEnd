# Quick Start Guide

## For Repository Maintainer

You've received a complete frontend application in the `frontend/` folder. Here's what to do:

### 1. Test It Locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### 2. Deploy to Vercel

**Easiest way:**
1. Push the repository (with frontend folder) to GitHub
2. Go to https://vercel.com
3. Click "Add New Project"
4. Import your GitHub repository
5. Set **Root Directory** to `frontend`
6. Click "Deploy"

**Done!** Your site will be live in minutes.

## What You Get

✅ **List View** - Browse all taxons with search  
✅ **Tree View** - Explore hierarchical structure  
✅ **License Page** - Complete licensing information  
✅ **Revision History** - Git commit history  

## File Structure

```
frontend/
├── app/              ← Pages (list, tree, license, history)
├── components/       ← React components
├── lib/             ← XML parser and utilities
├── package.json     ← Dependencies
└── README.md        ← Full documentation
```

## Requirements

- Node.js 18+ (for local development)
- Git repository (for history feature)
- Vercel account (for deployment - free tier available)

## Need Help?

- **Setup**: See `SETUP_INSTRUCTIONS.md`
- **Integration**: See `INTEGRATION_GUIDE.md`
- **Usage**: See `README.md`

## That's It!

The frontend is ready to use. Just install dependencies and deploy!

