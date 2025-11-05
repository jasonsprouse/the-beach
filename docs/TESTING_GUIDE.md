# MVC Authentication System - Testing Guide

## ✅ Current Status
Your server is running successfully with these confirmations from logs:
- ✅ Server running on http://localhost:3000 (PID 4388)
- ✅ Lit Protocol connected to bootstrap nodes
- ✅ WebAuthn permissions headers configured
- ✅ Multiple successful `testuser` registrations with PKP generation
- ✅ Last PKP generated: `0x245ea7bc89d340d7d5ecddaff6623f04138b241e`
- ✅ Sub-PKPs created successfully (ai-build#0, ai-build#1, session#0)

## 🧪 Testing Checklist

### Phase 1: MVC Controller Initialization
1. **Hard refresh browser** (IMPORTANT!)
   - Press `Ctrl+Shift+R` (Linux/Windows) or `Cmd+Shift+R` (Mac)
   - This ensures new `authController.js` loads
   
2. **Open DevTools Console** (`F12` or `Ctrl+Shift+I`)
   
3. **Verify controller loaded**
   ```javascript
   // Run in console - should see object with init(), register(), login(), etc.
   window.authController
   ```

4. **Check initial state**
   ```javascript
   // Should show authentication state
   authModel.getState()
   ```

5. **Look for initialization log**
   - Should see: `🚀 Initializing Auth Controller...` in console

### Phase 2: Session Cookie Verification
1. **Open DevTools → Application Tab**
2. **Navigate to Cookies → http://localhost:3000**
3. **Look for `connect.sid` cookie**
   - Should see HttpOnly, SameSite attributes
   - If you already registered/logged in, this will exist

### Phase 3: Full Authentication Flow

#### Register New User
```javascript
// Test registration flow
authController.register('testuser3')
// Complete biometric/security key prompt
// UI should auto-update to show PKP wallet card
```

#### Check PKP Dashboard
```javascript
// After registration, fetch PKP info
await authController.fetchPKPDashboard()
// Should display Primary PKP address and sub-PKP count
```

#### Test Session Persistence
```javascript
// Check if session is valid
await authController.checkSession()
// Should return current user state
```

#### Logout
```javascript
// Clear session
await authController.logout()
// UI should return to unauthenticated view
```

### Phase 4: RESTful API Testing

After authenticating, test all API methods:

```javascript
// GET - Session Status
const sessionStatus = await authAPI.getSessionStatus();
console.log('Session:', sessionStatus);

// GET - PKP Dashboard
const pkpDashboard = await authAPI.getPKPDashboard();
console.log('PKP Dashboard:', pkpDashboard);

// POST - Mint Sub-PKP
const newSubPKP = await authController.mintSubPKP('test-purpose', 'Test sub-PKP');
console.log('New Sub-PKP:', newSubPKP);

// Verify sub-PKP count increased
await authController.fetchPKPDashboard();

// POST - Logout
await authAPI.logoutUser();
console.log('Logged out');
```

### Phase 5: Paradise Scene Wallet Display

1. **Authenticate on landing page first**
2. **Navigate to `/paradise`** or click "Visit Paradise"
3. **Click "Load Paradise" button**
4. **Wait for scene initialization**
5. **Check #walletInfo element**
   - Should be visible (not `display: none`)
   - Should show:
     - Username
     - PKP address (truncated: 0x245e...241e)
     - Sub-PKP count (should be 3)
     - Sub-PKP list with purposes (ai-build#0, ai-build#1, session#0)

### Phase 6: Network Request Verification

1. **Open DevTools → Network Tab**
2. **Perform any authenticated action** (register, check session, fetch dashboard)
3. **Click on request → Headers**
4. **Verify Request Headers include:**
   ```
   Cookie: connect.sid=s%3A...
   ```
5. **Response should NOT be 401 Unauthorized**

## 🎯 Expected Behaviors

### Successful MVC Controller
- ✅ UI automatically updates on state changes
- ✅ No manual token management needed
- ✅ Session cookie automatically included in all requests
- ✅ Observable pattern notifies view of state updates
- ✅ All CRUD operations work: GET/POST/PUT/DELETE

### Successful Wallet Display
- ✅ Landing page shows PKP wallet card after authentication
- ✅ Paradise scene shows wallet info overlay (top-left)
- ✅ PKP address truncated for readability
- ✅ Sub-PKP list displays with purpose labels
- ✅ Wallet info hides on logout

### Successful Session Management
- ✅ Session persists across page navigation
- ✅ Hard refresh preserves authentication (cookie still valid)
- ✅ Logout clears session completely
- ✅ 401 errors after logout

## 🐛 Troubleshooting

### Controller Not Found
**Symptom:** `Uncaught ReferenceError: authController is not defined`

**Fix:**
```bash
# Hard refresh browser (Ctrl+Shift+R)
# Or clear cache: DevTools → Application → Clear storage
```

### Session Cookie Not Sent
**Symptom:** API calls return 401 Unauthorized

**Check:**
```javascript
// Verify credentials: 'include' in fetch
authAPI.defaultOptions
// Should show: { credentials: 'include' }
```

### Wallet Info Not Displaying
**Symptom:** #walletInfo element stays hidden

**Debug:**
```javascript
// Check authentication state
const litInstance = window.useLit();
const state = litInstance.getAuthenticationState();
console.log('Auth State:', state);

// Check localStorage
console.log('PKP Address:', localStorage.getItem('pkp_primary_address'));

// Manually trigger display
await window.displayAuthState();
```

### PKP Dashboard Empty
**Symptom:** Sub-PKP count is 0

**Verify backend:**
```bash
# Check server logs for PKP generation
# Should see lines like:
# 🔧 Generated sub-PKP for testuser (ai-build#0): 0x...
# 🔧 Generated sub-PKP for testuser (ai-build#1): 0x...
# 🔧 Generated sub-PKP for testuser (session#0): 0x...
```

## 📊 Verification Checklist

Mark each as you test:

- [ ] authController loads in browser console
- [ ] authModel.getState() returns state object
- [ ] connect.sid cookie appears in Application tab
- [ ] Registration triggers WebAuthn prompt
- [ ] UI auto-updates to authenticated view after registration
- [ ] PKP wallet card displays with address
- [ ] Sub-PKP count shows 3
- [ ] "Refresh" button updates dashboard data
- [ ] Network requests include Cookie header
- [ ] Paradise scene loads with wallet overlay
- [ ] Wallet info shows in XR scene (top-left)
- [ ] Logout clears UI and returns to unauthenticated view
- [ ] Session check after logout returns 401

## 🎉 Success Criteria

**You've succeeded when:**
1. ✅ MVC controller initializes automatically
2. ✅ UI updates reactively on all state changes
3. ✅ No manual cookie/token management needed
4. ✅ All API calls work with automatic session inclusion
5. ✅ Wallet info displays on both landing and paradise pages
6. ✅ Session persists across navigation
7. ✅ Logout completely clears authentication state

## 🚀 Next Steps After Testing

Once all tests pass:

```bash
# Commit your changes
git add public/js/authController.js \
        public/index.html \
        public/paradise.html \
        public/js/xr-scene.js \
        docs/SESSION_MANAGEMENT.md \
        docs/TESTING_GUIDE.md

git commit -m "feat: Implement MVC authentication with automatic session management

- Add authController.js with complete MVC architecture
- Model: Observable state with reactive updates
- View: Conditional rendering for auth states
- Controller: Business logic with REST operations
- API: RESTful client with automatic cookie handling
- Enhanced PKP wallet display on landing and paradise pages
- Document session cookie architecture and security
- All CRUD operations: GET/POST/PUT/DELETE
- No manual token management needed"

# Optional: Push to remote
git push origin feature/master-scene-integration
```

## 📝 Testing Notes

**Your Current State:**
- Server logs show successful WebAuthn registrations
- PKP generation working (last: 0x245ea7bc89d340d7d5ecddaff6623f04138b241e)
- Sub-PKPs created successfully (3 per user)
- Lit Protocol connected to network

**Ready for browser testing!** 🎉
