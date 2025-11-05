# Vercel Deployment with Redis Session Storage

This project uses Vercel KV (Redis) for persistent session storage in production, ensuring WebAuthn credentials and user sessions persist across serverless function invocations.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @vercel/kv connect-redis
```

Already installed ✅

### 2. Create Vercel KV Database

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **KV (Redis-compatible)**
5. Name your database (e.g., `the-beach-sessions`)
6. Click **Create**

### 3. Configure Environment Variables

Vercel will automatically add these to your project after creating the KV database:

- `KV_REST_API_URL` - Your Vercel KV REST API endpoint
- `KV_REST_API_TOKEN` - Your Vercel KV authentication token
- `SESSION_SECRET` - **You must add this manually** (use a long random string)

#### Add SESSION_SECRET:

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `SESSION_SECRET`
   - **Value**: Generate a secure random string (e.g., from `openssl rand -base64 32`)
   - **Environment**: Production, Preview, Development (select all)

### 4. Deploy to Vercel

```bash
# Commit your changes
git add .
git commit -m "feat: Add Vercel KV session storage for production"
git push origin your-branch

# Vercel will auto-deploy if connected, or manually deploy:
vercel --prod
```

## How It Works

### Session Storage Architecture

**Development (Local)**:
- Uses in-memory session storage
- Sessions reset on server restart
- Fast and simple for development

**Production (Vercel)**:
- Uses Vercel KV (Redis) for persistent sessions
- Sessions survive across serverless function invocations
- Automatic session expiration after 24 hours

### Session Data Stored

The following WebAuthn and Lit Protocol data is stored in Redis:

```typescript
{
  // Authentication state
  authenticated: boolean
  username: string
  authenticatedAt: Date
  
  // WebAuthn challenge (temporary, for registration/login)
  currentChallenge: string
  
  // Lit Protocol PKP data
  litPKP: {
    address: string
    publicKey: string
    subPKPs: Array<{type: string, address: string}>
    canMint: boolean
  }
  
  // WebAuthn auth method
  litAuthMethod: {
    authMethodType: number
    credentialId: string
    publicKey: string
  }
  
  // Wallet signature (if applicable)
  litWalletSignature: string | null
}
```

### Configuration

The session store is configured in `src/main.ts`:

```typescript
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  // Production: Use Vercel KV
  const redisClient = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
  
  sessionStore = new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: 24 * 60 * 60, // 24 hours
  });
} else {
  // Development: In-memory sessions
}
```

## Testing

### Local Testing

```bash
npm run start:dev
```

Sessions will use in-memory storage.

### Production Testing

After deploying to Vercel:

1. Visit your deployed URL
2. Click "Register with WebAuthn"
3. Complete registration
4. Refresh the page
5. Click "Check Session"
6. ✅ Session should persist (previously would show "not authenticated")

## Troubleshooting

### Sessions not persisting on Vercel

**Check**:
1. Vercel KV database is created
2. Environment variables are set correctly
3. Check Vercel deployment logs for KV connection messages

### Session cookies not working

**Check**:
1. `sameSite` is set to `'none'` in production
2. `secure` is `true` in production
3. Your Vercel domain supports HTTPS

### Redis connection errors

**Check**:
1. `KV_REST_API_URL` is correctly formatted
2. `KV_REST_API_TOKEN` is valid
3. Vercel KV database is active

## Security Considerations

1. **SESSION_SECRET**: Must be a strong, random value in production
2. **HTTPS**: Always use HTTPS in production (automatic on Vercel)
3. **Cookie Security**: 
   - `httpOnly: true` - Prevents JavaScript access
   - `secure: true` - HTTPS only (production)
   - `sameSite: 'none'` - Required for cross-origin (production)
4. **Session Expiration**: 24-hour TTL, adjust as needed

## Cost Considerations

Vercel KV pricing (as of 2024):
- **Hobby**: 256 MB storage, 3000 commands/day - FREE
- **Pro**: 512 MB storage, 100K commands/day - Included
- **Enterprise**: Custom pricing

For this application:
- Each session: ~2KB
- 256 MB = ~128,000 sessions
- Typical usage: Well within free tier

## Additional Resources

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [connect-redis Documentation](https://github.com/tj/connect-redis)
- [express-session Documentation](https://github.com/expressjs/session)
