// This file will handle the Lit Protocol authentication flow.

const useLit = () => {
  const wagmi = window.useWagmi();

  let litAuthClient = null;
  let litNodeClient = null;

  const initializeLit = async () => {
    const configResponse = await fetch('/lit/config');
    const config = await configResponse.json();

    if (!window.LitJsSdk_litNodeClient) {
      throw new Error('Lit Node SDK not loaded');
    }

    if (!window.LitJsSdk_authClient) {
      throw new Error('Lit Auth SDK not loaded');
    }

    const LitNodeClient = window.LitJsSdk_litNodeClient.LitNodeClient;
    litNodeClient = new LitNodeClient({
      litNetwork: config.litNetwork || 'cayenne',
      debug: config.debug || false,
    });
    await litNodeClient.connect();

    const LitAuthClient = window.LitJsSdk_authClient.LitAuthClient;
    litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: config.relayApiKey || 'dev-placeholder-key',
      },
      litNodeClient,
    });
  };

  const authenticateWebAuthn = async () => {
    if (!litAuthClient) {
      await initializeLit();
    }

    const provider = litAuthClient.initProvider('webauthn');

    // Check if user is registered first
    const isRegistered = await provider.isRegistered();
    if (!isRegistered) {
      // User must register before they can log in
      try {
        const options = await provider.register();
        const response = await fetch('/lit/webauthn/verify-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        });
        
        if (!response.ok) {
          throw new Error('Registration verification failed');
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error('Registration failed: ' + (result.message || 'Unknown error'));
        }
        
        // Registration successful, inform user and prompt to authenticate
        alert('WebAuthn registration successful! Please authenticate to continue.');
      } catch (error) {
        console.error('WebAuthn registration error:', error);
        throw new Error('You must complete WebAuthn registration before logging in. Error: ' + error.message);
      }
    }

    // Now authenticate with the registered credential
    const authMethod = await provider.authenticate();
    const pkp = await provider.getPkp();
    const sessionSigs = await litNodeClient.getSessionSigs({
      pkpPublicKey: pkp.publicKey,
      authMethod,
      sessionSigsParams: {
        chain: 'ethereum',
        resourceAbilityRequests: [
          {
            resource: {
              resource: `lit-action://*`,
            },
            ability: 'lit-action:execute-js',
          },
        ],
      },
    });

    wagmi.updateState({
      isAuthenticated: true,
      pkp,
      authMethod,
      sessionSigs,
    });
  };

  const signIn = async (providerType) => {
    if (!litAuthClient) {
      await initializeLit();
    }
    const provider = litAuthClient.initProvider(providerType);
    const authMethod = await provider.signIn();
    const pkp = await provider.getPkp();
    const sessionSigs = await litNodeClient.getSessionSigs({
      pkpPublicKey: pkp.publicKey,
      authMethod,
      sessionSigsParams: {
        chain: 'ethereum',
        resourceAbilityRequests: [
          {
            resource: {
              resource: `lit-action://*`,
            },
            ability: 'lit-action:execute-js',
          },
        ],
      },
    });

    wagmi.updateState({
      isAuthenticated: true,
      pkp,
      authMethod,
      sessionSigs,
    });
  };

  const signOut = () => {
    wagmi.resetState();
  };

  const login = async () => {
    await authenticateWebAuthn();
  };

  return {
    initializeLit,
    signIn,
    signOut,
    authenticateWebAuthn,
    login,
  };
};

window.useLit = useLit;
