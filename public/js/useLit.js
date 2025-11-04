// This file will handle the Lit Protocol authentication flow.

const useLit = () => {
  const wagmi = window.useWagmi();

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
      return config;
    } catch (err) {
      throw new Error(`Error fetching /lit/config: ${err.message}`);
    }
  };

  const registerWebAuthn = async (username) => {
    await initializeLit();

    try {
      // Get registration options from backend with username
      const optionsResponse = await fetch('/lit/webauthn/register-options', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });
      
      if (!optionsResponse.ok) {
        throw new Error('Failed to get registration options');
      }
      
      const options = await optionsResponse.json();
      
      // Use WebAuthn browser API to create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          user: {
            ...options.user,
            id: Uint8Array.from(atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          },
          excludeCredentials: options.excludeCredentials?.map(cred => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          })),
        },
      });
      
      if (!credential) {
        throw new Error('Failed to create credential');
      }
      
      // Convert credential to JSON format for sending to backend
      const credentialJSON = {
        id: credential.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
        response: {
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
          attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
          transports: credential.response.getTransports ? credential.response.getTransports() : [],
        },
        type: credential.type,
      };
      
      // Verify registration with backend
      const verifyResponse = await fetch('/lit/webauthn/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentialJSON),
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Registration verification failed');
      }
      
      const result = await verifyResponse.json();
      if (!result.success) {
        throw new Error('Registration failed: ' + (result.message || 'Unknown error'));
      }
      
      console.log('WebAuthn registration successful');
    } catch (error) {
      console.error('WebAuthn registration error:', error);
      throw error;
    }
  };

  const authenticateWebAuthn = async () => {
    await initializeLit();

    try {
      // Get authentication options from backend
      const optionsResponse = await fetch('/lit/webauthn/authenticate-options', {
        credentials: 'include',
      });
      
      if (!optionsResponse.ok) {
        const error = await optionsResponse.text();
        throw new Error(error || 'Failed to get authentication options. Please register first.');
      }
      
      const options = await optionsResponse.json();
      
      // Use WebAuthn browser API to get assertion
      const assertion = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          allowCredentials: options.allowCredentials?.map(cred => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          })),
        },
      });
      
      if (!assertion) {
        throw new Error('Failed to get assertion');
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
        throw new Error('Authentication verification failed');
      }
      
      const result = await verifyResponse.json();
      if (!result.success) {
        throw new Error('Authentication failed: ' + (result.message || 'Unknown error'));
      }
      
      // Generate mock session signatures for now
      // TODO: Integrate with Lit Protocol PKP to generate real session signatures
      const mockSessionSigs = {
        'https://node.litgateway.com': {
          sig: 'mock-signature-' + Date.now(),
          derivedVia: 'web3.eth.personal.sign',
          signedMessage: 'Lit Protocol Session',
          address: '0x' + Math.random().toString(16).substring(2, 42),
        },
      };
      
      wagmi.updateState({
        isAuthenticated: true,
        pkp: { ethAddress: '0x' + Math.random().toString(16).substring(2, 42) },
        authMethod: { authMethodType: 'webauthn' },
        sessionSigs: mockSessionSigs,
      });
      
      console.log('WebAuthn authentication successful');
    } catch (error) {
      console.error('WebAuthn authentication error:', error);
      throw error;
    }
  };

  const signOut = () => {
    wagmi.resetState();
  };

  const showRegistrationModal = () => {
    return new Promise((resolve, reject) => {
      const modal = document.getElementById('webauthnModal');
      const usernameInput = document.getElementById('username');
      const registerBtn = document.getElementById('modalRegisterBtn');
      const cancelBtn = document.getElementById('modalCancelBtn');
      const errorDiv = document.getElementById('modalError');
      
      // Clear previous state
      usernameInput.value = '';
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
      
      // Show modal
      modal.classList.remove('hidden');
      usernameInput.focus();
      
      const cleanup = () => {
        modal.classList.add('hidden');
        registerBtn.removeEventListener('click', handleRegister);
        cancelBtn.removeEventListener('click', handleCancel);
        usernameInput.removeEventListener('keypress', handleKeyPress);
      };
      
      const handleRegister = () => {
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
        reject(new Error('Registration cancelled by user'));
      };
      
      const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          handleRegister();
        } else if (e.key === 'Escape') {
          handleCancel();
        }
      };
      
      registerBtn.addEventListener('click', handleRegister);
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
    await authenticateWebAuthn();
  };

  return {
    initializeLit,
    signOut,
    register,
    login,
  };
};

window.useLit = useLit;
