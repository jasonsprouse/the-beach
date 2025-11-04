# Authentication Implementation

This document describes the authentication implementation for The Beach application, following a strong MVC pattern with comprehensive testing.

## Overview

The Beach application implements a secure authentication system using Lit Protocol with WebAuthn. The system allows:

1. **Guest Access**: Users can access the XR environment (`/xr`) without authentication to enjoy basic features like the SoundCloud audio player.
2. **Authenticated Access**: Only authenticated users can load the full Paradise scene with all features.

## Architecture

### MVC Pattern

The application follows the Model-View-Controller (MVC) pattern:

- **Models (Services)**: Handle business logic and data management
  - `LitService`: Manages Lit Protocol authentication and token verification
  - `MockLitService`: Provides mock authentication for testing
  
- **Views**: HTML pages served to users
  - `public/index.html`: Landing page with Register/Login buttons
  - `public/xr-environment.html`: XR environment accessible to all users
  
- **Controllers**: Handle HTTP requests and responses
  - `XrController`: Manages XR environment endpoints
  - `LitController`: Manages Lit Protocol configuration and WebAuthn registration
  - `AppController`: Handles application status
  
- **Guards**: Middleware for authentication
  - `AuthGuard`: Validates authentication tokens before allowing access

### Authentication Flow

#### Landing Page (public/index.html)

The landing page displays three options:
1. **Register with WebAuthn**: Creates a new WebAuthn credential
2. **Login with WebAuthn**: Authenticates with existing credential
3. **Enter Paradise (Guest)**: Access XR environment without authentication

#### Guest Access

- Users can navigate to `/xr` without authentication
- Basic features are available (soundcloud audio, basic scene viewing)
- "Load Paradise" button is visible but requires authentication

#### Authenticated Access

1. User registers/logs in with WebAuthn on the landing page
2. Frontend stores session signatures from Lit Protocol
3. User clicks "Load Paradise" button
4. Frontend sends POST request to `/xr/load-paradise` with Bearer token
5. Backend verifies token via `AuthGuard`
6. If valid, full paradise scene loads

## Backend Implementation

### LitService

Located in `src/lit/lit.service.ts`, this service:

- Provides Lit Protocol configuration
- Verifies authentication tokens by:
  - Parsing session signatures JSON
  - Validating signature structure
  - Checking for required fields (sig, derivedVia, signedMessage)
  
```typescript
async verifyAuthToken(token: string): Promise<boolean>
```

### AuthGuard

Located in `src/auth/auth.guard.ts`, this guard:

- Intercepts HTTP requests to protected endpoints
- Extracts Bearer token from Authorization header
- Validates token format
- Calls `LitService.verifyAuthToken()` to verify token
- Throws `UnauthorizedException` if validation fails

### XrController

Located in `src/xr/xr.controller.ts`, this controller provides:

1. **GET /xr**: Returns XR environment HTML (no authentication required)
2. **POST /xr/load-paradise**: Protected endpoint requiring authentication
3. **GET /xr/info**: Returns environment information

```typescript
@Post('load-paradise')
@UseGuards(AuthGuard)
loadParadise() {
  return {
    success: true,
    message: 'Paradise loading authorized',
    authenticated: true,
  };
}
```

## Frontend Implementation

### Authentication State Management (useWagmi.js)

Simple state management for authentication:
- Stores authentication state (isAuthenticated, pkp, authMethod, sessionSigs)
- Provides subscribe/update/reset methods
- Persists across page navigation

### Lit Protocol Integration (useLit.js)

Handles Lit Protocol operations:
- Initializes Lit Node Client and Auth Client
- Provides `register()` for WebAuthn registration
- Provides `login()` for WebAuthn authentication
- Generates session signatures after successful authentication

### XR Scene (xr-scene.js)

Updated "Load Paradise" button handler:
1. Checks if user is authenticated locally
2. Sends authentication token to backend
3. Verifies authorization with `/xr/load-paradise` endpoint
4. Only loads full scene if backend approves

## Testing

### Test Coverage

Comprehensive tests with authentication mocks:

1. **LitService Tests** (`src/lit/lit.service.spec.ts`)
   - Configuration retrieval
   - Token verification with valid/invalid formats
   - Error handling

2. **MockLitService Tests** (`src/lit/lit.service.mock.spec.ts`)
   - Mock configuration
   - Simple token validation for testing

3. **AuthGuard Tests** (`src/auth/auth.guard.spec.ts`)
   - Valid authorization header handling
   - Missing header rejection
   - Invalid token format rejection
   - Invalid token rejection

4. **XrController Tests** (`src/xr/xr.controller.spec.ts`)
   - Guest access to XR environment
   - Authenticated access to Load Paradise
   - Information endpoint

5. **LitController Tests** (`src/lit/lit.controller.spec.ts`)
   - Configuration endpoint
   - WebAuthn registration verification

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### Mock Usage in Tests

The `MockLitService` is automatically used when `NODE_ENV=test`:

```typescript
const isTest = process.env.NODE_ENV === 'test';
const litServiceProvider = {
  provide: LitService,
  useClass: isTest ? MockLitService : LitService,
};
```

Mock accepts `'valid-token'` and rejects all other tokens.

## Security Considerations

### Current Implementation

- Session signatures validated for structure
- Basic format checking prevents malformed requests
- Authentication required for privileged operations

### Production Enhancements (TODO)

The current implementation provides a foundation but should be enhanced for production:

1. **Cryptographic Verification**: Verify PKP signatures cryptographically
2. **Expiration Checking**: Validate token expiration times
3. **PKP Public Key Verification**: Verify against actual PKP public keys
4. **Resource Ability Validation**: Check resource ability requests
5. **Rate Limiting**: Prevent abuse of authentication endpoints
6. **HTTPS Only**: Enforce secure connections in production
7. **Token Rotation**: Implement session token rotation

## API Endpoints

### Public Endpoints

- `GET /` - Landing page (index.html)
- `GET /xr` - XR environment (guest access)
- `GET /status` - Server status
- `GET /xr/info` - XR environment information
- `GET /lit/config` - Lit Protocol configuration

### Protected Endpoints

- `POST /xr/load-paradise` - Load full paradise scene (requires authentication)

## Environment Variables

- `LIT_NETWORK`: Lit Protocol network (default: 'datil-dev')
- `NODE_ENV`: Environment mode ('test' for testing, 'production' for production)
- `PORT`: Server port (default: 3000)

## Development Workflow

1. Start development server:
   ```bash
   npm run start:dev
   ```

2. Run tests during development:
   ```bash
   npm run test:watch
   ```

3. Build for production:
   ```bash
   npm run build
   npm run start:prod
   ```

## User Experience

### First-Time User

1. Visit landing page
2. Click "Register with WebAuthn"
3. Complete WebAuthn registration
4. Click "Login with WebAuthn"
5. Navigate to XR environment
6. Click "Load Paradise" to access full features

### Returning User

1. Visit landing page
2. Click "Login with WebAuthn"
3. Navigate to XR environment
4. Click "Load Paradise"

### Guest User

1. Visit landing page
2. Click "Enter Paradise (Guest)"
3. Enjoy basic XR features
4. "Load Paradise" button visible but requires authentication

## Troubleshooting

### Authentication Fails

- Check browser console for errors
- Verify WebAuthn is supported in browser
- Ensure Lit Protocol SDK loaded correctly
- Check backend logs for token validation errors

### Tests Fail

- Ensure `NODE_ENV=test` is set
- Clear node_modules and reinstall: `npm ci`
- Check for TypeScript errors: `npm run build`

### Server Won't Start

- Check port 3000 is not in use
- Verify all dependencies installed: `npm install`
- Check for build errors: `npm run build`
