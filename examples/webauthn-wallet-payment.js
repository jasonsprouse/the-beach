/**
 * WebAuthn Wallet Payment Integration
 * 
 * Complete examples for using WebAuthn (TouchID/FaceID/Windows Hello) 
 * to authenticate wallet payments with PKP integration
 */

// =============================================================================
// 1. WebAuthn Registration (One-time Setup)
// =============================================================================

/**
 * Register user's biometric device for wallet payments
 * Call this once during wallet setup
 */
async function registerWebAuthnForWallet(pkpAddress, userDisplayName) {
  try {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn not supported in this browser');
    }

    // Generate challenge (in production, get this from your server)
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Create credential options
    const createCredentialOptions = {
      publicKey: {
        challenge: challenge,
        rp: {
          name: "The Beach - Biometric Wallet",
          id: "the-beach.app", // Your domain
        },
        user: {
          id: new TextEncoder().encode(pkpAddress),
          name: pkpAddress,
          displayName: userDisplayName || `PKP Wallet ${pkpAddress.slice(0, 8)}...`,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Built-in biometric
          requireResidentKey: true,
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
      }
    };

    // Create the credential
    const credential = await navigator.credentials.create(createCredentialOptions);

    // Extract credential data
    const credentialData = {
      id: credential.id,
      rawId: Array.from(new Uint8Array(credential.rawId)),
      type: credential.type,
      response: {
        attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
        clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON)),
      },
      pkpAddress: pkpAddress,
      registeredAt: Date.now()
    };

    // Send to server for verification and storage
    const response = await fetch('/biometric/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentialData)
    });

    if (!response.ok) {
      throw new Error('Failed to register biometric credential');
    }

    console.log('✅ WebAuthn credential registered for wallet:', pkpAddress);
    return credentialData;

  } catch (error) {
    console.error('❌ WebAuthn registration failed:', error);
    throw error;
  }
}

// =============================================================================
// 2. WebAuthn Authentication for Payments
// =============================================================================

/**
 * Authenticate user with biometric before processing payment
 * This replaces traditional password/PIN authentication
 */
async function authenticateWebAuthnForPayment(pkpAddress, paymentDetails) {
  try {
    // Generate challenge that includes payment details for security
    const paymentHash = await crypto.subtle.digest(
      'SHA-256', 
      new TextEncoder().encode(JSON.stringify(paymentDetails))
    );
    const challenge = new Uint8Array(paymentHash);

    // Get stored credential IDs for this PKP address
    const credentialsResponse = await fetch(`/biometric/credentials/${pkpAddress}`);
    const credentials = await credentialsResponse.json();

    if (!credentials || credentials.length === 0) {
      throw new Error('No biometric credentials registered for this wallet');
    }

    // Create authentication options
    const getCredentialOptions = {
      publicKey: {
        challenge: challenge,
        allowCredentials: credentials.map(cred => ({
          id: new Uint8Array(cred.rawId),
          type: 'public-key',
          transports: ['internal', 'hybrid']
        })),
        userVerification: 'required',
        timeout: 60000
      }
    };

    // Prompt for biometric authentication
    const assertion = await navigator.credentials.get(getCredentialOptions);

    // Extract assertion data
    const assertionData = {
      id: assertion.id,
      rawId: Array.from(new Uint8Array(assertion.rawId)),
      type: assertion.type,
      response: {
        authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
        clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
        signature: Array.from(new Uint8Array(assertion.response.signature)),
        userHandle: assertion.response.userHandle ? 
          Array.from(new Uint8Array(assertion.response.userHandle)) : null,
      },
      pkpAddress: pkpAddress,
      paymentDetails: paymentDetails,
      authenticatedAt: Date.now()
    };

    // Verify assertion on server
    const verifyResponse = await fetch('/biometric/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assertionData)
    });

    if (!verifyResponse.ok) {
      throw new Error('Biometric authentication failed');
    }

    const verificationResult = await verifyResponse.json();
    console.log('✅ WebAuthn authentication successful');
    
    return verificationResult;

  } catch (error) {
    console.error('❌ WebAuthn authentication failed:', error);
    throw error;
  }
}

// =============================================================================
// 3. Complete Wallet Payment Flow
// =============================================================================

/**
 * Complete payment flow using WebAuthn + Wallet
 * Combines biometric auth with actual payment processing
 */
async function processWebAuthnWalletPayment({
  pkpAddress,
  recipientAddress,
  amount,
  currency = 'ETH',
  description,
  paymentMethod = 'wallet' // 'wallet', 'card', 'apple-pay', etc.
}) {
  
  const paymentSession = {
    id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    pkpAddress,
    recipientAddress,
    amount,
    currency,
    description,
    paymentMethod,
    createdAt: Date.now()
  };

  try {
    console.log('🔐 Starting WebAuthn wallet payment...');

    // Step 1: Authenticate with biometric
    const authResult = await authenticateWebAuthnForPayment(pkpAddress, {
      amount,
      currency,
      recipient: recipientAddress,
      description,
      sessionId: paymentSession.id
    });

    console.log('✅ Biometric authentication successful');

    // Step 2: Process payment based on method
    let paymentResult;

    if (paymentMethod === 'wallet') {
      // Direct wallet transaction (requires PKP signing)
      paymentResult = await processWalletTransaction({
        ...paymentSession,
        biometricToken: authResult.token,
        authenticationId: authResult.id
      });
    } else if (paymentMethod === 'apple-pay' || paymentMethod === 'google-pay') {
      // Payment Request API with biometric pre-auth
      paymentResult = await processPaymentRequestAPI({
        ...paymentSession,
        biometricToken: authResult.token,
        paymentMethod
      });
    } else if (paymentMethod === 'card') {
      // Traditional card payment with biometric verification
      paymentResult = await processCardPayment({
        ...paymentSession,
        biometricToken: authResult.token
      });
    }

    console.log('✅ Payment processed successfully');
    return {
      success: true,
      paymentId: paymentResult.id,
      transactionHash: paymentResult.txHash,
      amount,
      currency,
      biometricVerified: true,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error('❌ WebAuthn wallet payment failed:', error);
    return {
      success: false,
      error: error.message,
      paymentId: paymentSession.id,
      timestamp: Date.now()
    };
  }
}

// =============================================================================
// 4. PKP Wallet Transaction with WebAuthn
// =============================================================================

/**
 * Process blockchain transaction using PKP wallet after biometric auth
 */
async function processWalletTransaction({
  pkpAddress,
  recipientAddress,
  amount,
  currency,
  biometricToken,
  authenticationId
}) {
  
  // Prepare transaction data
  const transactionData = {
    from: pkpAddress,
    to: recipientAddress,
    value: ethers.utils.parseEther(amount.toString()),
    gasLimit: 21000,
    gasPrice: await getGasPrice(),
    nonce: await getNonce(pkpAddress)
  };

  // Sign transaction using PKP with biometric verification
  const signedTransaction = await signTransactionWithPKP({
    transactionData,
    pkpAddress,
    biometricToken,
    authenticationId
  });

  // Broadcast transaction
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const txResponse = await provider.sendTransaction(signedTransaction);

  // Wait for confirmation
  const receipt = await txResponse.wait();

  return {
    id: txResponse.hash,
    txHash: txResponse.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    status: receipt.status
  };
}

/**
 * Sign transaction using PKP with biometric verification
 */
async function signTransactionWithPKP({
  transactionData,
  pkpAddress,
  biometricToken,
  authenticationId
}) {
  
  // Call backend to sign with PKP
  const response = await fetch('/pkp/sign-transaction', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${biometricToken}`
    },
    body: JSON.stringify({
      transactionData,
      pkpAddress,
      authenticationId,
      timestamp: Date.now()
    })
  });

  if (!response.ok) {
    throw new Error('Failed to sign transaction with PKP');
  }

  const result = await response.json();
  return result.signedTransaction;
}

// =============================================================================
// 5. Payment Request API with WebAuthn Pre-auth
// =============================================================================

/**
 * Use Payment Request API (Apple Pay/Google Pay) with biometric pre-auth
 */
async function processPaymentRequestAPI({
  amount,
  currency,
  description,
  biometricToken,
  paymentMethod
}) {
  
  // Check if Payment Request API is supported
  if (!window.PaymentRequest) {
    throw new Error('Payment Request API not supported');
  }

  // Define payment methods
  const supportedInstruments = [];
  
  if (paymentMethod === 'apple-pay') {
    supportedInstruments.push({
      supportedMethods: 'https://apple.com/apple-pay',
      data: {
        version: 3,
        merchantIdentifier: 'merchant.com.thebeach.app',
        merchantCapabilities: ['supports3DS'],
        supportedNetworks: ['visa', 'masterCard', 'amex'],
        countryCode: 'US'
      }
    });
  }

  if (paymentMethod === 'google-pay') {
    supportedInstruments.push({
      supportedMethods: 'https://google.com/pay',
      data: {
        environment: 'TEST', // or 'PRODUCTION'
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
          merchantName: 'The Beach',
          merchantId: '12345678901234567890'
        },
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA']
          }
        }]
      }
    });
  }

  // Payment details
  const details = {
    total: {
      label: description,
      amount: { currency: currency.toUpperCase(), value: amount.toFixed(2) }
    },
    displayItems: [
      {
        label: 'Biometric Verification Fee',
        amount: { currency: currency.toUpperCase(), value: '0.25' }
      },
      {
        label: description,
        amount: { currency: currency.toUpperCase(), value: (amount - 0.25).toFixed(2) }
      }
    ]
  };

  // Create payment request
  const request = new PaymentRequest(supportedInstruments, details);

  // Add biometric verification to request
  request.addEventListener('paymentmethodchange', async (event) => {
    // Verify biometric token is still valid
    const isValid = await verifyBiometricToken(biometricToken);
    if (!isValid) {
      event.updateWith(Promise.reject('Biometric verification expired'));
    }
  });

  // Show payment UI
  const paymentResponse = await request.show();

  // Process the payment
  const result = await fetch('/payments/process-payment-request', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${biometricToken}`
    },
    body: JSON.stringify({
      paymentMethodData: paymentResponse.methodName,
      paymentDetails: paymentResponse.details,
      amount,
      currency,
      description,
      biometricVerified: true
    })
  });

  if (result.ok) {
    await paymentResponse.complete('success');
  } else {
    await paymentResponse.complete('fail');
    throw new Error('Payment processing failed');
  }

  return await result.json();
}

// =============================================================================
// 6. Utility Functions
// =============================================================================

async function getGasPrice() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  return await provider.getGasPrice();
}

async function getNonce(address) {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  return await provider.getTransactionCount(address);
}

async function verifyBiometricToken(token) {
  const response = await fetch('/biometric/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return response.ok;
}

// =============================================================================
// 7. Example Usage
// =============================================================================

// Example 1: Register biometric for new wallet
async function exampleRegistration() {
  const pkpAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const userDisplayName = 'John Doe';
  
  try {
    await registerWebAuthnForWallet(pkpAddress, userDisplayName);
    console.log('✅ Registration complete');
  } catch (error) {
    console.error('❌ Registration failed:', error);
  }
}

// Example 2: Process wallet payment
async function exampleWalletPayment() {
  try {
    const result = await processWebAuthnWalletPayment({
      pkpAddress: '0x1234567890abcdef1234567890abcdef12345678',
      recipientAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      amount: 0.1,
      currency: 'ETH',
      description: 'Premium Code Package',
      paymentMethod: 'wallet'
    });
    
    console.log('Payment result:', result);
  } catch (error) {
    console.error('Payment failed:', error);
  }
}

// Example 3: Process Apple Pay payment with biometric pre-auth
async function exampleApplePayment() {
  try {
    const result = await processWebAuthnWalletPayment({
      pkpAddress: '0x1234567890abcdef1234567890abcdef12345678',
      recipientAddress: 'merchant.account',
      amount: 99.99,
      currency: 'USD',
      description: 'Premium Subscription',
      paymentMethod: 'apple-pay'
    });
    
    console.log('Apple Pay result:', result);
  } catch (error) {
    console.error('Apple Pay failed:', error);
  }
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    registerWebAuthnForWallet,
    authenticateWebAuthnForPayment,
    processWebAuthnWalletPayment,
    processWalletTransaction,
    processPaymentRequestAPI
  };
}