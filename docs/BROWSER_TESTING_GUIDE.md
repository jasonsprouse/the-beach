# 🧪 Browser Testing Guide - The Beach MVC Authentication System

## Quick Start

I've opened the application at **http://localhost:3000** in the Simple Browser.

### ⚡ Fastest Way to Test Everything

1. **Open DevTools Console** in your browser (F12 or Ctrl+Shift+I)

2. **Load the automated test suite:**
   ```javascript
   // Copy and paste the contents of public/js/test-suite.js into console
   // OR load it by adding script tag to page
   ```

3. **Run all automated tests:**
   ```javascript
   await runAllTests()
   ```

4. **View results** - You'll see a summary like:
   ```
   📊 TEST SUMMARY
   ============================================================
   Total Tests: 15
   ✅ Passed: 13
   ❌ Failed: 0
   ⚠️  Skipped: 2
   ```

---

## 📋 Manual Testing Checklist

### Phase 1: Initial Load ✅
- [x] Server running on http://localhost:3000 (PID 4388)
- [ ] Page loads without errors
- [ ] authController initialized (check console)
- [ ] UI shows Register, Login, Check Session buttons

### Phase 2: Registration Flow 🔐
1. Click **"🔐 Register"** button
2. Enter username (min 3 characters): `testuser_manual`
3. Complete WebAuthn biometric/security key prompt
4. **Expected Results:**
   - [ ] UI auto-updates to authenticated state
   - [ ] Welcome message shows: "👋 Welcome, testuser_manual!"
   - [ ] PKP wallet card displays with address
   - [ ] Sub-PKPs count shows 3
   - [ ] Buttons change to: Visit Paradise, Refresh, Sign Out
   - [ ] Console shows PKP address generated

### Phase 3: Authenticated Actions 🎯
1. Click **"🔄 Refresh"** button
   - [ ] PKP dashboard data refreshes
   - [ ] Last synced timestamp updates
   - [ ] Console shows API call to /lit/pkp/dashboard

2. Click **"🌴 Visit Paradise"** button
   - [ ] Navigates to /paradise page
   - [ ] Session persists (still authenticated)
   - [ ] Paradise page loads

3. Return to landing page (navigate to /)
   - [ ] Still authenticated (no re-login needed)

4. Click **"🚪 Sign Out"** button
   - [ ] UI returns to unauthenticated state
   - [ ] Buttons change back to Register, Login, Check Session
   - [ ] PKP wallet card disappears

### Phase 4: Login Flow 🔑
1. Click **"🔐 Login"** button (after signing out)
2. Complete WebAuthn authentication
   - [ ] UI auto-updates to authenticated state
   - [ ] Same user data displays
   - [ ] No re-registration needed

### Phase 5: Check Session 🔍
1. Click **"🔍 Check Session"** button
   - [ ] Console shows session status
   - [ ] Status message appears in UI
   - [ ] Network tab shows GET /lit/session/status

### Phase 6: Paradise Scene 🌴
1. Navigate to http://localhost:3000/paradise
2. Click **"Load Paradise"** button
   - [ ] 3D scene loads (Babylon.js)
   - [ ] Beach environment visible
   - [ ] Ocean waves animated
   - [ ] Palm trees render
   - [ ] Wallet info overlay visible (if authenticated)
   - [ ] Shows username, PKP address, sub-PKP count

### Phase 7: Session Persistence 🍪
1. **Hard refresh** the page (Ctrl+Shift+R)
   - [ ] Session persists
   - [ ] Still authenticated after reload
   - [ ] No re-login needed

2. **Check cookies** in DevTools → Application → Cookies
   - [ ] `connect.sid` cookie present
   - [ ] Cookie has HttpOnly attribute
   - [ ] Cookie has SameSite attribute

3. **Navigate between pages**
   - [ ] Go to / → /paradise → /
   - [ ] Authentication maintained
   - [ ] Cookie persists

---

## 🖱️ All Interactive Buttons

### Unauthenticated State Buttons:
| Button | ID | Action | Expected Result |
|--------|------|--------|-----------------|
| 🔐 Register | `btnRegister` | Opens registration flow | WebAuthn prompt → PKP generation → UI update |
| 🔐 Login | `btnLogin` | Opens login flow | WebAuthn authentication → UI update |
| 🔍 Check Session | `btnCheckSession` | Checks current session | Shows session status in UI |

### Authenticated State Buttons:
| Button | ID | Action | Expected Result |
|--------|------|--------|-----------------|
| 🌴 Visit Paradise | `btnVisitParadise` | Navigate to paradise | Go to /paradise page |
| 🔄 Refresh | `btnRefreshSession` | Refresh session/PKP data | Update PKP dashboard, timestamp |
| 🚪 Sign Out | `btnSignOut` | Logout | Clear session, UI returns to unauthenticated |

### Navigation Buttons:
| Button | Location | Action |
|--------|----------|--------|
| Features | Nav bar | Scroll to #features |
| Paradise | Nav bar | Scroll to #paradise or navigate |
| 🎭 Demo Auth | Nav bar | Go to /demo-auth.html |
| Debug | Nav bar | Go to /test-webauthn.html |
| View on GitHub | About section | Open GitHub repo |

---

## 🧪 Console Test Commands

### Check MVC Components Loaded:
```javascript
// Should return object with methods
window.authController

// Should return state object
authModel.getState()

// Should return object with request methods
authAPI

// Should return object with render methods
authView
```

### Test Authentication State:
```javascript
// Get current state
const state = authModel.getState();
console.log('Authenticated:', state.isAuthenticated);
console.log('Current User:', state.currentUser);
console.log('PKP Address:', state.pkp?.ethAddress);
```

### Test API Endpoints:
```javascript
// Check session status
await authAPI.getSessionStatus()

// Get PKP dashboard (requires authentication)
await authAPI.getPKPDashboard()

// Mint new sub-PKP (requires authentication)
await authController.mintSubPKP('test-purpose', 'Test sub-PKP')
```

### Test Observable Pattern:
```javascript
// Subscribe to state changes
const unsubscribe = authModel.subscribe((newState) => {
  console.log('🔔 State changed:', newState);
});

// Trigger change (for testing)
authModel.setState({ testProperty: 'test_value' });

// Cleanup
unsubscribe();
```

### Test Button Clicks Programmatically:
```javascript
// Unauthenticated
document.getElementById('btnRegister')?.click()
document.getElementById('btnLogin')?.click()
document.getElementById('btnCheckSession')?.click()

// Authenticated
document.getElementById('btnVisitParadise')?.click()
document.getElementById('btnRefreshSession')?.click()
document.getElementById('btnSignOut')?.click()
```

---

## 🔍 Network Request Verification

### DevTools Network Tab Checks:

1. **Registration Request:**
   ```
   POST /lit/webauthn/register-options
   - Request includes: { username: "..." }
   - Response includes: challenge, rpId, timeout
   
   POST /lit/webauthn/verify-registration
   - Request includes: WebAuthn credential
   - Response includes: { success: true, pkpAddress: "0x..." }
   ```

2. **Session Check:**
   ```
   GET /lit/session/status
   - Headers include: Cookie: connect.sid=...
   - Response: { authenticated: true/false, user: {...} }
   ```

3. **PKP Dashboard:**
   ```
   GET /lit/pkp/dashboard
   - Headers include: Cookie: connect.sid=...
   - Response: { primaryPKP: { ethAddress, subPKPs: [...] } }
   ```

4. **Logout:**
   ```
   POST /lit/session/logout
   - Headers include: Cookie: connect.sid=...
   - Response: { message: "Logged out successfully" }
   ```

### Verify Cookie Inclusion:
All authenticated requests should include:
```
Cookie: connect.sid=s%3A...
```

---

## ✅ Expected Behaviors Checklist

### UI Reactivity:
- [ ] UI updates automatically on state changes
- [ ] No manual page refresh needed
- [ ] Button visibility changes based on auth state
- [ ] Loading states show during API calls

### Session Management:
- [ ] Session persists across page navigation
- [ ] Hard refresh maintains authentication
- [ ] Logout clears session completely
- [ ] No manual token management needed

### Authentication Flow:
- [ ] Registration creates new PKP with 3 sub-PKPs
- [ ] Login uses existing credentials
- [ ] WebAuthn prompts appear correctly
- [ ] PKP addresses displayed truncated (0x1234...5678)

### API Calls:
- [ ] All requests include session cookie automatically
- [ ] 401 errors after logout
- [ ] Error messages display in UI
- [ ] Network requests succeed with proper auth

### Performance:
- [ ] State access < 100ms
- [ ] UI updates smooth and instant
- [ ] No memory leaks from observers
- [ ] No console errors

---

## 🐛 Troubleshooting

### Issue: "authController is not defined"
**Solution:** Hard refresh browser (Ctrl+Shift+R) to load new JavaScript files

### Issue: "Session not persisting"
**Solution:** Check DevTools → Application → Cookies for `connect.sid`

### Issue: "UI not updating after auth"
**Solution:** Check console for state change notifications, verify observers attached

### Issue: "401 Unauthorized on API calls"
**Solution:** Ensure authenticated first, check cookie is being sent

### Issue: "WebAuthn prompt not appearing"
**Solution:** Ensure HTTPS or localhost, check browser WebAuthn support

---

## 📊 Server Logs to Monitor

While testing, watch the terminal for:

```
✅ Registration successful for: <username>
🔑 Generating PKP for user: <username>
🔑 Generated deterministic PKP address: 0x...
🔧 Generated sub-PKP (ai-build#0): 0x...
🔧 Generated sub-PKP (ai-build#1): 0x...
🔧 Generated sub-PKP (session#0): 0x...

Authentication request for username: <username>
User authenticators for <username>: 1

Setting WebAuthn permissions headers
```

---

## 🎯 Success Criteria

✅ **Test passes if:**
1. All buttons visible and clickable
2. Registration creates PKP with 3 sub-PKPs
3. Login works with existing credentials
4. UI automatically updates on state changes
5. Session persists across navigation
6. Paradise page loads with wallet overlay
7. Logout clears session completely
8. All API calls include session cookie
9. No console errors
10. Network requests succeed

---

## 📝 Quick Command Reference

```javascript
// === AUTOMATED TESTING ===
await runAllTests()              // Run full test suite

// === MANUAL TESTING ===
testAllButtons()                 // Show available buttons
await testRegistration('myuser') // Test registration
await testLogin()                // Test login
await testLogout()               // Test logout

// === STATE INSPECTION ===
authModel.getState()             // View current state
authController                   // View controller methods

// === API TESTING ===
await authAPI.getSessionStatus()
await authAPI.getPKPDashboard()
await authController.refreshSession()

// === BUTTON CLICKING ===
document.getElementById('btnRegister').click()
document.getElementById('btnLogin').click()
document.getElementById('btnSignOut').click()
```

---

## 🚀 Next Steps After Testing

1. **Document any issues found** in GitHub issues
2. **Take screenshots** of successful flows
3. **Record screen** of paradise scene loading
4. **Test on different browsers** (Chrome, Firefox, Safari)
5. **Test on mobile devices** (if available)
6. **Test with different WebAuthn methods** (fingerprint, face, security key)

---

## 📁 Test Artifacts

- **Test Suite:** `public/js/test-suite.js` (automated tests)
- **Testing Guide:** `docs/TESTING_GUIDE.md` (step-by-step)
- **Manual Results:** `docs/MANUAL_TESTING_RESULTS.md` (detailed checklist)
- **Session Docs:** `docs/SESSION_MANAGEMENT.md` (architecture)

---

## 💡 Pro Tips

1. **Keep DevTools open** to see real-time console logs
2. **Watch Network tab** to verify cookie inclusion
3. **Check Application tab** for cookie details
4. **Use automated tests first** then manual verification
5. **Test one flow completely** before moving to next
6. **Clear cookies** between tests for clean state
7. **Monitor server terminal** for backend confirmations

---

**Ready to test! 🎉**

Server is running at http://localhost:3000
Browser is open at http://localhost:3000
DevTools recommended: F12 or Ctrl+Shift+I

Start with: `await runAllTests()` in console
