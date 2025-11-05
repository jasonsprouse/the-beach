# 🚀 Quick Start: Automated Deployment Setup

Get your project deployed to Vercel with automated GitHub Actions in 5 minutes!

## Prerequisites

- ✅ GitHub repository created
- ✅ Vercel account (free tier works!)
- ✅ GitHub CLI installed ([Download here](https://cli.github.com/))

## Step 1: Run the Setup Script (2 minutes)

```bash
# From your project root
./.github/scripts/setup-secrets.sh
```

**The script will:**
1. Link your project to Vercel
2. Extract project and organization IDs
3. Prompt for your Vercel token (creates one if needed)
4. Generate a secure session secret
5. Store everything in GitHub Secrets

## Step 2: Create Vercel KV Database (1 minute)

1. Go to https://vercel.com/dashboard
2. Select your project: **the-beach**
3. Click **Storage** → **Create Database**
4. Select **KV (Redis-compatible)**
5. Name: `the-beach-sessions`
6. Click **Create**

✅ Done! Vercel automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`

## Step 3: Deploy! (1 minute)

```bash
# Commit the workflow files
git add .github/
git commit -m "feat: Add automated Vercel deployment"

# Push to trigger deployment
git push origin main
```

## That's It! 🎉

**Check your deployment:**

1. Go to GitHub → **Actions** tab
2. Watch the deployment progress
3. Get your deployment URL from the summary
4. Visit your live site!

## Verify Everything Works

1. **Visit your deployed URL**
2. **Click "Register with WebAuthn"** - Complete registration
3. **Click "Check Session"** - Should show authenticated ✅
4. **Refresh the page**
5. **Click "Check Session"** again - Should STILL be authenticated ✅

If all checks pass, your automated deployment with secure session storage is working perfectly!

## What Happens Next?

Every time you push to:
- `main` → Deploys to **Production**
- `test` or `feature/*` → Deploys to **Preview**
- Pull Request → Creates **Preview** with comment

## Need Help?

- **Full documentation:** See `docs/AUTOMATED_DEPLOYMENT.md`
- **Troubleshooting:** Check GitHub Actions logs
- **Vercel issues:** Check Vercel dashboard logs

## Quick Commands

```bash
# Check deployment status
gh run list

# View latest deployment logs
gh run view --log

# List GitHub secrets
gh secret list

# Update a secret
echo "new-value" | gh secret set SECRET_NAME
```

---

**🎊 Congratulations!** You now have a fully automated, secure deployment pipeline!
