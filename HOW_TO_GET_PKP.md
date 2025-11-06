# 🔐 How to Get Your Google Login PKP

**Quick guide to getting your PKP public key from Google authentication**

---

## Method 1: Via Y8 App (Frontend)

### Step 1: Login to Y8 App

Navigate to your Y8 App and click "Sign in with Google":

```javascript
// Your Y8 App automatically handles this
// When you click "Sign in with Google"
```

### Step 2: PKP is Minted/Retrieved

```javascript
// After Google OAuth completes:
const pkpInfo = {
  publicKey: "0x04a1b2c3...", // Your PKP public key
  ethAddress: "0x1234...",    // Derived Ethereum address
  authMethod: "google",
  googleEmail: "jasonsprouse@gmail.com"
};
```

### Step 3: Get Your PKP

In your Y8 App, after login, check the console or user profile:

```javascript
// In browser console:
console.log("My PKP:", window.userPKP);

// Or in your profile section, copy the PKP public key displayed
```

---

## Method 2: Via Backend API

### Step 1: Authenticate via Backend

```bash
# After logging in via Google on Y8 App, your PKP is stored
curl -X POST http://localhost:3000/npe/pkp-auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "pkpPublicKey": "YOUR_PKP_FROM_Y8_APP",
    "authMethod": "google",
    "signature": "YOUR_SIGNATURE_FROM_Y8_APP"
  }'
```

### Step 2: Verify Your PKP

```bash
curl http://localhost:3000/npe/pkp-auth/verify/YOUR_PKP_PUBLIC_KEY
```

---

## Method 3: Using Lit Protocol SDK Directly

If you want to manually get your PKP:

```typescript
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { GoogleProvider } from "@lit-protocol/lit-auth-client";

async function getMyPKP() {
  // Initialize Lit
  const litNodeClient = new LitNodeClient({
    litNetwork: "datil-dev",
  });
  await litNodeClient.connect();
  
  // Authenticate with Google
  const googleProvider = new GoogleProvider();
  const authMethod = await googleProvider.authenticate();
  
  // Mint or fetch PKP
  const pkps = await litNodeClient.mintPKPWithAuthMethods({
    authMethods: [authMethod],
  });
  
  console.log("Your PKP Public Key:", pkps[0].publicKey);
  console.log("Your PKP ETH Address:", pkps[0].ethAddress);
  
  return pkps[0].publicKey;
}
```

---

## Where to Find Your PKP

### In Y8 App

1. Login with Google
2. Go to Profile/Settings
3. Look for "PKP Public Key" or "Wallet Address"
4. Copy the long string starting with `0x04...`

### In Browser DevTools

```javascript
// Open DevTools (F12)
// Go to Console tab
// Type:
localStorage.getItem('pkpPublicKey')
// or
sessionStorage.getItem('pkpPublicKey')
// or check cookies
document.cookie
```

### In Backend Logs

After authenticating via Y8 App, check your backend logs:

```bash
# Look for logs like:
# "PKP authenticated: 0x04a1b2c3..."
tail -f logs/application.log | grep "PKP authenticated"
```

---

## PKP Format

Your PKP public key will look like:

```
Full Public Key (recommended):
0x04a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1

Ethereum Address (derived):
0x1234567890abcdef1234567890abcdef12345678

Compressed Form (sometimes used):
zQmXg9Pp2ytJXRqYmhXqXzbnp5MiiR4c3YqX1XZ9F9Txc
```

---

## Using Your PKP

Once you have your PKP public key:

### Set as Environment Variable

```bash
# In your terminal:
export PKP_KEY="0x04a1b2c3d4e5f6..."

# Or add to .env file:
echo "PKP_KEY=0x04a1b2c3d4e5f6..." >> .env
```

### Use in Quick Start Script

```bash
# Run the quick start with your PKP:
export PKP_KEY="YOUR_ACTUAL_PKP_KEY"
./pkp-sales-quickstart.sh
```

### Use in API Calls

```bash
# Replace YOUR_PKP in all curl commands:
curl http://localhost:3000/marketplace/dashboard/YOUR_PKP_KEY
```

---

## Verify It's Working

```bash
# Test authentication:
curl -X POST http://localhost:3000/npe/pkp-auth/verify/YOUR_PKP \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "valid": true,
#   "pkpPublicKey": "0x04a1b2...",
#   "ethAddress": "0x1234...",
#   "authMethod": "google"
# }
```

---

## Common Issues

### Issue 1: PKP Not Found

**Solution**: Login again via Y8 App with Google to mint/retrieve PKP

### Issue 2: Invalid PKP Format

**Solution**: Make sure you copied the full key including `0x04` prefix

### Issue 3: PKP Not Verified

**Solution**: Ensure you authenticated via Google OAuth, not manual entry

---

## Security Notes

🔒 **Never share your PKP private key** (only public key is used)
🔒 **PKP is tied to your Google account** (verified identity)
🔒 **Signatures prove ownership** (cryptographic proof)
🔒 **IPLD ensures tamper-proof** (content-addressable CIDs)

---

## Next Steps

Once you have your PKP:

1. ✅ Export it: `export PKP_KEY="0x04..."`
2. ✅ Run quick start: `./pkp-sales-quickstart.sh`
3. ✅ Create storefront
4. ✅ Start selling!

Your PKP is your **cryptographic identity** for selling code and music. It proves you own the content via Google authentication.

**Ready to sell with your PKP! 🚀**
