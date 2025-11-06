# WebAuthn Wallet Payment Integration

Complete implementation of biometric wallet payments using WebAuthn (TouchID/FaceID/Windows Hello) with PKP wallet integration.

## 🎯 Overview

This implementation provides secure, biometric-authenticated wallet payments that combine:
- **WebAuthn** for biometric authentication (TouchID, FaceID, Windows Hello)
- **PKP Wallets** for decentralized transaction signing
- **Payment Request API** for native Apple Pay/Google Pay integration
- **Blockchain Transactions** for direct wallet-to-wallet transfers

## 📁 Files Structure

```
examples/
├── webauthn-wallet-payment.js    # Frontend WebAuthn integration
├── webauthn-backend.ts           # Backend NestJS controllers
public/
└── webauthn-wallet-demo.html     # Interactive demo page
```

## 🚀 Quick Start

### 1. View the Demo
Open the interactive demo:
```
http://localhost:3000/webauthn-wallet-demo.html
```

### 2. Test WebAuthn Registration
1. Enter your PKP wallet address
2. Click "📱 Register Biometric"
3. Follow the browser prompts (TouchID/FaceID/Windows Hello)

### 3. Test Authentication
1. Click "🔐 Test Authentication"
2. Complete biometric verification
3. Receive a 5-minute authentication token

### 4. Process Payments
Choose payment method:
- **💳 Pay with Wallet** - Direct blockchain transaction
- **📱 Pay with Apple/Google Pay** - Native payment UI

## 🔧 Implementation Guide

### Frontend Integration

#### 1. Register WebAuthn Credential
```javascript
import { registerWebAuthnForWallet } from './examples/webauthn-wallet-payment.js';

async function setupBiometricWallet() {
  const pkpAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const userDisplayName = 'John Doe';
  
  try {
    const result = await registerWebAuthnForWallet(pkpAddress, userDisplayName);
    console.log('✅ Biometric wallet registered:', result);
  } catch (error) {
    console.error('❌ Registration failed:', error);
  }
}
```

#### 2. Authenticate for Payment
```javascript
import { authenticateWebAuthnForPayment } from './examples/webauthn-wallet-payment.js';

async function authenticatePayment() {
  const pkpAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const paymentDetails = {
    amount: 0.1,
    currency: 'ETH',
    recipient: '0xabcdef...',
    description: 'Premium Package'
  };
  
  try {
    const authResult = await authenticateWebAuthnForPayment(pkpAddress, paymentDetails);
    console.log('✅ Authentication successful:', authResult);
    return authResult.token; // Use for payment authorization
  } catch (error) {
    console.error('❌ Authentication failed:', error);
  }
}
```

#### 3. Process Wallet Payment
```javascript
import { processWebAuthnWalletPayment } from './examples/webauthn-wallet-payment.js';

async function makeWalletPayment() {
  try {
    const result = await processWebAuthnWalletPayment({
      pkpAddress: '0x1234567890abcdef1234567890abcdef12345678',
      recipientAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      amount: 0.1,
      currency: 'ETH',
      description: 'Premium Code Package',
      paymentMethod: 'wallet' // or 'apple-pay', 'google-pay'
    });
    
    if (result.success) {
      console.log('✅ Payment successful:', result.transactionHash);
    } else {
      console.error('❌ Payment failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Payment error:', error);
  }
}
```

### Backend Integration

#### 1. Add WebAuthn Module
```typescript
import { WebAuthnWalletModule } from './examples/webauthn-backend';

@Module({
  imports: [
    // ... existing modules
    WebAuthnWalletModule,
  ],
})
export class AppModule {}
```

#### 2. Register Biometric Endpoints
The backend provides these endpoints:

```typescript
POST /biometric/register        # Register WebAuthn credential
POST /biometric/verify          # Verify WebAuthn assertion
GET  /biometric/credentials/:pkp # Get credentials for PKP
POST /biometric/verify-token    # Verify biometric token

POST /pkp/sign-transaction      # Sign transaction with PKP
GET  /pkp/balance/:pkpAddress   # Get PKP wallet balance

POST /payments/webauthn-purchase # Process biometric payment
```

#### 3. Environment Configuration
```bash
# .env
RPC_URL=https://polygon-rpc.com
MERCHANT_ADDRESS=0x...
```

## 🔐 Security Features

### WebAuthn Security
- **Biometric data never transmitted** - stays on device
- **Public key cryptography** - impossible to replay attacks
- **Challenge-response authentication** - prevents man-in-the-middle
- **Origin verification** - prevents phishing attacks

### PKP Wallet Security
- **Decentralized key management** - no single point of failure
- **Programmable authentication** - custom signing conditions
- **Multi-factor support** - combine biometric + other factors
- **Audit trail** - all transactions cryptographically verifiable

### Payment Security
- **Token expiration** - 5-minute authentication windows
- **Payment-specific challenges** - each payment has unique signature
- **Amount verification** - payment details hashed into authentication
- **Replay attack prevention** - nonce-based transaction signing

## 📱 Browser Support

### WebAuthn Support
- ✅ **Safari** - TouchID, FaceID
- ✅ **Chrome** - TouchID, Windows Hello, Android biometric
- ✅ **Edge** - Windows Hello, TouchID (macOS)
- ✅ **Firefox** - Limited support, improving

### Payment Request API Support
- ✅ **Safari** - Apple Pay
- ✅ **Chrome** - Google Pay, Samsung Pay
- ✅ **Edge** - Microsoft Pay (limited)
- ❌ **Firefox** - Not supported

## 🧪 Testing Guide

### Test WebAuthn Registration
1. Open `webauthn-wallet-demo.html`
2. Check "WebAuthn Support: Supported ✅"
3. Enter PKP address and display name
4. Click "Register Biometric"
5. Complete device authentication prompt

### Test Authentication Flow
1. After registration, click "Test Authentication"
2. Complete biometric verification
3. Verify "Biometric Token: Valid ✅" appears
4. Check token expiration (5 minutes)

### Test Wallet Payment
1. Ensure authentication is valid
2. Enter recipient address and amount
3. Click "Pay with Wallet"
4. Complete biometric verification
5. Check for transaction hash in result

### Test Payment Request API
1. Ensure authentication is valid
2. Choose Apple Pay or Google Pay
3. Click "Pay with Apple/Google Pay"
4. Complete biometric + payment method verification
5. Verify payment completion

## 🔧 Troubleshooting

### Common Issues

#### WebAuthn Not Supported
```
Error: WebAuthn not supported in this browser
```
**Solution:** Use Safari, Chrome, or Edge with biometric hardware

#### Registration Failed
```
Error: Invalid attestation
```
**Solution:** 
- Check HTTPS connection (required for WebAuthn)
- Verify domain matches RP ID in backend
- Ensure biometric hardware is configured

#### Authentication Failed
```
Error: Challenge mismatch
```
**Solution:**
- Verify payment details match between frontend/backend
- Check system clock synchronization
- Ensure challenge includes payment hash

#### PKP Signing Failed
```
Error: PKP signing not implemented
```
**Solution:** Integrate with Lit Protocol for actual PKP signing

#### Payment Request Failed
```
Error: Payment Request API not supported
```
**Solution:** 
- Use supported browser (Safari for Apple Pay, Chrome for Google Pay)
- Configure merchant accounts for Apple Pay/Google Pay
- Verify HTTPS and valid domain

### Debug Mode
Enable debug logging:
```javascript
// Add to webauthn-wallet-payment.js
const DEBUG = true;

if (DEBUG) {
  console.log('WebAuthn credential options:', createCredentialOptions);
  console.log('Authentication assertion:', assertionData);
  console.log('Payment details hash:', paymentHash);
}
```

## 🚀 Production Deployment

### Security Checklist
- [ ] Use HTTPS everywhere (required for WebAuthn)
- [ ] Configure proper RP ID (your domain)
- [ ] Implement proper challenge generation (server-side)
- [ ] Use secure token storage (encrypted JWT tokens)
- [ ] Integrate real PKP signing (Lit Protocol)
- [ ] Set up proper CSP headers
- [ ] Implement rate limiting on auth endpoints
- [ ] Add monitoring and alerting for failed authentications

### Performance Optimization
- [ ] Cache biometric tokens in memory
- [ ] Implement credential pre-loading
- [ ] Use Web Workers for crypto operations
- [ ] Optimize bundle size (lazy load WebAuthn code)
- [ ] Implement connection pooling for blockchain RPC

### Merchant Account Setup
- [ ] Apple Pay merchant registration
- [ ] Google Pay merchant registration
- [ ] Configure payment processing backend
- [ ] Set up webhook handlers for payment events
- [ ] Implement proper error handling and retry logic

## 🔗 Integration with Existing Biometric Payment System

This WebAuthn implementation extends the existing biometric payment system:

```typescript
// Enhance existing BiometricVerificationService
@Injectable()
export class EnhancedBiometricVerificationService {
  constructor(
    private webAuthnService: WebAuthnService,
    private pkpWalletService: PKPWalletService
  ) {}

  async verifyBiometric(params: any) {
    // If WebAuthn token provided, use that
    if (params.webAuthnToken) {
      return await this.webAuthnService.verifyBiometricToken(params.webAuthnToken);
    }
    
    // Otherwise, fall back to existing verification
    return await this.existingBiometricVerification(params);
  }
}
```

## 📚 Additional Resources

- [WebAuthn Specification](https://w3c.github.io/webauthn/)
- [Payment Request API](https://w3c.github.io/payment-request/)
- [Lit Protocol PKP Documentation](https://developer.litprotocol.com/)
- [Apple Pay Integration Guide](https://developer.apple.com/apple-pay/)
- [Google Pay Integration Guide](https://developers.google.com/pay/)

## 🎯 Next Steps

1. **Test the demo** - Try the interactive demo page
2. **Integrate backend** - Add WebAuthn controllers to your app
3. **Configure PKP** - Set up Lit Protocol for real PKP signing
4. **Add merchant accounts** - Configure Apple Pay/Google Pay
5. **Deploy to production** - Follow security checklist

---

**Built with ❤️ by The Beach Team**  
**WebAuthn + PKP Wallets = The Future of Secure Payments**