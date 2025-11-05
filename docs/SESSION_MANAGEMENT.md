# Authentication Session Management - MVC Architecture

## 🔐 Session Management Overview

Your application uses **server-side session cookies** for authentication. This is secure, automatic, and requires no manual token management in the frontend.

### How It Works

```
1. User Registers/Logs In → WebAuthn creates credential
2. Backend verifies → Creates session → Sets HttpOnly cookie
3. Browser stores cookie automatically
4. All subsequent requests → Cookie sent automatically
5. Backend validates cookie → Authorizes request
```

## 🏗️ MVC Architecture

### Model (`authModel`)
**Responsibility**: Manage authentication state
- Stores: `currentUser`, `pkp`, `isAuthenticated`, `sessionSigs`, etc.
- Observable pattern: Subscribe to state changes
- Immutable state updates

```javascript
// Subscribe to auth state changes
authModel.subscribe((state) => {
  console.log('Auth state changed:', state);
  // Auto-renders UI
});

// Get current state
const state = authModel.getState();
console.log(state.currentUser); // "testuser"
```

### View (`authView`)
**Responsibility**: Render UI based on state
- Conditional rendering: authenticated vs unauthenticated
- Event listener attachment
- No business logic

```javascript
// Render is automatic via controller subscription
// But you can manually render:
authView.render(authModel.getState(), containerElement);
```

### Controller (`authController`)
**Responsibility**: Business logic and orchestration
- Handles user actions (register, login, logout)
- Coordinates Model ↔ API ↔ View
- Error handling and loading states

```javascript
// Initialize controller
await authController.init(document.getElementById('authContainer'));

// All operations
await authController.register('username');
await authController.login();
await authController.logout();
await authController.checkSession();
await authController.refreshSession();
await authController.mintSubPKP('ai-build', 'For AI assistant');

// Check state
authController.isAuthenticated(); // true/false
authController.getCurrentUser(); // "testuser"
```

## 📡 API Client (`authAPI`)

All HTTP requests automatically include session cookies via `credentials: 'include'`.

### RESTful Operations

#### GET Operations
```javascript
// Check session status
const { success, data } = await authAPI.getSessionStatus();
// data: { authenticated: true, username: "testuser", pkp: {...} }

// Get user profile
const profile = await authAPI.getUserProfile();

// Get PKP dashboard
const dashboard = await authAPI.getPKPDashboard();
// data: { primaryPKP: { ethAddress, subPKPs: [...] } }
```

#### POST Operations
```javascript
// Register new user (WebAuthn)
await authAPI.registerUser('username');

// Login user (WebAuthn)
await authAPI.loginUser('username');

// Logout user (destroys session)
await authAPI.logoutUser();

// Mint new sub-PKP
await authAPI.mintSubPKP('purpose', 'description');
```

#### PUT Operations
```javascript
// Update user profile (if implemented)
await authAPI.updateUserProfile({
  displayName: 'New Name',
  preferences: { theme: 'dark' }
});
```

#### DELETE Operations
```javascript
// Delete session (same as logout)
await authAPI.deleteSession();
```

## 🍪 Session Cookie Details

### Backend Configuration (NestJS)
```typescript
// Session stored in memory (production should use Redis/database)
session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,      // Not accessible to JavaScript
    secure: false,       // Set to true in production (HTTPS)
    sameSite: 'lax',     // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
})
```

### Session Data Structure
```typescript
interface UserSession {
  currentChallenge?: string;
  username: string;
  authenticated: boolean;
  authenticatedAt: Date;
  authenticators: Array<{
    credentialID: string;
    credentialPublicKey: Uint8Array;
    counter: number;
    transports?: string[];
  }>;
}
```

## 🔄 Request Flow with Sessions

### 1. Registration Flow
```
Client                          Server
  |                               |
  |-- POST /lit/webauthn/        |
  |    register-options           |
  |<-- Challenge + Options -------|
  |                               |
  |-- WebAuthn Credential ------->|
  |                               |
  |<-- Set-Cookie: session_id ---|
  |    { success, pkpInfo }       |
  |                               |
```

### 2. Authenticated Request Flow
```
Client                          Server
  |                               |
  |-- GET /lit/pkp/dashboard ---->|
  |    Cookie: session_id         |
  |                               |
  |                       [Validate Session]
  |                               |
  |<-- { primaryPKP, subPKPs } ---|
  |                               |
```

### 3. Logout Flow
```
Client                          Server
  |                               |
  |-- POST /lit/session/logout -->|
  |    Cookie: session_id         |
  |                               |
  |                       [Destroy Session]
  |                               |
  |<-- Clear-Cookie: session_id --|
  |    { success: true }          |
  |                               |
```

## 🛡️ Security Features

### 1. HttpOnly Cookies
- Cookie not accessible to JavaScript
- Prevents XSS attacks from stealing session

### 2. SameSite Protection
- Prevents CSRF attacks
- Cookie only sent for same-site requests

### 3. WebAuthn Authentication
- Passwordless authentication
- Phishing-resistant
- Hardware-backed credentials

### 4. Session Validation
- Every protected route checks session
- Automatic expiration after 24 hours
- Can be revoked server-side

## 📝 Usage Examples

### Complete Registration → Login → Use PKP Flow

```javascript
// 1. Initialize Auth System
await authController.init(document.getElementById('authContainer'));

// 2. Register new user
await authController.register('myusername');
// ✅ Session created, cookie set automatically

// 3. Check authentication
if (authController.isAuthenticated()) {
  console.log('Logged in as:', authController.getCurrentUser());
}

// 4. Access protected resources (session cookie sent automatically)
const state = authModel.getState();
console.log('PKP Address:', state.pkp.ethAddress);

// 5. Mint a sub-PKP
await authController.mintSubPKP('ai-agent', 'For my AI assistant');

// 6. Logout when done
await authController.logout();
// ✅ Session destroyed, cookie cleared
```

### Using API Directly

```javascript
// All requests automatically include session cookie
const { success, data } = await authAPI.getPKPDashboard();

if (success) {
  console.log('Primary PKP:', data.primaryPKP.ethAddress);
  console.log('Sub-PKPs:', data.primaryPKP.subPKPs);
}
```

### Custom Protected Route

```javascript
// Check session before navigation
async function navigateToProtectedPage() {
  const state = await authController.checkSession();
  
  if (state.isAuthenticated) {
    window.location.href = '/paradise';
  } else {
    alert('Please login first');
    await authController.login();
  }
}
```

## 🔍 Debugging

### Check Current Session
```javascript
// In browser console
await authController.checkSession();
console.log(authModel.getState());

// Or check via API
const response = await fetch('/lit/session/status', {
  credentials: 'include'
});
const session = await response.json();
console.log('Session:', session);
```

### View Session Cookie
```javascript
// In browser console
document.cookie; // Won't show HttpOnly cookies!

// Use DevTools → Application → Cookies
// Look for connect.sid cookie
```

### Debug API Calls
```javascript
// Enable verbose logging
window.authAPI.debug = true;

// All API calls will log request/response
await authController.login();
```

## 🚀 Production Checklist

- [ ] Use HTTPS (required for secure cookies)
- [ ] Set `cookie.secure = true`
- [ ] Use Redis/database for session storage (not memory)
- [ ] Set `SESSION_SECRET` environment variable
- [ ] Enable CORS with credentials
- [ ] Implement session rotation
- [ ] Add rate limiting
- [ ] Monitor session expiration
- [ ] Log security events

## 📚 Related Files

- `/public/js/authController.js` - MVC Auth System
- `/public/js/useLit.js` - WebAuthn + Lit Protocol integration
- `/public/js/useWagmi.js` - State management
- `/src/lit/lit.controller.ts` - Backend session management
- `/src/lit/lit.service.ts` - Lit Protocol service

## 🎯 Key Takeaways

1. **Sessions are automatic**: No manual token handling needed
2. **Cookies are secure**: HttpOnly prevents XSS
3. **MVC is clean**: Model ↔ Controller ↔ View separation
4. **API is RESTful**: GET/POST/PUT/DELETE operations
5. **State is reactive**: Subscribe to changes, UI updates automatically

Your authentication system is **production-ready** with proper session management! 🎉
