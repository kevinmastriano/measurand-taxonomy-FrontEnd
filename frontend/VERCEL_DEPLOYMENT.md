# Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

✅ **Already Done!** Your repository is now ready with:
- Pre-built cache system
- Environment auto-detection
- Vercel-compatible configuration

### 2. Deploy to Vercel

#### Option A: Automatic Deployment (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import `kevinmastriano/measurand-taxonomy-FrontEnd`
5. Configure project:
   ```
   Framework Preset: Next.js
   Root Directory: . (or leave empty)
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```
6. Click "Deploy"

#### Option B: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

### 3. Monitor Build

The build process will:
1. Run `npm install`
2. Run `npm run prebuild` (generates history cache - ~30 seconds)
3. Run `next build` (builds Next.js app - ~30 seconds)
4. Deploy to Vercel edge network

**Total build time**: ~1-2 minutes

### 4. Verify Deployment

After deployment, test these endpoints:

```bash
# Replace with your Vercel URL
VERCEL_URL="https://your-app.vercel.app"

# Test main history API
curl $VERCEL_URL/api/history/taxonomy | jq '.isStatic'
# Should return: true

# Test taxon history
curl "$VERCEL_URL/api/taxons/Measure.Acceleration/history" | jq '.isStatic'
# Should return: true

# Test homepage
curl $VERCEL_URL
# Should return HTML
```

## 📋 Expected Build Output

You should see this in the Vercel build logs:

```
╔════════════════════════════════════════════════════════╗
║  Building Taxonomy History Cache (Pre-build Step)     ║
╚════════════════════════════════════════════════════════╝

✓ Git repository detected (or: ✗ Not a git repository)
Starting history cache generation...

[Processing commits...]

╔════════════════════════════════════════════════════════╗
║  History Cache Built Successfully!                     ║
╚════════════════════════════════════════════════════════╝

📊 Statistics:
   • Total commits processed:     148
   • Commits with changes:        37
   • Total taxonomy changes:      6
   • Processing time:             31904ms
   • Cache file size:             3057 KB
```

## 🔍 Troubleshooting

### Build Fails

**Issue**: Build fails during prebuild step

**Solutions**:
1. Check build logs for specific error
2. Ensure `tsx` is installed (`npm install`)
3. The script will create empty cache on failure (build continues)

### Empty History in Production

**Issue**: History API returns empty array

**Expected Behavior**: This is normal if Git wasn't available during build

**Fix**: 
- Check `isStatic: true` in API response
- If Git was unavailable, consider deploying from local build

### API Errors

**Issue**: 500 errors from history endpoints

**Debug**:
1. Check Vercel function logs
2. Verify `public/taxonomy-history.json` exists in deployment
3. Test API routes in preview deployment first

## ⚙️ Configuration

### Environment Variables (Optional)

No environment variables are required! The system auto-detects everything.

But you can add these for debugging:

```
NODE_ENV=production  # Auto-set by Vercel
VERCEL=1            # Auto-set by Vercel
```

### Build Settings in Vercel Dashboard

```yaml
Framework: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
Root Directory: .
Node Version: 18.x (or latest LTS)
```

## 🔄 Updating Your Deployment

### Automatic Updates (Recommended)

1. **Make changes** to your code
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Vercel redeploys automatically** (if you enabled GitHub integration)

### Manual Redeploy

In Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Click "Redeploy" on latest deployment

Or via CLI:
```bash
cd frontend
vercel --prod
```

## 📊 Post-Deployment Checklist

- [ ] Deployment succeeded (check Vercel dashboard)
- [ ] Homepage loads (`https://your-app.vercel.app`)
- [ ] History API works (`/api/history/taxonomy`)
- [ ] Taxon history works (`/api/taxons/[name]/history`)
- [ ] Response includes `"isStatic": true`
- [ ] Response times are fast (<100ms)
- [ ] No console errors in browser
- [ ] Navigation works between pages

## 🎯 Custom Domain (Optional)

### Add Custom Domain in Vercel

1. Go to project settings
2. Click "Domains"
3. Add your domain (e.g., `taxonomy.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

## 📈 Monitoring

### Vercel Analytics

Enable in project settings:
- Real-time traffic
- Performance metrics
- Error tracking

### API Monitoring

Check function logs in Vercel dashboard:
- View all API requests
- See response times
- Debug errors

## 🆘 Support

### Common Issues

| Issue | Solution |
|-------|----------|
| Build timeout | Contact Vercel support for increased timeout |
| Large cache file | Normal - ~3 MB is expected |
| Missing history | Verify prebuild ran successfully |
| Slow responses | Check function region settings |

### Getting Help

- **Documentation**: See `docs/PRE_BUILT_CACHE.md`
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

## 🎉 You're Done!

Your measurand taxonomy application is now:
- ✅ Deployed to Vercel
- ✅ Running in production
- ✅ Serving Git history via pre-built cache
- ✅ Auto-deploying on Git pushes
- ✅ Globally distributed via Vercel Edge Network

---

**Live URL**: Check your Vercel dashboard for the deployment URL

**Repository**: https://github.com/kevinmastriano/measurand-taxonomy-FrontEnd
