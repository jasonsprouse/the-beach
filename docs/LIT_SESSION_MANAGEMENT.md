# Lit Protocol Session Management

## Overview

The session now properly manages **full Lit Protocol state** including:
- **Lit Wallet Signature** (`litWalletSignature`)
- **Lit PKP** (Programmable Key Pair) with sub-PKPs
- **Lit Auth Method** (WebAuthn credentials)

## Session Structure

### `UserSession` Interface

```typescript
interface UserSession {
  // Basic authentication
  username?: string;
  authenticated?: boolean;
  authenticatedAt?: Date;
  currentChallenge?: string;
  
  // Lit Protocol Components
  litWalletSignature?: string;
  litPKP?: {
    address: string;              // Primary PKP Ethereum address
    publicKey: string;            // PKP public key
    ethAddress: string;           // Same as address
    subPKPs?: Array<{
      address: string;            // Sub-PKP address
      purpose: string;            // 'ai-build' or 'session-management'
      index: number;              // Sub-PKP index
      createdAt: string;          // ISO timestamp
    }>;
    canMint?: boolean;            // Can mint additional sub-PKPs
  };
  litAuthMethod?: {
    authMethodType: string;       // 'webauthn'
    credentialId?: string;        // WebAuthn credential ID
    publicKey?: string;           // WebAuthn public key (base64)
  };
}
```

## API Endpoints

### 1. Check User Credentials (NEW)
**Determines if user should REGISTER or LOGIN**

```http
POST /lit/user/check-credentials
Content-Type: application/json

{
  "username": "testuser"
}
```

**Response:**
```json
{
  "exists": true,
  "username": "testuser",
  "authenticatorCount": 1,
  "canLogin": true,
  "message": "User 'testuser' already registered - please login"
}
```

### 2. Session Status
**Returns full Lit Protocol session state**

```http
GET /lit/session/status
```

**Response:**
```json
{
  "authenticated": true,
  "username": "testuser",
  "authenticatedAt": "2025-11-05T09:54:40.000Z",
  "litWalletSignature": "lit-wallet-sig-testuser-1730800480000",
  "litPKP": {
    "address": "0x3bd1309d15335f8a06355bd341e99efd312326ea",
    "publicKey": "0x...",
    "ethAddress": "0x3bd1309d15335f8a06355bd341e99efd312326ea",
    "subPKPs": [
      {
        "address": "0x7c9e564e96bb80c13073dbf69ff45cb01175762b",
        "purpose": "ai-build",
        "index": 1,
        "createdAt": "2025-11-05T09:54:40.000Z"
      },
      {
        "address": "0xf39590ea04bf40aa994c89c349445f9e0b50ad06",
        "purpose": "session-management",
        "index": 0,
        "createdAt": "2025-11-05T09:54:40.000Z"
      }
    ],
    "canMint": true
  },
  "litAuthMethod": {
    "authMethodType": "webauthn",
    "credentialId": "FAgqB_R3kMCwxVLapjDrs3cviLPg0QsIPUfG-8DM2L8",
    "publicKey": "..."
  },
  "pkp": {
    "ethAddress": "0x3bd1309d15335f8a06355bd341e99efd312326ea",
    "publicKey": "0x...",
    "subPKPs": [...],
    "canMint": true
  }
}
```

### 3. Authentication Success Response
**Now includes full session state**

```http
POST /lit/webauthn/verify-authentication
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "WebAuthn authentication successful",
  "username": "testuser",
  "pkp": {
    "ethAddress": "0x3bd1309d15335f8a06355bd341e99efd312326ea",
    "publicKey": "0x...",
    "subPKPs": [...],
    "canMint": true
  },
  "oneToOneMapping": true,
  "session": {
    "litPKP": {...},
    "litAuthMethod": {...},
    "litWalletSignature": "lit-wallet-sig-testuser-1730800480000"
  }
}
```

### 4. Logout
**Clears all Lit Protocol session data**

```http
POST /lit/session/logout
```

**Console Output:**
```
🚪 Session cleared - all Lit Protocol state removed
```

## Usage Flow

### For New Users (Register Flow)

1. **Check if user exists**:
   ```javascript
   const response = await fetch('/lit/user/check-credentials', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ username: 'testuser' })
   });
   const { exists, canLogin } = await response.json();
   ```

2. **If `exists === false`**: Show REGISTER button
3. **User registers** → WebAuthn creates credential → PKP generated → Session populated

### For Existing Users (Login Flow)

1. **Check if user exists**: `exists === true` → Show LOGIN button
2. **User logs in** → WebAuthn authenticates → PKP retrieved → Session populated with:
   - ✅ `litPKP` (Primary + Sub-PKPs)
   - ✅ `litAuthMethod` (WebAuthn credentials)
   - ✅ `litWalletSignature` (Generated signature)

3. **Session persists** across requests via HttpOnly cookies

## PKP Structure

### Primary PKP
- **Address**: Deterministically generated from `username + credentialID`
- **Purpose**: Main wallet for user
- **1:1 Mapping**: One user = One PKP

### Sub-PKPs
Each user automatically gets 2 sub-PKPs:

1. **AI Build PKP** (`ai-build#1`):
   - Purpose: AI-generated content and builds
   - Index: 1

2. **Session Management PKP** (`session#0`):
   - Purpose: Session-specific operations
   - Index: 0

## Security Features

✅ **HttpOnly Cookies**: Session cookies not accessible to JavaScript  
✅ **One-to-One Mapping**: One user = One WebAuthn credential = One PKP  
✅ **Deterministic PKPs**: Same username + credential = Same PKP address  
✅ **Session Persistence**: Full Lit state survives page refreshes  
✅ **Clean Logout**: All Lit Protocol data cleared on logout  

## Frontend Integration

### Check Session on Page Load
```javascript
async function checkSession() {
  const response = await fetch('/lit/session/status', {
    credentials: 'include'
  });
  const session = await response.json();
  
  if (session.authenticated) {
    console.log('PKP Address:', session.litPKP.address);
    console.log('Auth Method:', session.litAuthMethod.authMethodType);
    console.log('Sub-PKPs:', session.litPKP.subPKPs.length);
  }
}
```

### Determine Register vs Login
```javascript
async function shouldRegisterOrLogin(username) {
  const response = await fetch('/lit/user/check-credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username })
  });
  const { exists, canLogin, message } = await response.json();
  
  if (canLogin) {
    showLoginButton();
  } else {
    showRegisterButton();
  }
  
  return message;
}
```

## Console Logging

### On Authentication Success:
```
✅ Authentication successful for testuser with one-to-one PKP mapping
🔑 PKP Address: 0x3bd1309d15335f8a06355bd341e99efd312326ea
🔐 Session established with Lit Protocol state
```

### On Credential Check:
```
🔍 Credential check for "testuser": EXISTS (1 authenticator(s))
```

### On Logout:
```
🚪 Session cleared - all Lit Protocol state removed
```

## Notes

- **Wallet Signature**: Currently a placeholder (`lit-wallet-sig-{username}-{timestamp}`)
  - In production, this would be a real signature from the PKP
- **Sub-PKP Addresses**: Deterministically generated from username + credentialID + purpose
- **Session Expiry**: 24 hours (configurable in `main.ts`)
- **Storage**: User credentials persisted to `webauthn-users.json`

## Next Steps

1. ✅ Session management implemented
2. ✅ Permissions Policy headers fixed
3. ⚠️ Need to integrate real PKP signing for `litWalletSignature`
4. ⚠️ Need to connect to actual Lit Protocol network for PKP minting (currently deterministic generation)
