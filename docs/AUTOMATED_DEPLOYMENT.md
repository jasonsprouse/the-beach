# Automated Vercel Deployment with Secure Secret Management

This project uses GitHub Actions to automatically deploy to Vercel with secure secret management through GitHub Secrets.

## 🔐 Security Features

- ✅ All secrets stored in GitHub Secrets (encrypted at rest)
- ✅ Secrets never exposed in logs or code
- ✅ Automatic environment variable injection
- ✅ Separate environments for production and preview
- ✅ Session secrets rotated and encrypted
- ✅ Vercel KV (Redis) credentials auto-managed

## 🚀 Quick Setup (Automated)

### Option 1: Using the Setup Script (Recommended)

```bash
# Run the automated setup script
./.github/scripts/setup-secrets.sh
```

This script will:
1. Link your project to Vercel (if not already linked)
2. Extract Vercel Project ID and Org ID
3. Prompt for your Vercel token
4. Generate or accept a SESSION_SECRET
5. Store all secrets in GitHub Secrets

### Option 2: Manual Setup

If you prefer to set up secrets manually, follow these steps:

#### Step 1: Get Vercel Information

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Link your project to Vercel
vercel link

# This creates .vercel/project.json with your IDs
```

#### Step 2: Create Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "GitHub Actions Deploy"
4. Copy the token (you'll only see it once!)

#### Step 3: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these 4 secrets:

**Required Secrets:**

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | https://vercel.com/account/tokens |
| `VERCEL_PROJECT_ID` | Your project ID | Found in `.vercel/project.json` |
| `VERCEL_ORG_ID` | Your organization ID | Found in `.vercel/project.json` |
| `SESSION_SECRET` | Session encryption key | Generate: `openssl rand -base64 32` |

**Example values in `.vercel/project.json`:**
```json
{
  "projectId": "prj_abc123def456",
  "orgId": "team_xyz789"
}
```

## 📋 Deployment Workflow

### Automatic Deployments

The GitHub Action automatically deploys when you push to:

- `main` → **Production** deployment
- `test` → **Preview** deployment
- `feature/master-scene-integration` → **Preview** deployment
- Pull Requests → **Preview** deployment with comment

### What Happens on Deploy

1. **Build** - Compiles TypeScript to JavaScript
2. **Deploy** - Pushes to Vercel
3. **Configure** - Sets environment variables
4. **Verify** - Checks Redis/KV configuration
5. **Notify** - Posts deployment URL to PR (if applicable)

## 🔧 Environment Variables

### Automatically Set by GitHub Actions

These are set from GitHub Secrets:

- `SESSION_SECRET` - Session signing key
- `NODE_ENV` - Set to "production" for main branch

### Automatically Set by Vercel KV

When you create a Vercel KV database, these are added automatically:

- `KV_REST_API_URL` - Redis connection URL
- `KV_REST_API_TOKEN` - Redis authentication token

## 🗄️ Vercel KV Database Setup

**Important:** You must create the Vercel KV database manually (one-time setup):

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click **Storage** tab
4. Click **Create Database**
5. Select **KV (Redis)**
6. Name: `the-beach-sessions`
7. Click **Create**

This automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your Vercel environment variables.

## 📊 Deployment Environments

### Production Environment

- **Branch:** `main`
- **URL:** https://the-beach-xxx.vercel.app (your production domain)
- **Environment:** `production`
- **Session Store:** Vercel KV (Redis)

### Preview Environment

- **Branches:** `test`, `feature/*`, PRs
- **URL:** https://the-beach-git-xxx.vercel.app (unique per deployment)
- **Environment:** `preview`
- **Session Store:** Vercel KV (Redis)

## 🔄 Workflow File

Location: `.github/workflows/vercel-deploy.yml`

### Key Features

- ✅ Builds and deploys to Vercel
- ✅ Separates production and preview environments
- ✅ Injects secrets securely
- ✅ Verifies KV configuration
- ✅ Posts deployment URLs to PRs
- ✅ Creates deployment summary

### Triggering Deployments

```bash
# Deploy to preview (test branch)
git checkout test
git add .
git commit -m "feat: new feature"
git push origin test

# Deploy to production (main branch)
git checkout main
git merge test
git push origin main
```

## 🔍 Monitoring Deployments

### GitHub Actions Tab

1. Go to your repository on GitHub
2. Click **Actions** tab
3. View deployment status and logs

### Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. View **Deployments** tab
4. Check logs for any issues

## 🐛 Troubleshooting

### Deployment Failed - "Vercel token is invalid"

**Solution:**
1. Create a new token at https://vercel.com/account/tokens
2. Update GitHub Secret `VERCEL_TOKEN`

### Deployment Succeeds but Sessions Don't Persist

**Solution:**
1. Verify Vercel KV database is created
2. Check environment variables in Vercel dashboard
3. Ensure `KV_REST_API_URL` and `KV_REST_API_TOKEN` exist

### "Project not found" Error

**Solution:**
1. Run `vercel link` locally
2. Update `VERCEL_PROJECT_ID` in GitHub Secrets
3. Ensure `.vercel/project.json` is correct

### Environment Variables Not Set

**Solution:**
1. Check GitHub Secrets are properly configured
2. Verify workflow file has correct secret references
3. Re-run the deployment

## 🔒 Security Best Practices

### Do's ✅

- ✅ Store all secrets in GitHub Secrets
- ✅ Use strong random values for `SESSION_SECRET`
- ✅ Rotate secrets periodically (every 90 days)
- ✅ Use separate secrets for production and development
- ✅ Enable 2FA on GitHub and Vercel accounts
- ✅ Limit Vercel token scope to deployment only

### Don'ts ❌

- ❌ Never commit secrets to the repository
- ❌ Don't share secrets in Slack/email/chat
- ❌ Don't use the same secret across projects
- ❌ Don't store secrets in `.env` files in the repo
- ❌ Don't log secrets to console/output

## 📝 Secret Rotation

To rotate secrets (recommended every 90 days):

```bash
# Generate new session secret
NEW_SECRET=$(openssl rand -base64 32)

# Update GitHub Secret
echo $NEW_SECRET | gh secret set SESSION_SECRET

# Create new Vercel token
# Go to https://vercel.com/account/tokens
# Create new token, update GitHub Secret
gh secret set VERCEL_TOKEN
```

## 📚 Additional Resources

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [GitHub CLI](https://cli.github.com/)

## ✅ Verification Checklist

After setup, verify:

- [ ] GitHub Secrets configured (4 secrets)
- [ ] Vercel KV database created
- [ ] First deployment succeeded
- [ ] Production URL is accessible
- [ ] Session persistence works (Check Session button)
- [ ] WebAuthn registration works
- [ ] WebAuthn login works
- [ ] Sessions persist after page refresh

## 🎉 Success!

Once configured, you have:
- ✅ Fully automated deployments
- ✅ Secure secret management
- ✅ Persistent session storage
- ✅ Separate production/preview environments
- ✅ PR deployment previews
- ✅ Deployment notifications

Just push to your branch and let GitHub Actions handle the rest! 🚀
