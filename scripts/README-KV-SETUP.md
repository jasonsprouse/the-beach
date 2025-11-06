# Vercel KV + Lit Protocol Setup

This script programmatically creates a Vercel KV database and encrypts sensitive secrets using Lit Protocol for decentralized secret management.

## 🎯 What It Does

1. **Creates Vercel KV Database** - Programmatically provisions `the-beach-sessions` Redis database
2. **Encrypts Secrets with Lit Protocol** - Uses decentralized encryption for sensitive values
3. **Stores Encrypted Secrets in Vercel** - Saves encrypted values as environment variables
4. **Generates Decryption Utilities** - Creates helper functions for runtime decryption

## 🔧 Prerequisites

```bash
# 1. Ensure you're logged into Vercel
vercel login

# 2. Link your project
vercel link

# 3. Get your Vercel token
# Go to: https://vercel.com/account/tokens
# Create token with full account access

# 4. Export the token
export VERCEL_TOKEN=your_token_here
```

## 🚀 Usage

```bash
# Run the setup script
npm run setup:vercel-kv
```

## 📋 What Gets Created

### 1. Vercel KV Database
- **Name**: `the-beach-sessions`
- **Type**: Redis-compatible key-value store
- **Purpose**: Persistent session storage for WebAuthn

### 2. Encrypted Environment Variables
- `SESSION_SECRET_ENCRYPTED` - Lit Protocol encrypted session secret
- Stored in Vercel with access control conditions

### 3. Decryption Utility
- **File**: `src/utils/lit-decrypt.ts`
- **Purpose**: Runtime decryption of Lit-encrypted secrets
- **Usage**: Import and call `decryptSecret()` when needed

### 4. Metadata File
- **File**: `.vercel/lit-encrypted-secrets.json`
- **Purpose**: Local reference for decryption parameters
- **Note**: Git-ignored for security

## 🔐 How Encryption Works

1. **Lit Protocol Access Control**:
   ```javascript
   const accessControlConditions = [{
     contractAddress: '',
     chain: 'ethereum',
     method: '',
     parameters: [':userAddress'],
     returnValueTest: {
       comparator: '=',
       value: AUTHORIZED_WALLET_ADDRESS
     }
   }];
   ```

2. **Encryption**:
   ```javascript
   const { ciphertext, dataToEncryptHash } = await encryptString({
     accessControlConditions,
     dataToEncrypt: secretValue,
   }, litClient);
   ```

3. **Decryption** (at runtime):
   ```javascript
   import { decryptSecret } from './utils/lit-decrypt';
   
   const sessionSecret = await decryptSecret(
     JSON.parse(process.env.SESSION_SECRET_ENCRYPTED)
   );
   ```

## 🔄 Alternative: Manual Setup

If you prefer manual setup without Lit Protocol encryption:

```bash
# 1. Create KV database via dashboard
# Visit: https://vercel.com/goodfaith1/the-beach
# Storage → Create Database → KV → Name: the-beach-sessions

# 2. Set session secret manually
vercel env add SESSION_SECRET production
# Then paste a random secret: openssl rand -base64 32
```

## 🛡️ Security Benefits of Lit Protocol

- **Decentralized**: No single point of failure
- **Access Control**: Cryptographic conditions for decryption
- **Auditable**: All access attempts logged on-chain
- **Key Rotation**: Easy secret rotation without downtime
- **Zero Trust**: Secrets never stored in plaintext

## 📝 Environment Variables

After running this script, Vercel will have:

| Variable | Source | Purpose |
|----------|--------|---------|
| `KV_REST_API_URL` | Auto (KV creation) | Redis connection URL |
| `KV_REST_API_TOKEN` | Auto (KV creation) | Redis auth token |
| `SESSION_SECRET_ENCRYPTED` | Script | Lit-encrypted session secret |
| `VERCEL_TOKEN` | Manual (local only) | Deployment authentication |

## 🐛 Troubleshooting

**Error: "VERCEL_TOKEN not found"**
```bash
export VERCEL_TOKEN=your_token_here
```

**Error: "Project not linked"**
```bash
vercel link
```

**Error: "store_already_exists"**
- Database already created - script will skip creation
- Check: https://vercel.com/goodfaith1/the-beach/stores

**Error: "Failed to connect to Lit Protocol"**
- Network issue - retry
- Or use manual setup instead

## 🎯 Next Steps

After running this script:

1. **Deploy to Vercel**:
   ```bash
   vercel deploy --prod
   ```

2. **Test WebAuthn Registration**:
   - Visit your deployed URL
   - Try registering a new user
   - Sessions should persist via KV

3. **Verify KV Storage**:
   ```bash
   vercel env ls production
   ```

## 📚 References

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Lit Protocol Docs](https://developer.litprotocol.com/)
- [WebAuthn Guide](https://webauthn.guide/)

---

**Created with ❤️ for secure, decentralized secret management**
