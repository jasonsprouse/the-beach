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

  const registerWebAuthn = async () => {
    if (!litAuthClient) {
      await initializeLit();
    }
    const provider = litAuthClient.initProvider('webauthn');
    const options = await provider.register();
    const tx = await fetch('/lit/webauthn/verify-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    return tx.json();
  };

  const authenticateWebAuthn = async () => {
    if (!litAuthClient) {
      await initializeLit();
    }
    const provider = litAuthClient.initProvider('webauthn');
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

  return {
    initializeLit,
    signIn,
    signOut,
    registerWebAuthn,
    authenticateWebAuthn,
  };
};

window.useLit = useLit;
