# Environment Variables Quick Reference

## 🚀 Essential Variables (Required for Production)

These are the **MUST HAVE** variables to get your NPE Manager system running:

```bash
# Server
NODE_ENV=production
PORT=3000

# Security
SESSION_SECRET=<64-char-random-hex>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Redis
REDIS_URL=redis://your-redis-host:6379

# Lit Protocol  
LIT_NETWORK=datil-dev

# CORS
CORS_ORIGIN=https://your-y8-app.com

# Social Auth (at least one)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

---

## 📋 Complete Variable Categories

### 1. **Server Configuration** (Required)
- `NODE_ENV` - Environment (production/development)
- `PORT` - Server port (default: 3000)
- `HOST` - Bind address (default: 0.0.0.0)
- `APP_URL` - Your frontend URL
- `API_URL` - Your backend API URL

### 2. **Security** (Required)
- `SESSION_SECRET` - Session encryption key (64+ chars)
- `ENCRYPTION_KEY` - Data encryption key (32 bytes)
- `SESSION_TIMEOUT` - Session duration in seconds

### 3. **Redis** (Required)
- `REDIS_URL` - Redis connection string
- `REDIS_PASSWORD` - Redis password (if needed)
- OR use Vercel KV:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`

### 4. **Lit Protocol** (Required)
- `LIT_NETWORK` - Network (datil-dev or datil)
- `LIT_RPC_URL` - RPC endpoint
- `LIT_CAPACITY_CREDIT_TOKEN_ID` - Payment token
- `PKP_PUBLIC_KEY` - Your PKP public key
- `PKP_ETH_ADDRESS` - Your PKP address

### 5. **CORS** (Required)
- `CORS_ORIGIN` - Allowed origins (comma-separated)
- `ALLOWED_ORIGINS` - Same as above

### 6. **Social Auth Providers** (At least one required)

**Google OAuth:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`

**Discord OAuth:**
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_CALLBACK_URL`

**GitHub OAuth:**
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`

**Twitter/X OAuth:**
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`
- `TWITTER_CALLBACK_URL`

### 7. **WebAuthn/Biometric** (Recommended)
- `WEBAUTHN_RP_NAME` - Your app name
- `WEBAUTHN_RP_ID` - Your domain
- `WEBAUTHN_ORIGIN` - Your URL

### 8. **Rate Limiting** (Recommended)
- `API_RATE_LIMIT` - Max requests per window
- `API_RATE_WINDOW` - Time window in ms
- `API_RATE_LIMIT_ANONYMOUS` - Limit for unauthenticated

### 9. **Monitoring** (Recommended)
- `LOG_LEVEL` - Log verbosity
- `SENTRY_DSN` - Error tracking URL
- `SENTRY_ENVIRONMENT` - Environment name
- `SENTRY_TRACES_SAMPLE_RATE` - Sampling rate

### 10. **GitHub Integration** (For repo access)
- `GITHUB_TOKEN` - Personal access token
- `GITHUB_OWNER` - jasonsprouse
- `GITHUB_REPO_Y8` - y8-app
- `GITHUB_REPO_BEACH` - the-beach

### 11. **Feature Flags** (Optional)
- `ENABLE_WEBSOCKET` - Enable WebSocket (true)
- `ENABLE_GAMIFICATION` - Enable game features (true)
- `ENABLE_AUTO_APPROVAL` - Allow auto-approvals (true)
- `ENABLE_ANALYTICS` - Track metrics (true)
- `ENABLE_API_KEYS` - Allow API key generation (true)

### 12. **Email/Notifications** (Optional)
- `SMTP_HOST` - SMTP server
- `SMTP_PORT` - SMTP port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- OR use SendGrid:
  - `SENDGRID_API_KEY`
  - `SENDGRID_FROM_EMAIL`

### 13. **Payment Processing** (Optional)
- `STRIPE_SECRET_KEY` - Stripe secret
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_WEBHOOK_SECRET` - Webhook secret

### 14. **AI Models** (Optional)
- `OPENAI_API_KEY` - OpenAI key
- `OPENAI_MODEL` - Model name
- `ANTHROPIC_API_KEY` - Anthropic key
- `ANTHROPIC_MODEL` - Model name

---

## 🔐 How to Generate Secrets

```bash
# Session Secret (64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption Key (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Random string (any length)
openssl rand -hex 32
```

---

## 📦 Platform-Specific Setup

### **Vercel**
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Vercel automatically sets: `VERCEL_URL`, `VERCEL_ENV`
4. Use Vercel KV for Redis: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

### **Heroku**
```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret
heroku config:set REDIS_URL=redis://...
# etc.
```

### **Docker**
Create `.env` file or use `docker-compose.yml`:
```yaml
environment:
  - NODE_ENV=production
  - SESSION_SECRET=${SESSION_SECRET}
  - REDIS_URL=redis://redis:6379
```

### **AWS/EC2**
Use AWS Systems Manager Parameter Store or Secrets Manager:
```bash
aws ssm put-parameter --name /npe-manager/SESSION_SECRET --value "your-secret" --type SecureString
```

---

## ✅ Production Checklist

Before deploying, verify:

- [ ] `NODE_ENV=production`
- [ ] Strong random `SESSION_SECRET` set
- [ ] Redis is accessible and `REDIS_URL` is correct
- [ ] At least one social auth provider configured
- [ ] `CORS_ORIGIN` includes your frontend URL
- [ ] `LIT_NETWORK` is set correctly (datil-dev or datil)
- [ ] All secrets are stored securely (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] `SENTRY_DSN` configured for error tracking
- [ ] `LOG_LEVEL=info` (not debug)
- [ ] HTTPS is enforced on `APP_URL` and `API_URL`

---

## 🆘 Troubleshooting

### "Redis connection failed"
- Check `REDIS_URL` format: `redis://host:port`
- If using password: `redis://:password@host:port`
- Verify Redis is running: `redis-cli ping`

### "Session secret not set"
- Ensure `SESSION_SECRET` is defined
- Verify it's at least 32 characters
- Check environment file is loaded

### "CORS error"
- Add your frontend URL to `CORS_ORIGIN`
- Use comma-separated list for multiple origins
- Include protocol (https://)

### "Social login failed"
- Verify client ID and secret are correct
- Check callback URL matches OAuth app settings
- Ensure redirect URI is whitelisted

---

## 📚 Where Variables Are Used

| Variable | Used In | Purpose |
|----------|---------|---------|
| `SESSION_SECRET` | Session middleware | Encrypt session cookies |
| `REDIS_URL` | Redis service | Connect to Redis |
| `LIT_NETWORK` | Lit client | Choose Lit network |
| `GOOGLE_CLIENT_ID` | Auth service | Verify Google tokens |
| `CORS_ORIGIN` | CORS middleware | Allow frontend requests |
| `SENTRY_DSN` | Error tracking | Send errors to Sentry |
| `PKP_PUBLIC_KEY` | PKP service | Identify PKP |
| `ENCRYPTION_KEY` | Crypto utils | Encrypt sensitive data |

---

## 💡 Development vs Production

**Development (.env):**
```bash
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
LIT_NETWORK=datil-dev
CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=debug
DEBUG=true
```

**Production (.env.production):**
```bash
NODE_ENV=production
PORT=3000
REDIS_URL=redis://production-redis:6379
LIT_NETWORK=datil
CORS_ORIGIN=https://app.your-domain.com
LOG_LEVEL=info
DEBUG=false
SENTRY_DSN=https://...
```

---

## 🔗 Getting OAuth Credentials

### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

### Discord
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 section
4. Copy Client ID and Client Secret
5. Add redirect URIs

### GitHub
1. Go to [GitHub Settings → Developer Settings](https://github.com/settings/developers)
2. Create new OAuth App
3. Copy Client ID and generate Client Secret
4. Set authorization callback URL

---

## 📊 Minimum Configuration (Quick Start)

Copy this to `.env` and fill in the blanks:

```bash
NODE_ENV=production
PORT=3000
SESSION_SECRET=__GENERATE_THIS__
REDIS_URL=redis://localhost:6379
LIT_NETWORK=datil-dev
CORS_ORIGIN=https://your-frontend.com
GOOGLE_CLIENT_ID=__YOUR_GOOGLE_CLIENT_ID__
GOOGLE_CLIENT_SECRET=__YOUR_GOOGLE_CLIENT_SECRET__
```

That's the bare minimum to get started! 🚀
