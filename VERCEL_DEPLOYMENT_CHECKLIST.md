# Vercel Deployment Checklist

## ✅ Code Changes Complete

The following have been implemented and committed:

- ✅ Installed `@vercel/kv` and `connect-redis` packages
- ✅ Updated `src/main.ts` to use Vercel KV in production
- ✅ Added `.env.example` with required environment variables
- ✅ Created comprehensive documentation in `docs/VERCEL_REDIS_SESSION_SETUP.md`

## 🚀 Next Steps on Vercel Dashboard

### Step 1: Create Vercel KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project **"the-beach"**
3. Click on the **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis-compatible)
6. Name it: `the-beach-sessions`
7. Click **Create**

✅ This automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment variables

### Step 2: Add SESSION_SECRET Environment Variable

1. In your project, go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Configure:
   - **Key**: `SESSION_SECRET`
   - **Value**: (Generate a secure random string - see below)
   - **Environments**: Select all (Production, Preview, Development)
4. Click **Save**

#### Generate SESSION_SECRET

Run this command to generate a secure random secret:

```bash
openssl rand -base64 32
```

Or use this Node.js command:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 3: Deploy

```bash
# Push your changes (already committed)
git push origin test

# Or merge to main branch for production deployment
git checkout main
git merge test
git push origin main
```

Vercel will automatically deploy when you push to your connected branch.

### Step 4: Verify Deployment

After deployment completes:

1. **Visit your deployed URL**
2. **Test Registration**:
   - Click "Register with WebAuthn"
   - Complete the registration flow
3. **Test Session Persistence**:
   - Click "Check Session" → Should show authenticated
   - Refresh the page
   - Click "Check Session" again → Should STILL show authenticated ✅
4. **Test Login**:
   - Logout (if button available)
   - Click "Login with WebAuthn"
   - Should authenticate successfully

## 🔍 Monitoring & Troubleshooting

### View Logs

1. Go to your Vercel project dashboard
2. Click on **Deployments**
3. Select your latest deployment
4. Click **Function Logs** or **Runtime Logs**

Look for:
- `✅ Vercel KV session store configured` - Redis is working
- `⚠️ Using in-memory session store` - Redis not configured (check env vars)

### Check Redis Sessions

Go to **Storage** → Your KV database → **Data Browser**

You should see keys like:
```
sess:abc123def456...
sess:xyz789ghi012...
```

Each key contains the session data for an authenticated user.

### Common Issues

#### Issue: Sessions not persisting

**Solution:**
- Verify KV database is created
- Check environment variables are set
- Redeploy after adding env vars

#### Issue: "Cannot connect to Redis"

**Solution:**
- Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are correct
- Check KV database status (should be "Active")

#### Issue: Authentication fails after deployment

**Solution:**
- Clear browser cookies
- Try in incognito/private window
- Check that `SESSION_SECRET` is set

## 📊 Expected Behavior

### Before (Without Redis)
❌ Register → Refresh → Check Session → "Not authenticated"
❌ Sessions lost between serverless function invocations

### After (With Redis)
✅ Register → Refresh → Check Session → "Authenticated as [username]"
✅ Sessions persist across all requests
✅ WebAuthn credentials stored and accessible
✅ Lit Protocol PKP data persists

## 💰 Vercel KV Pricing

**Hobby Plan (FREE):**
- 256 MB storage
- 3,000 commands/day
- Perfect for development and small projects

**Pro Plan:**
- 512 MB storage
- 100,000 commands/day
- Included in Pro plan ($20/month)

## 📝 Environment Variables Summary

After setup, your Vercel project should have:

```
NODE_ENV=production
SESSION_SECRET=[your-secret-from-step-2]
KV_REST_API_URL=[auto-added-by-vercel]
KV_REST_API_TOKEN=[auto-added-by-vercel]
```

## ✅ Deployment Complete!

Once you see:
- KV database created
- Environment variables set
- Deployment successful
- Session persistence working

Your application is production-ready with full session support! 🎉
