# Navigation Architecture Update

## Overview
This branch integrates the master branch's scene loading architecture with the test branch's WebAuthn authentication improvements.

## Navigation Flow

### Landing Page (`/` or `/public/index.html`)
- **Location**: Root URL (deployed on Vercel: https://the-beach-six.vercel.app/)
- **Purpose**: Authentication and entry point
- **Features**:
  - WebAuthn registration/login with Lit Protocol PKP
  - Session restoration without user gesture
  - Gesture-preserved authentication flows

#### Buttons:
1. **Register with WebAuthn** → Creates new user account
2. **Login with WebAuthn** → Authenticates existing user
3. **Enter Paradise** (for guests) → Navigates to `/paradise` VR scene
4. **Visit Paradise** (for authenticated users) → Navigates to `/paradise` VR scene

### Paradise VR Scene (`/paradise` or `/public/paradise.html`)
- **Location**: `/paradise` route
- **Purpose**: Full Babylon.js XR tropical paradise experience
- **Features**:
  - Lazy-loaded VR scene (click "Load Paradise" to initialize)
  - Multiplayer support via Socket.IO
  - WebXR support for VR headsets
  - SoundCloud audio integration
  - Palm trees, ocean, clouds, decorations
  - Teleportation points

#### Buttons:
1. **Load Paradise** → Initializes the Babylon.js 3D scene
2. **Enter VR** → Starts WebXR immersive session
3. **Reset View** → Resets camera position
4. **← Back to Landing** → Returns to authentication landing page

## State Management

### Session Persistence
- Server-side sessions using Express session middleware
- Session cookies persist across page navigation
- No need to pass state via URL parameters

### Authentication State
- Checked on landing page via `/lit/session/status`
- Available to paradise page via same session cookie
- Future enhancement: Show user info in paradise scene

## Technical Changes

### Backend Routes (xr.controller.ts)
```typescript
@Get()          // Serves xr-environment.html (legacy)
@Get('paradise') // Serves paradise.html (master branch architecture)
@Post('load-paradise') // WebAuthn-protected scene initialization
```

### Frontend Files
- `/public/index.html` - Landing page with auth (test branch features)
- `/public/paradise.html` - VR scene page (master branch structure)
- `/public/js/xr-scene.js` - BabylonXRScene class (master branch)
- `/public/js/useLit.js` - WebAuthn with gesture preservation (test branch fixes)

## WebAuthn Improvements (from test branch)

### Gesture Preservation
- Parallel async operations using `Promise.all()`
- Reduced authentication time from ~500ms to ~100ms
- Explicit user gesture validation with helpful error messages

### Session Restoration
- `initializeLit()` only checks backend connection
- Session status fetched separately without triggering WebAuthn
- No auto-login on page load (prevents gesture expiration)

## Testing Checklist

- [ ] Landing page loads at `/`
- [ ] "Enter Paradise" button navigates to `/paradise`
- [ ] Paradise page shows UI overlay with "Load Paradise" button
- [ ] "Load Paradise" button loads Babylon.js scene
- [ ] WebAuthn registration works without gesture errors
- [ ] WebAuthn login works without gesture errors
- [ ] Session persists across navigation (landing → paradise)
- [ ] "← Back to Landing" button returns to `/`
- [ ] WebXR "Enter VR" works (requires VR headset or emulator)
- [ ] Multiplayer avatars sync across clients
- [ ] SoundCloud audio controls work
- [ ] Server restart preserves registered users

## Migration from Test Branch

This branch maintains all WebAuthn fixes from test branch:
- One-to-one user-to-credential mapping
- Gesture preservation optimizations
- Session restoration improvements
- Helpful error messages

## Deployment Notes

### Vercel Deployment
- Landing page: https://the-beach-six.vercel.app/
- Paradise scene: https://the-beach-six.vercel.app/paradise
- Ensure static assets are served from `/public/` directory
- Session cookies work across routes

### Local Development
```bash
npm run start:dev
# Visit http://localhost:3000
# Paradise at http://localhost:3000/paradise
```
