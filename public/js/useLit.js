// This file will handle the Lit Protocol authentication flow.

const useLit = () => {
  const wagmi = window.useWagmi();

  let litAuthClient = null;
  let litNodeClient = null;

  const initializeLit = async () => {
    const configResponse = await fetch('/lit/config');
    const config = await configResponse.json();

    if (window.LitJsSdk_litNodeClient) {
      const LitNodeClient = window.LitJsSdk_litNodeClient.LitNodeClient;
      litNodeClient = new LitNodeClient({
        litNetwork: config.litNetwork || 'cayenne',
        debug: config.debug || false,
      });
      await litNodeClient.connect();
    }

    if (window.LitJsSdk_authClient) {
      const LitAuthClient = window.LitJsSdk_authClient.LitAuthClient;
      litAuthClient = new LitAuthClient({
        litRelayConfig: {
          relayApiKey: config.relayApiKey || 'dev-placeholder-key',
        },
        litNodeClient,
      });
    }
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
  };
};

window.useLit = useLit;
