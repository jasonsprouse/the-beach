// This file will handle the Lit Protocol authentication flow.

const useLit = () => {
  const wagmi = window.useWagmi();

  let litAuthClient = null;
  let litNodeClient = null;

  const initializeLit = async () => {
    let config;
    try {
      const configResponse = await fetch('/lit/config');
      if (!configResponse.ok) {
        throw new Error(`Failed to fetch /lit/config: ${configResponse.status} ${configResponse.statusText}`);
      }
      config = await configResponse.json();
    } catch (err) {
      throw new Error(`Error fetching /lit/config: ${err.message}`);
    }

    if (!window.LitJsSdk_litNodeClient) {
      throw new Error('Lit Node SDK not loaded');
    }

    if (!window.LitJsSdk_authClient) {
      throw new Error('Lit Auth SDK not loaded');
    }

    const LitNodeClient = window.LitJsSdk_litNodeClient.LitNodeClient;
    litNodeClient = new LitNodeClient({
      litNetwork: config.litNetwork || 'datil-dev',
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

  const registerWebAuthn = async () => {
    if (!litAuthClient) {
      await initializeLit();
    }

    const provider = litAuthClient.initProvider('webauthn');

    // Check if user is already registered
    const isRegistered = await provider.isRegistered();
    if (isRegistered) {
      throw new Error('User is already registered. Please login instead.');
    }

    // Register new credential
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
  };

  const authenticateWebAuthn = async () => {
    if (!litAuthClient) {
      await initializeLit();
    }

    const provider = litAuthClient.initProvider('webauthn');

    // Check if user is registered first
    const isRegistered = await provider.isRegistered();
    if (!isRegistered) {
      throw new Error('You must register before logging in. Please complete WebAuthn registration first.');
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

  const register = async () => {
    await registerWebAuthn();
  };

  const login = async () => {
    await authenticateWebAuthn();
  };

  return {
    initializeLit,
    signIn,
    signOut,
    register,
    login,
  };
};

window.useLit = useLit;
