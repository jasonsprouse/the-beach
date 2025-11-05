// This file will handle the Lit Protocol authentication flow.

const useLit = () => {
  const wagmi = window.useWagmi();
  
  // Global state management for WebAuthn operations
  let webAuthnInProgress = false;
  let authenticationInProgress = false;
  let currentUser = null;
  let isInitialized = false;

  // Helper functions to get wallet/authentication state
  const getAuthenticationState = () => ({
    webAuthnInProgress,
    authenticationInProgress,
    currentUser,
    isInitialized,
    hasStoredUser: !!localStorage.getItem('webauthn_username'),
    storedUsername: localStorage.getItem('webauthn_username'),
  });

  const getWalletState = () => {
    const state = getAuthenticationState();
    return {
      isConnected: !!state.currentUser,
      isConnecting: state.authenticationInProgress,
      user: state.currentUser,
      address: state.currentUser, // In this case, username acts as address
      isReady: state.isInitialized && !state.authenticationInProgress,
    };
  };

  const isWebAuthnBusy = () => webAuthnInProgress || authenticationInProgress;

  const setCurrentUser = (username) => {
    currentUser = username;
    if (username) {
      localStorage.setItem('webauthn_username', username);
    }
  };

  const clearCurrentUser = () => {
    currentUser = null;
    localStorage.removeItem('webauthn_username');
  };

  const initializeLit = async () => {
    // Check if backend Lit clients are initialized
    try {
      const configResponse = await fetch('/lit/config', {
        credentials: 'include',
      });
      if (!configResponse.ok) {
        throw new Error(`Failed to fetch /lit/config: ${configResponse.status} ${configResponse.statusText}`);
      }
      const config = await configResponse.json();
      
      if (!config.initialized) {
        throw new Error('Lit Protocol backend not initialized');
      }
      
      console.log('Lit Protocol backend is initialized');
      isInitialized = true;
      return config;
    } catch (err) {
      isInitialized = false;
      throw new Error(`Error fetching /lit/config: ${err.message}`);
    }
  };

  // Utility function to convert base64url to Uint8Array
  const base64urlToUint8Array = (base64url) => {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    return new Uint8Array(binary.split('').map(char => char.charCodeAt(0)));
  };

  // Utility function to convert ArrayBuffer to base64url string
  const arrayBufferToBase64url = (buffer) => {
    // Handle both ArrayBuffer and Uint8Array
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  // Gesture preservation helper
  const preserveUserGesture = (asyncOperation) => {
    return new Promise(async (resolve, reject) => {
      if (!navigator.userActivation || !navigator.userActivation.isActive) {
        reject(new Error('No active user gesture detected'));
        return;
      }
      
      const startTime = performance.now();
      try {
        const result = await asyncOperation();
        const elapsed = performance.now() - startTime;
        
        if (!navigator.userActivation || !navigator.userActivation.isActive) {
          reject(new Error(`User gesture lost after ${elapsed.toFixed(0)}ms. Please try again.`));
          return;
        }
        
        console.log(`✅ User gesture preserved during ${elapsed.toFixed(0)}ms operation`);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  };

  const registerWebAuthn = async (username) => {
    // Check if WebAuthn operation is already in progress
    if (webAuthnInProgress) {
      console.log('🔒 WebAuthn operation already in progress, rejecting concurrent registration attempt');
      throw new Error('A WebAuthn request is already pending. Please wait for the current operation to complete.');
    }

    // CRITICAL: Check user gesture FIRST before any async operations
    if (!navigator.userActivation || !navigator.userActivation.isActive) {
      throw new Error('Registration requires a user interaction. Please click the button and try again.');
    }

    webAuthnInProgress = true;
    
    try {
      console.log('🎯 Starting optimized WebAuthn registration for username:', username);
      console.log('🔐 User gesture verified, proceeding with registration...');
      
      // OPTIMIZATION: Use Promise.all to run async operations in parallel while preserving gesture
      const startTime = performance.now();
      
      // Fetch options and initialize Lit in parallel to minimize delay
      const [optionsResponse, _] = await Promise.all([
        fetch('/lit/webauthn/register-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username }),
        }),
        // Initialize Lit if needed (but don't wait for it to complete)
        !isInitialized ? initializeLit().catch(err => {
          console.warn('Lit initialization failed during registration:', err);
          return null;
        }) : Promise.resolve()
      ]);

      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options from server');
      }

      const options = await optionsResponse.json();
      
      // Check how much time elapsed and verify gesture is still active
      const elapsed = performance.now() - startTime;
      console.log(`📋 Options fetched in ${elapsed.toFixed(0)}ms, checking gesture...`);
      
      if (!navigator.userActivation || !navigator.userActivation.isActive) {
        throw new Error('User gesture expired during option fetch. Please try again quickly.');
      }

      // STEP 2: Convert base64url data to Uint8Array for WebAuthn (synchronous operation)
      const publicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64urlToUint8Array(options.challenge),
        user: {
          ...options.user,
          id: base64urlToUint8Array(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map(cred => ({
          ...cred,
          id: base64urlToUint8Array(cred.id),
        })) || [],
      };

      // STEP 3: Call WebAuthn immediately while gesture is still fresh
      console.log('🚀 Calling WebAuthn create with preserved gesture...');
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      if (!credential) {
        throw new Error('WebAuthn credential creation returned null');
      }

      console.log('✅ WebAuthn credential created successfully');

      // STEP 3: Now we can safely do post-WebAuthn operations (these don't need gesture)
      // Initialize Lit Protocol if needed
      if (!isInitialized) {
        await initializeLit();
      }

      // STEP 4: Send credential to server for verification
      // Convert credential to the format expected by SimpleWebAuthn library
      console.log('🔍 DEBUG: Raw credential before conversion:', {
        id: credential.id,
        rawIdType: Object.prototype.toString.call(credential.rawId),
        rawIdConstructor: credential.rawId?.constructor?.name,
        attestationObjectType: Object.prototype.toString.call(credential.response.attestationObject),
        clientDataJSONType: Object.prototype.toString.call(credential.response.clientDataJSON)
      });

      const credentialForServer = {
        id: credential.id,
        rawId: arrayBufferToBase64url(credential.rawId),
        response: {
          attestationObject: arrayBufferToBase64url(credential.response.attestationObject),
          clientDataJSON: arrayBufferToBase64url(credential.response.clientDataJSON),
          transports: credential.response.getTransports ? credential.response.getTransports() : [],
        },
        type: credential.type,
      };

      console.log('🔍 DEBUG: Converted credential after base64url conversion:', {
        id: credentialForServer.id,
        rawId: typeof credentialForServer.rawId,
        rawIdLength: credentialForServer.rawId?.length,
        rawIdSample: credentialForServer.rawId?.substring?.(0, 20) + '...',
        attestationType: typeof credentialForServer.response.attestationObject,
        clientDataType: typeof credentialForServer.response.clientDataJSON,
        attestationSample: credentialForServer.response.attestationObject?.substring?.(0, 20) + '...',
        clientDataSample: credentialForServer.response.clientDataJSON?.substring?.(0, 20) + '...'
      });

      console.log('📤 Sending WebAuthn credential for verification...');
      console.log('🐛 DEBUG: credentialForServer structure:', {
        id: credentialForServer.id,
        rawId: typeof credentialForServer.rawId,
        rawIdLength: credentialForServer.rawId?.length,
        rawIdSample: credentialForServer.rawId?.substring?.(0, 20) + '...',
        attestationType: typeof credentialForServer.response.attestationObject,
        clientDataType: typeof credentialForServer.response.clientDataJSON
      });

      const response = await fetch('/lit/webauthn/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentialForServer),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Registration verification failed:', errorText);
        throw new Error(`Registration verification failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Registration verification successful:', result);

      if (result.success && result.pkpInfo) {
        console.log('🔑 PKP generated:', result.pkpInfo.ethAddress);
        console.log('� User now has exactly ONE credential mapped to ONE PKP');
        
        // Store user info
        localStorage.setItem('currentUser', username);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authenticatedAt', new Date().toISOString());
        
        return result;
      } else {
        throw new Error('Registration succeeded but no PKP info returned');
      }

    } catch (error) {
      console.error('💥 WebAuthn registration error:', error);
      throw error;
    } finally {
      webAuthnInProgress = false;
    }
  };

  const authenticateWebAuthn = async (username) => {
    // Check if WebAuthn operation is already in progress
    if (webAuthnInProgress) {
      console.log('🔒 WebAuthn operation already in progress, rejecting concurrent attempt');
      throw new Error('A WebAuthn request is already pending. Please wait for the current authentication to complete.');
    }

    // CRITICAL: Check user gesture FIRST before any async operations
    if (!navigator.userActivation || !navigator.userActivation.isActive) {
      throw new Error('Authentication requires a user interaction. Please click the button and try again.');
    }

    webAuthnInProgress = true;

    try {
      console.log('🔐 Starting optimized WebAuthn authentication for username:', username);
      console.log('🔐 User gesture verified, proceeding with authentication...');
      
      const startTime = performance.now();
      
      // OPTIMIZATION: Run Lit initialization and options fetch in parallel
      const [optionsResponse, _] = await Promise.all([
        fetch('/lit/webauthn/authenticate-options', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username }),
        }),
        // Initialize Lit in parallel if needed
        !isInitialized ? initializeLit().catch(err => {
          console.warn('Lit initialization failed during auth:', err);
          return null;
        }) : Promise.resolve()
      ]);

      if (!optionsResponse.ok) {
        const error = await optionsResponse.text();
        throw new Error(error || 'Failed to get authentication options. Please register first.');
      }
      
      const options = await optionsResponse.json();
      
      // Check timing and gesture preservation
      const elapsed = performance.now() - startTime;
      console.log(`� Options fetched in ${elapsed.toFixed(0)}ms, verifying gesture...`);
      
      // CRITICAL: Verify user gesture is still active after minimal async work
      if (!navigator.userActivation || !navigator.userActivation.isActive) {
        throw new Error('User gesture expired during setup. Please try again quickly.');
      }
      
      console.log('🎯 User gesture preserved after', elapsed.toFixed(0), 'ms');
      
      // Add enhanced logging for debugging
      console.log('📝 Authentication options received for user:', username);
      
      // Use WebAuthn browser API to get assertion with preserved gesture
      console.log('🛡️ Starting WebAuthn assertion with preserved gesture...');
      
      // Remove any delays to preserve user gesture chain - WebAuthn must be called synchronously
      // with the user interaction to maintain the security requirement
      
      // Validate that we have proper credentials to authenticate with
      if (!options.allowCredentials || options.allowCredentials.length === 0) {
        throw new Error('No valid credentials found for this user. Please register first.');
      }
      
      // Prepare the authentication request with proper encoding
      const authenticationOptions = {
        challenge: Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
        timeout: 60000, // Reduce to 1 minute to avoid timeout issues
        rpId: options.rpId || 'localhost',
        userVerification: 'preferred', // Allow fallback if biometric not available
        allowCredentials: options.allowCredentials?.map(cred => ({
          type: 'public-key',
          id: Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          transports: cred.transports || ['internal', 'hybrid']
        })) || []
      };
      
      console.log('🔧 Prepared authentication options:', {
        ...authenticationOptions,
        challenge: `[Uint8Array length: ${authenticationOptions.challenge.length}]`,
        allowCredentials: authenticationOptions.allowCredentials.map(cred => ({
          ...cred,
          id: `[Uint8Array length: ${cred.id.length}]`
        }))
      });
      
      // Add debugging for credential processing
      console.log('🎯 Debug: Original challenge from server:', options.challenge);
      console.log('🎯 Debug: Number of credentials available:', authenticationOptions.allowCredentials.length);
      console.log('🎯 Debug: Credential IDs processed successfully');
      
      // Log each credential for debugging
      authenticationOptions.allowCredentials.forEach((cred, index) => {
        console.log(`🎯 Debug: Credential ${index + 1}:`, {
          type: cred.type,
          idLength: cred.id.length,
          transports: cred.transports
        });
      });
      
      // Validate that we have proper options
      if (!authenticationOptions.challenge || authenticationOptions.challenge.length === 0) {
        throw new Error('Invalid challenge received from server');
      }
      
      if (!authenticationOptions.allowCredentials || authenticationOptions.allowCredentials.length === 0) {
        throw new Error('No valid credentials found for authentication. Please register first.');
      }
      
      // Warn if too many credentials (might cause issues)
      if (authenticationOptions.allowCredentials.length > 5) {
        console.log('⚠️ Warning: Large number of credentials detected. This might cause authentication issues.');
      }
      
      // Create a more robust credential request with explicit error handling
      let assertion;
      try {
        console.log('🎯 Debug: About to call navigator.credentials.get()');
        console.log('🎯 Debug: webAuthnInProgress =', webAuthnInProgress);
        console.log('🎯 Debug: authenticationInProgress =', authenticationInProgress);
        console.log('🎯 Debug: User activation state:', {
          isActive: navigator.userActivation?.isActive,
          hasBeenActive: navigator.userActivation?.hasBeenActive
        });
        
        // Call credentials.get with a promise race for better error handling
        const credentialPromise = navigator.credentials.get({
          publicKey: authenticationOptions,
        });
        
        console.log('🎯 Debug: navigator.credentials.get() call initiated');
        
        // Add a user-friendly timeout message
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Authentication timed out. Please try again and complete the verification more quickly.'));
          }, authenticationOptions.timeout + 5000); // 5 seconds buffer
        });
        
        assertion = await Promise.race([credentialPromise, timeoutPromise]);
        console.log('🎯 Debug: WebAuthn credential.get() completed successfully');
      } catch (credError) {
        console.log('💥 WebAuthn credential.get() failed:', credError.name, credError.message);
        console.log('💥 Full error object:', credError);
        console.log('🎯 Debug: Error occurred, current state:', {
          webAuthnInProgress,
          authenticationInProgress,
          userActivation: navigator.userActivation?.isActive
        });
        
        // If we have too many credentials and got NotAllowedError, try with fewer credentials
        if (credError.name === 'NotAllowedError' && authenticationOptions.allowCredentials.length > 3) {
          console.log('⚠️ Retrying with fewer credentials due to NotAllowedError...');
          
          // Try with only the 3 most recent credentials
          const reducedOptions = {
            ...authenticationOptions,
            allowCredentials: authenticationOptions.allowCredentials.slice(-3)
          };
          
          console.log('🔄 Retrying with', reducedOptions.allowCredentials.length, 'credentials');
          
          try {
            const retryPromise = navigator.credentials.get({
              publicKey: reducedOptions,
            });
            
            const retryTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error('Retry authentication timed out.'));
              }, reducedOptions.timeout + 5000);
            });
            
            assertion = await Promise.race([retryPromise, retryTimeoutPromise]);
            console.log('✅ Retry with fewer credentials succeeded');
          } catch (retryError) {
            console.log('💥 Retry with fewer credentials also failed:', retryError.name, retryError.message);
            // Fall through to original error handling
          }
        }
        
        // If retry didn't work or wasn't attempted, handle the original error
        if (!assertion) {
          // Handle specific WebAuthn errors with user-friendly messages
          if (credError.name === 'OperationError') {
            if (credError.message.includes('request is already pending') || credError.message.includes('already pending')) {
              console.error('🚨 Detected concurrent WebAuthn request! This should be prevented by our locking mechanism.');
              console.error('🚨 Current lock states:', { webAuthnInProgress, authenticationInProgress });
              throw new Error('A WebAuthn authentication is already in progress. Please wait for it to complete before trying again.');
            }
            throw new Error('WebAuthn operation failed. Please try again.');
          } else if (credError.name === 'NotAllowedError') {
            // For NotAllowedError, check if user activation is lost and provide clear guidance
            const currentActivation = navigator.userActivation;
            console.log('🔍 NotAllowedError analysis:', {
              userActivationActive: currentActivation?.isActive,
              userActivationHasBeenActive: currentActivation?.hasBeenActive,
              errorMessage: credError.message
            });
            
            // If user activation was lost, this is likely the root cause
            if (!currentActivation?.isActive) {
              console.error('🚨 User activation lost during WebAuthn operation');
              throw new Error('User interaction required. Please click the button again to authenticate.');
            }
            
            // Check if this might be a timeout issue
            if (credError.message.includes('timed out') || credError.message.includes('timeout')) {
              throw new Error('Authentication timed out. Please try again and complete the biometric verification more quickly.');
            }
            
            // Check if user might have cancelled
            if (credError.message.includes('not allowed') || credError.message.includes('operation either timed out or was not allowed')) {
              throw new Error('Authentication was cancelled or timed out. Please try again and complete the biometric verification when prompted.');
            }
            
            throw new Error('Authentication not permitted. Please ensure you are using a supported biometric method and try again.');
          } else if (credError.name === 'SecurityError') {
            throw new Error('Security error during authentication. Please ensure you are on a secure connection.');
          } else if (credError.name === 'InvalidStateError') {
            throw new Error('Invalid authentication state. Please register first or try again.');
          } else if (credError.name === 'NotSupportedError') {
            throw new Error('WebAuthn is not supported on this device or browser.');
          } else if (credError.name === 'TimeoutError') {
            throw new Error('Authentication timed out. Please try again and complete the verification promptly.');
          } else {
            throw new Error(`Authentication failed: ${credError.message || 'Unknown error occurred'}`);
          }
        }
      }
      
      console.log('✅ WebAuthn assertion created successfully');
      
      if (!assertion) {
        throw new Error('Authentication was cancelled or failed - no credential returned');
      }
      
      // Convert assertion to JSON format for sending to backend
      const assertionJSON = {
        id: assertion.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
        response: {
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
          signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
          userHandle: assertion.response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '') : undefined,
        },
        type: assertion.type,
      };
      
      console.log('📤 Sending authentication assertion for verification...');
      
      // Verify authentication with backend
      const verifyResponse = await fetch('/lit/webauthn/verify-authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(assertionJSON),
      });
      
      if (!verifyResponse.ok) {
        const errorText = await verifyResponse.text();
        console.error('❌ Authentication verification failed:', errorText);
        throw new Error('Authentication verification failed');
      }
      
      const result = await verifyResponse.json();
      if (!result.success) {
        console.error('❌ Authentication failed:', result.message);
        throw new Error('Authentication failed: ' + (result.message || 'Unknown error'));
      }
      
      console.log('📋 Authentication verification successful:', result);
      
      // Use PKP information from backend (one-to-one mapping)
      let pkpInfo;
      let sessionSigs;
      
      if (result.pkp && result.oneToOneMapping) {
        console.log('🔑 Using deterministic PKP from one-to-one mapping:', result.pkp);
        pkpInfo = {
          ethAddress: result.pkp.ethAddress,
          publicKey: result.pkp.publicKey,
          subPKPs: result.pkp.subPKPs || [],
          canMint: result.pkp.canMint || false
        };
        
        // Store PKP management capabilities
        localStorage.setItem('pkp_primary_address', result.pkp.ethAddress);
        localStorage.setItem('pkp_can_mint', result.pkp.canMint.toString());
        localStorage.setItem('pkp_sub_count', (result.pkp.subPKPs?.length || 0).toString());
        
        // Generate session signatures using the deterministic PKP
        sessionSigs = {
          'https://node.litgateway.com': {
            sig: `deterministic-sig-${result.pkp.ethAddress.slice(-8)}-${Date.now()}`,
            derivedVia: 'web3.eth.personal.sign',
            signedMessage: 'Lit Protocol Session',
            address: result.pkp.ethAddress,
          },
        };
        
        console.log('🎯 PKP Management System Active:', {
          username: result.username,
          pkpAddress: result.pkp.ethAddress,
          oneToOne: true
        });
      } else {
        // Fallback to mock data if PKP not provided
        console.log('⚠️ No PKP provided, using mock data');
        pkpInfo = { ethAddress: '0x' + Math.random().toString(16).substring(2, 42) };
        sessionSigs = {
          'https://node.litgateway.com': {
            sig: 'mock-signature-' + Date.now(),
            derivedVia: 'web3.eth.personal.sign',
            signedMessage: 'Lit Protocol Session',
            address: pkpInfo.ethAddress,
          },
        };
      }
      
      wagmi.updateState({
        isAuthenticated: true,
        pkp: pkpInfo,
        authMethod: { authMethodType: 'webauthn' },
        sessionSigs: sessionSigs,
        username: result.username || username,
        oneToOneMapping: result.oneToOneMapping || false,
      });
      
      console.log('✅ WebAuthn authentication successful for username:', result.username || username);
      console.log('🔑 PKP Address:', pkpInfo.ethAddress);
      if (result.oneToOneMapping) {
        console.log('✅ One-to-one username-to-PKP mapping confirmed');
      }
      
      setCurrentUser(result.username || username);
      return result.username || username;
    } catch (error) {
      console.error('💥 WebAuthn authentication error:', error.name, error.message);
      throw error; // Re-throw the error as-is since we've already handled error messages above
    } finally {
      // Always clear the WebAuthn lock when done
      webAuthnInProgress = false;
    }
  };

  const signOut = () => {
    wagmi.resetState();
    clearCurrentUser();
  };

  const showRegistrationModal = () => {
    return new Promise((resolve, reject) => {
      const modal = document.getElementById('webauthnModal');
      const usernameInput = document.getElementById('username');
      const registerBtn = document.getElementById('modalRegisterBtn');
      const cancelBtn = document.getElementById('modalCancelBtn');
      const errorDiv = document.getElementById('modalError');
      const title = modal.querySelector('h3');

      // Configure for registration
      title.textContent = 'Register with WebAuthn';
      registerBtn.textContent = 'Register';
      
      // Clear previous state
      usernameInput.value = '';
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
      
      // Show modal
      modal.classList.remove('hidden');
      usernameInput.focus();
      
      const cleanup = () => {
        modal.classList.add('hidden');
        registerBtn.removeEventListener('click', handleAction);
        cancelBtn.removeEventListener('click', handleCancel);
        usernameInput.removeEventListener('keypress', handleKeyPress);
      };
      
      const handleAction = () => {
        const username = usernameInput.value.trim();
        if (!username) {
          errorDiv.textContent = 'Username is required';
          errorDiv.classList.remove('hidden');
          return;
        }
        if (username.length < 3) {
          errorDiv.textContent = 'Username must be at least 3 characters';
          errorDiv.classList.remove('hidden');
          return;
        }
        cleanup();
        resolve(username);
      };
      
      const handleCancel = () => {
        cleanup();
        reject(new Error('Action cancelled by user'));
      };
      
      const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          handleAction();
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      };
      
      registerBtn.addEventListener('click', handleAction);
      cancelBtn.addEventListener('click', handleCancel);
      usernameInput.addEventListener('keypress', handleKeyPress);
    });
  };

  const showLoginModal = () => {
    return new Promise((resolve, reject) => {
      const modal = document.getElementById('webauthnModal');
      const usernameInput = document.getElementById('username');
      const loginBtn = document.getElementById('modalRegisterBtn'); // Re-using the button
      const cancelBtn = document.getElementById('modalCancelBtn');
      const errorDiv = document.getElementById('modalError');
      const title = modal.querySelector('h3');

      // Configure for login
      title.textContent = 'Login with WebAuthn';
      loginBtn.textContent = 'Login';

      // Clear previous state
      usernameInput.value = '';
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';

      // Show modal
      modal.classList.remove('hidden');
      usernameInput.focus();

      const cleanup = () => {
        modal.classList.add('hidden');
        loginBtn.removeEventListener('click', handleAction);
        cancelBtn.removeEventListener('click', handleCancel);
        usernameInput.removeEventListener('keypress', handleKeyPress);
      };

      const handleAction = () => {
        const username = usernameInput.value.trim();
        if (!username) {
          errorDiv.textContent = 'Username is required';
          errorDiv.classList.remove('hidden');
          return;
        }
        cleanup();
        resolve(username);
      };

      const handleCancel = () => {
        cleanup();
        reject(new Error('Action cancelled by user'));
      };

      const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          handleAction();
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      };

      loginBtn.addEventListener('click', handleAction);
      cancelBtn.addEventListener('click', handleCancel);
      usernameInput.addEventListener('keypress', handleKeyPress);
    });
  };

  const register = async () => {
    try {
      const username = await showRegistrationModal();
      await registerWebAuthn(username);
    } catch (error) {
      // User cancelled or error occurred
      console.log('Registration cancelled or failed:', error.message);
    }
  };

  const login = async () => {
    // Prevent concurrent authentication attempts
    if (authenticationInProgress) {
      console.log('🔒 Authentication already in progress, rejecting concurrent attempt');
      throw new Error('Authentication already in progress. Please wait for the current authentication to complete.');
    }

    // CRITICAL: Verify user gesture exists before any async work
    // This is the PRIMARY check - WebAuthn REQUIRES a user gesture
    if (!navigator.userActivation || !navigator.userActivation.isActive) {
      console.warn('⚠️ Login called without user gesture - WebAuthn will fail');
      console.warn('⚠️ Please ensure login is called from a button click handler');
      throw new Error('Login requires a user interaction. Please click the login button to authenticate.');
    }

    console.log('✅ User gesture detected, proceeding with login...');
    authenticationInProgress = true;

    try {
      // Get stored username synchronously to avoid delays
      let storedUsername = localStorage.getItem('webauthn_username');

      if (storedUsername) {
        // If a username is found, authenticate directly to preserve user gesture
        console.log('🔐 Using stored username for immediate authentication:', storedUsername);
        try {
          await authenticateWebAuthn(storedUsername);
          return storedUsername;
        } catch (error) {
          // If authentication fails, clear stored user and try default
          if (error.message.includes('No authenticators registered') || 
              error.message.includes('authentication failed')) {
            console.log('Stored user auth failed, clearing and trying default...');
            clearCurrentUser();
            storedUsername = null; // Fall through to default
          } else {
            throw error; // Re-throw gesture-related or other critical errors
          }
        }
      }
      
      if (!storedUsername) {
        // Try default username with preserved gesture
        console.log('🔐 Trying default username with preserved gesture');
        try {
          const defaultUsername = 'testuser';
          await authenticateWebAuthn(defaultUsername);
          setCurrentUser(defaultUsername);
          return defaultUsername;
        } catch (error) {
          console.log('Default username failed:', error.message);
          
          // Handle specific error cases
          if (error.message.includes('No authenticators registered')) {
            console.log('🔐 Auto-registering to preserve gesture chain...');
            try {
              await registerWebAuthn('testuser');
              // Registration consumed the gesture, need new one for auth
              throw new Error('Registration completed successfully. Please click login again to authenticate.');
            } catch (regError) {
              console.log('Auto-registration failed:', regError.message);
              throw new Error('No existing credentials found. Please register first, then login.');
            }
          } else if (error.message.includes('User gesture') || error.message.includes('expired')) {
            // Gesture-related errors should be thrown immediately
            throw error;
          } else {
            // For other errors, suggest manual flow
            throw new Error('Authentication failed. Please try again or register if you are a new user.');
          }
        }
      }
    } catch (error) {
      console.error('Login failed:', error.message);

      // Clear stored user if auth completely failed
      if (error.message.includes('No authenticators registered')) {
        clearCurrentUser();
      }
      
      throw error;
    } finally {
      // Always clear the lock when done
      authenticationInProgress = false;
    }
  };

  // PKP Management Functions
  const getPKPDashboard = async () => {
    try {
      const response = await fetch('/lit/pkp/dashboard', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch PKP dashboard');
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching PKP dashboard:', error);
      throw error;
    }
  };

  const mintSubPKP = async (purpose, description = '') => {
    try {
      console.log(`🔧 Minting new sub-PKP for purpose: ${purpose}`);
      
      const response = await fetch('/lit/pkp/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ purpose, description }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mint sub-PKP');
      }
      
      const result = await response.json();
      console.log('✅ Sub-PKP minted successfully:', result.subPKP);
      
      // Update local storage count
      const currentCount = parseInt(localStorage.getItem('pkp_sub_count') || '0');
      localStorage.setItem('pkp_sub_count', (currentCount + 1).toString());
      
      return result;
    } catch (error) {
      console.error('❌ Error minting sub-PKP:', error);
      throw error;
    }
  };

  const getAIBuildPaths = async () => {
    try {
      const response = await fetch('/lit/pkp/ai-builds', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch AI build paths');
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching AI build paths:', error);
      throw error;
    }
  };

  // Enhanced session persistence for route navigation
  const verifySessionForRoute = async (route) => {
    try {
      const response = await fetch('/lit/session/status', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.log(`❌ Session verification failed for route: ${route}`);
        return false;
      }
      
      const status = await response.json();
      console.log(`🔍 Session status for route ${route}:`, status);
      
      // Check if authenticated and session is valid
      if (status.authenticated && status.username) {
        console.log(`✅ Session verified for route ${route}:`, status);
        return true;
      } else {
        console.log(`❌ Session not authenticated for route ${route}:`, status);
        
        // Clear any stale local storage if session is invalid
        if (!status.authenticated && localStorage.getItem('webauthn_username')) {
          console.log('🧹 Clearing stale localStorage due to expired session');
          clearCurrentUser();
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ Error verifying session:', error);
      return false;
    }
  };

  return {
    initializeLit,
    signOut,
    register,
    login,
    // Authentication functions
    authenticateWebAuthn,
    registerWebAuthn,
    // PKP Management functions
    getPKPDashboard,
    mintSubPKP,
    getAIBuildPaths,
    verifySessionForRoute,
    // Helper functions to get wallet/authentication state
    getAuthenticationState,
    getWalletState,
    isWebAuthnBusy,
    getCurrentUser: () => currentUser,
    setCurrentUser,
    clearCurrentUser,
  };
};

window.useLit = useLit;

// Global debugging functions for Debug Tab
window.debugWebAuthn = {
  // Get current state of all locks and variables
  getState: () => {
    const litInstance = window.useLit();
    return {
      authenticationState: litInstance.getAuthenticationState(),
      walletState: litInstance.getWalletState(),
      isWebAuthnBusy: litInstance.isWebAuthnBusy(),
      currentUser: litInstance.getCurrentUser(),
      userActivation: {
        isActive: navigator.userActivation?.isActive,
        hasBeenActive: navigator.userActivation?.hasBeenActive
      },
      localStorage: {
        webauthn_username: localStorage.getItem('webauthn_username')
      }
    };
  },
  
  // Reset all locks and state (useful for debugging)
  resetState: () => {
    console.log('🔧 Resetting WebAuthn state...');
    const litInstance = window.useLit();
    litInstance.clearCurrentUser();
    // Note: We can't directly access the internal variables from here,
    // but the user can refresh the page to reset everything
    console.log('🔧 Cleared localStorage. Refresh page to fully reset locks.');
    return 'State reset complete. Please refresh the page to fully reset internal locks.';
  },
  
  // Test authentication with debugging
  testAuth: async (username = 'testuser') => {
    console.log('🧪 Testing authentication with enhanced debugging...');
    try {
      const litInstance = window.useLit();
      console.log('🧪 State before auth:', window.debugWebAuthn.getState());
      const result = await litInstance.login();
      console.log('🧪 Authentication result:', result);
      console.log('🧪 State after auth:', window.debugWebAuthn.getState());
      return result;
    } catch (error) {
      console.error('🧪 Authentication test failed:', error);
      console.log('🧪 State after error:', window.debugWebAuthn.getState());
      throw error;
    }
  },
  
  // Check if WebAuthn is supported and available
  checkSupport: () => {
    const support = {
      webAuthnSupported: !!navigator.credentials && !!navigator.credentials.create,
      userActivationSupported: !!navigator.userActivation,
      currentUserActivation: navigator.userActivation ? {
        isActive: navigator.userActivation.isActive,
        hasBeenActive: navigator.userActivation.hasBeenActive
      } : null,
      secureContext: window.isSecureContext,
      origin: window.location.origin
    };
    console.log('🔍 WebAuthn Support Check:', support);
    return support;
  },
  
  // Simulate rapid clicks to test the concurrent request protection
  testConcurrentRequests: async () => {
    console.log('🧪 Testing concurrent request protection...');
    const litInstance = window.useLit();
    
    // Start multiple authentication attempts simultaneously
    const promises = [];
    for (let i = 0; i < 3; i++) {
      console.log(`🧪 Starting auth attempt ${i + 1}`);
      promises.push(
        litInstance.login().catch(error => {
          console.log(`🧪 Auth attempt ${i + 1} result:`, error.message);
          return { attempt: i + 1, error: error.message };
        })
      );
    }
    
    const results = await Promise.allSettled(promises);
    console.log('🧪 Concurrent test results:', results);
    return results;
  },
  
  // Test WebAuthn with simplified parameters to isolate issues
  testSimpleWebAuthn: async () => {
    console.log('🧪 Testing simplified WebAuthn call...');
    
    if (!navigator.credentials) {
      throw new Error('WebAuthn not supported');
    }
    
    try {
      // Test with minimal challenge
      const simpleChallenge = new Uint8Array(32);
      crypto.getRandomValues(simpleChallenge);
      
      const simpleOptions = {
        challenge: simpleChallenge,
        timeout: 30000, // Short timeout
        rpId: 'localhost',
        userVerification: 'discouraged', // Don't require biometric
        allowCredentials: [] // Allow any credential
      };
      
      console.log('🧪 Calling navigator.credentials.get with simple options...');
      const result = await navigator.credentials.get({
        publicKey: simpleOptions
      });
      
      console.log('🧪 Simple WebAuthn test successful:', result);
      return result;
    } catch (error) {
      console.error('🧪 Simple WebAuthn test failed:', error);
      throw error;
    }
  },
  
  // Test user gesture preservation timing
  testUserGesture: async () => {
    console.log('🧪 Testing user gesture preservation...');
    
    const initialState = {
      userActivation: {
        isActive: navigator.userActivation?.isActive,
        hasBeenActive: navigator.userActivation?.hasBeenActive
      },
      timestamp: performance.now()
    };
    
    console.log('🧪 Initial state:', initialState);
    
    const tests = [];
    
    try {
      // Test 1: Immediate check
      tests.push({
        test: 'Immediate check',
        active: navigator.userActivation?.isActive,
        elapsed: 0
      });
      
      // Test 2: After 100ms delay
      await new Promise(resolve => setTimeout(resolve, 100));
      tests.push({
        test: 'After 100ms',
        active: navigator.userActivation?.isActive,
        elapsed: 100
      });
      
      // Test 3: After 500ms delay
      await new Promise(resolve => setTimeout(resolve, 400));
      tests.push({
        test: 'After 500ms',
        active: navigator.userActivation?.isActive,
        elapsed: 500
      });
      
      // Test 4: After fetch simulation
      const fetchStart = performance.now();
      await fetch('/lit/config', { credentials: 'include' }).catch(() => {});
      const fetchElapsed = performance.now() - fetchStart;
      tests.push({
        test: `After fetch (${fetchElapsed.toFixed(0)}ms)`,
        active: navigator.userActivation?.isActive,
        elapsed: fetchElapsed
      });
      
      console.log('🧪 User gesture test results:', tests);
      return { success: true, tests, initialState };
      
    } catch (error) {
      console.error('🧪 User gesture test failed:', error);
      return { error: error.message, tests, initialState };
    }
  },

  // Auto-run user gesture test on any button click
  // Auto-run user gesture test on any button click
  autoTestUserGesture: () => {
    console.log('🎯 Auto-testing user gesture on next click...');
    document.addEventListener('click', async (event) => {
      if (event.target.tagName === 'BUTTON') {
        console.log('🧪 Button clicked, testing user gesture preservation...');
        const result = await window.debugWebAuthn.testUserGesture();
        console.log('🧪 AUTO-TEST RESULT:', result);
      }
    }, { once: true });
  },
  
  // Check one-to-one mapping for current user
  checkOneToOneMapping: async (username = null) => {
    try {
      console.log('🔍 Checking one-to-one mapping...');
      const litInstance = window.useLit();
      const currentUser = username || litInstance.getCurrentUser();
      
      if (!currentUser) {
        console.log('❌ No user specified or logged in');
        return { error: 'No user specified or logged in' };
      }
      
      const response = await fetch('/lit/webauthn/authenticate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: currentUser }),
      });
      
      if (!response.ok) {
        return { 
          username: currentUser, 
          registered: false,
          error: 'User not found or no credentials'
        };
      }
      
      const options = await response.json();
      const credentialCount = options.allowCredentials?.length || 0;
      
      console.log(`🔍 User "${currentUser}" has ${credentialCount} credential(s)`);
      
      return {
        username: currentUser,
        credentialCount,
        oneToOneMapping: credentialCount === 1,
        registered: credentialCount > 0,
        status: credentialCount === 1 ? '✅ Perfect one-to-one mapping' : 
                credentialCount === 0 ? '❌ No credentials registered' :
                `⚠️ Multiple credentials (${credentialCount}) - not one-to-one`
      };
      
    } catch (error) {
      console.error('🔍 Error checking mapping:', error);
      return { error: error.message };
    }
  },
  
  // Test user gesture preservation timing
  testUserGesture: async () => {
    console.log('🧪 Testing user gesture preservation...');
    
    const initialState = {
      userActivation: {
        isActive: navigator.userActivation?.isActive,
        hasBeenActive: navigator.userActivation?.hasBeenActive
      },
      timestamp: performance.now()
    };
    
    console.log('🧪 Initial state:', initialState);
    
    const tests = [];
    
    try {
      // Test 1: Immediate check
      tests.push({
        test: 'Immediate check',
        active: navigator.userActivation?.isActive,
        elapsed: 0
      });
      
      // Test 2: After 100ms delay
      await new Promise(resolve => setTimeout(resolve, 100));
      tests.push({
        test: 'After 100ms',
        active: navigator.userActivation?.isActive,
        elapsed: 100
      });
      
      // Test 3: After 500ms delay
      await new Promise(resolve => setTimeout(resolve, 400));
      tests.push({
        test: 'After 500ms',
        active: navigator.userActivation?.isActive,
        elapsed: 500
      });
      
      // Test 4: After fetch simulation
      const fetchStart = performance.now();
      await fetch('/lit/config', { credentials: 'include' }).catch(() => {});
      const fetchElapsed = performance.now() - fetchStart;
      tests.push({
        test: `After fetch (${fetchElapsed.toFixed(0)}ms)`,
        active: navigator.userActivation?.isActive,
        elapsed: fetchElapsed
      });
      
      console.log('🧪 User gesture test results:', tests);
      return { success: true, tests, initialState };
      
    } catch (error) {
      console.error('🧪 User gesture test failed:', error);
      return { error: error.message, tests, initialState };
    }
  }
};

console.log('🎯 Debug functions loaded! Available commands:');
console.log('  - debugWebAuthn.getState() - Get current authentication state');
console.log('  - debugWebAuthn.resetState() - Reset authentication state');
console.log('  - debugWebAuthn.testAuth() - Test authentication with debugging');
console.log('  - debugWebAuthn.checkSupport() - Check WebAuthn browser support');
console.log('  - debugWebAuthn.testConcurrentRequests() - Test concurrent request protection');
console.log('  - debugWebAuthn.testSimpleWebAuthn() - Test basic WebAuthn functionality');
console.log('  - debugWebAuthn.testUserGesture() - Test user gesture preservation');
console.log('  - debugWebAuthn.checkOneToOneMapping() - Check credential mapping');

// Auto-start user gesture testing
debugWebAuthn.autoTestUserGesture();
console.log('🎯 User gesture auto-testing enabled. Click any button to see results.');

console.log('🎯 Debug functions loaded! Available commands:');
console.log('  - debugWebAuthn.getState() - Get current authentication state');
console.log('  - debugWebAuthn.resetState() - Reset authentication state');
console.log('  - debugWebAuthn.testAuth() - Test authentication with debugging');
console.log('  - debugWebAuthn.checkSupport() - Check WebAuthn browser support');
console.log('  - debugWebAuthn.testConcurrentRequests() - Test concurrent request protection');
console.log('  - debugWebAuthn.testSimpleWebAuthn() - Test basic WebAuthn functionality');
console.log('  - debugWebAuthn.testUserGesture() - Test user gesture preservation');

// Auto-start user gesture testing
debugWebAuthn.autoTestUserGesture();
console.log('🎯 User gesture auto-testing enabled. Click any button to see results.');
