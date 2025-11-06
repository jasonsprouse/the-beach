/**
 * Backend Integration for WebAuthn Wallet Payments
 * 
 * NestJS controllers and services to handle WebAuthn authentication
 * and integrate with PKP wallet transactions
 */

import { Controller, Post, Get, Body, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import * as cbor from 'cbor-x';
import * as crypto from 'crypto';

// =============================================================================
// 1. WebAuthn Biometric Controller
// =============================================================================

@Controller('biometric')
export class BiometricWalletController {
  private readonly logger = new Logger(BiometricWalletController.name);

  constructor(
    private readonly webAuthnService: WebAuthnService,
    private readonly pkpWalletService: PKPWalletService
  ) {}

  /**
   * Register WebAuthn credential for PKP wallet
   */
  @Post('register')
  async registerCredential(@Body() credentialData: any) {
    try {
      // Verify attestation
      const verificationResult = await this.webAuthnService.verifyAttestation(credentialData);
      
      if (!verificationResult.verified) {
        throw new HttpException('Invalid attestation', HttpStatus.BAD_REQUEST);
      }

      // Store credential linked to PKP address
      const storedCredential = await this.webAuthnService.storeCredential({
        credentialId: credentialData.id,
        publicKey: verificationResult.publicKey,
        pkpAddress: credentialData.pkpAddress,
        attestationObject: credentialData.response.attestationObject,
        registeredAt: Date.now()
      });

      this.logger.log(`Registered WebAuthn credential for PKP: ${credentialData.pkpAddress}`);

      return {
        success: true,
        credentialId: credentialData.id,
        pkpAddress: credentialData.pkpAddress,
        registeredAt: storedCredential.registeredAt
      };

    } catch (error) {
      this.logger.error('Failed to register WebAuthn credential:', error);
      throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verify WebAuthn assertion for payment
   */
  @Post('verify')
  async verifyAssertion(@Body() assertionData: any) {
    try {
      // Get stored credential
      const credential = await this.webAuthnService.getCredential(assertionData.id);
      if (!credential) {
        throw new HttpException('Credential not found', HttpStatus.NOT_FOUND);
      }

      // Verify assertion
      const verificationResult = await this.webAuthnService.verifyAssertion(
        assertionData,
        credential
      );

      if (!verificationResult.verified) {
        throw new HttpException('Invalid assertion', HttpStatus.UNAUTHORIZED);
      }

      // Generate biometric token for payment
      const biometricToken = await this.webAuthnService.generateBiometricToken({
        pkpAddress: credential.pkpAddress,
        credentialId: assertionData.id,
        paymentDetails: assertionData.paymentDetails,
        authenticatedAt: Date.now()
      });

      this.logger.log(`WebAuthn verification successful for PKP: ${credential.pkpAddress}`);

      return {
        success: true,
        token: biometricToken,
        id: assertionData.id,
        pkpAddress: credential.pkpAddress,
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
      };

    } catch (error) {
      this.logger.error('WebAuthn verification failed:', error);
      throw new HttpException('Verification failed', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Get registered credentials for PKP address
   */
  @Get('credentials/:pkpAddress')
  async getCredentials(@Param('pkpAddress') pkpAddress: string) {
    const credentials = await this.webAuthnService.getCredentialsByPKP(pkpAddress);
    
    return credentials.map(cred => ({
      id: cred.credentialId,
      rawId: Buffer.from(cred.credentialId, 'base64').toJSON().data,
      registeredAt: cred.registeredAt
    }));
  }

  /**
   * Verify biometric token validity
   */
  @Post('verify-token')
  async verifyToken(@Body() { token }: { token: string }) {
    const isValid = await this.webAuthnService.verifyBiometricToken(token);
    return { valid: isValid };
  }
}

// =============================================================================
// 2. PKP Wallet Transaction Controller
// =============================================================================

@Controller('pkp')
export class PKPWalletController {
  private readonly logger = new Logger(PKPWalletController.name);

  constructor(
    private readonly pkpWalletService: PKPWalletService,
    private readonly webAuthnService: WebAuthnService
  ) {}

  /**
   * Sign transaction using PKP with biometric verification
   */
  @Post('sign-transaction')
  async signTransaction(
    @Body() transactionRequest: any,
    @Headers('authorization') authHeader: string
  ) {
    try {
      // Extract biometric token
      const token = authHeader?.replace('Bearer ', '');
      if (!token) {
        throw new HttpException('Missing biometric token', HttpStatus.UNAUTHORIZED);
      }

      // Verify biometric token
      const tokenData = await this.webAuthnService.verifyBiometricToken(token);
      if (!tokenData) {
        throw new HttpException('Invalid biometric token', HttpStatus.UNAUTHORIZED);
      }

      // Verify PKP address matches
      if (tokenData.pkpAddress !== transactionRequest.pkpAddress) {
        throw new HttpException('PKP address mismatch', HttpStatus.FORBIDDEN);
      }

      // Sign transaction using PKP
      const signedTransaction = await this.pkpWalletService.signTransaction({
        pkpAddress: transactionRequest.pkpAddress,
        transactionData: transactionRequest.transactionData,
        biometricVerified: true,
        authenticationId: transactionRequest.authenticationId
      });

      this.logger.log(`Transaction signed for PKP: ${transactionRequest.pkpAddress}`);

      return {
        success: true,
        signedTransaction,
        pkpAddress: transactionRequest.pkpAddress,
        timestamp: Date.now()
      };

    } catch (error) {
      this.logger.error('Transaction signing failed:', error);
      throw new HttpException('Signing failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get PKP wallet balance
   */
  @Get('balance/:pkpAddress')
  async getBalance(@Param('pkpAddress') pkpAddress: string) {
    const balance = await this.pkpWalletService.getBalance(pkpAddress);
    return { pkpAddress, balance };
  }
}

// =============================================================================
// 3. WebAuthn Service Implementation
// =============================================================================

@Injectable()
export class WebAuthnService {
  private readonly logger = new Logger(WebAuthnService.name);
  private readonly rpId = 'the-beach.app';
  private readonly rpName = 'The Beach - Biometric Wallet';

  // In production, use database storage
  private credentials = new Map<string, any>();
  private biometricTokens = new Map<string, any>();

  /**
   * Verify WebAuthn attestation during registration
   */
  async verifyAttestation(credentialData: any): Promise<any> {
    try {
      // Decode attestation object
      const attestationObject = Buffer.from(credentialData.response.attestationObject);
      const attestation = cbor.decode(attestationObject);

      // Extract authenticator data
      const authData = attestation.authData;
      const rpIdHash = authData.slice(0, 32);
      const flags = authData[32];
      const signCount = authData.slice(33, 37).readUInt32BE(0);

      // Verify RP ID hash
      const expectedRpIdHash = crypto.createHash('sha256').update(this.rpId).digest();
      if (!rpIdHash.equals(expectedRpIdHash)) {
        throw new Error('RP ID hash mismatch');
      }

      // Check user presence and verification flags
      const userPresent = (flags & 0x01) !== 0;
      const userVerified = (flags & 0x04) !== 0;

      if (!userPresent || !userVerified) {
        throw new Error('User presence or verification failed');
      }

      // Extract credential data (simplified)
      const credentialData_offset = 37;
      const aaguid = authData.slice(credentialData_offset, credentialData_offset + 16);
      const credentialIdLength = authData.slice(credentialData_offset + 16, credentialData_offset + 18).readUInt16BE(0);
      const credentialId = authData.slice(credentialData_offset + 18, credentialData_offset + 18 + credentialIdLength);
      const publicKeyBytes = authData.slice(credentialData_offset + 18 + credentialIdLength);

      // Decode public key (CBOR format)
      const publicKey = cbor.decode(publicKeyBytes);

      return {
        verified: true,
        publicKey,
        credentialId: credentialId.toString('base64'),
        signCount
      };

    } catch (error) {
      this.logger.error('Attestation verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Verify WebAuthn assertion during authentication
   */
  async verifyAssertion(assertionData: any, storedCredential: any): Promise<any> {
    try {
      // Decode client data
      const clientDataJSON = Buffer.from(assertionData.response.clientDataJSON);
      const clientData = JSON.parse(clientDataJSON.toString());

      // Verify challenge (should include payment details hash)
      const paymentHash = crypto.createHash('sha256')
        .update(JSON.stringify(assertionData.paymentDetails))
        .digest();
      
      const expectedChallenge = Buffer.from(paymentHash).toString('base64url');
      if (clientData.challenge !== expectedChallenge) {
        throw new Error('Challenge mismatch');
      }

      // Verify origin
      if (clientData.origin !== `https://${this.rpId}`) {
        throw new Error('Origin mismatch');
      }

      // Decode authenticator data
      const authenticatorData = Buffer.from(assertionData.response.authenticatorData);
      const rpIdHash = authenticatorData.slice(0, 32);
      const flags = authenticatorData[32];

      // Verify RP ID hash
      const expectedRpIdHash = crypto.createHash('sha256').update(this.rpId).digest();
      if (!rpIdHash.equals(expectedRpIdHash)) {
        throw new Error('RP ID hash mismatch');
      }

      // Check user presence and verification
      const userPresent = (flags & 0x01) !== 0;
      const userVerified = (flags & 0x04) !== 0;

      if (!userPresent || !userVerified) {
        throw new Error('User presence or verification failed');
      }

      // Verify signature (simplified - use proper crypto library in production)
      const signature = Buffer.from(assertionData.response.signature);
      const signedData = Buffer.concat([authenticatorData, crypto.createHash('sha256').update(clientDataJSON).digest()]);

      // In production, verify signature using stored public key
      // const isValidSignature = crypto.verify('sha256', signedData, storedCredential.publicKey, signature);

      return {
        verified: true, // In production, return isValidSignature
        userVerified,
        signCount: 0 // Extract from authenticator data
      };

    } catch (error) {
      this.logger.error('Assertion verification failed:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Store WebAuthn credential
   */
  async storeCredential(credentialData: any): Promise<any> {
    this.credentials.set(credentialData.credentialId, credentialData);
    return credentialData;
  }

  /**
   * Get stored credential by ID
   */
  async getCredential(credentialId: string): Promise<any> {
    return this.credentials.get(credentialId);
  }

  /**
   * Get all credentials for PKP address
   */
  async getCredentialsByPKP(pkpAddress: string): Promise<any[]> {
    const results = [];
    for (const [id, credential] of this.credentials) {
      if (credential.pkpAddress === pkpAddress) {
        results.push(credential);
      }
    }
    return results;
  }

  /**
   * Generate biometric token after successful authentication
   */
  async generateBiometricToken(data: any): Promise<string> {
    const tokenData = {
      ...data,
      issuedAt: Date.now(),
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    };

    // In production, use JWT or encrypted tokens
    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    this.biometricTokens.set(token, tokenData);

    return token;
  }

  /**
   * Verify biometric token
   */
  async verifyBiometricToken(token: string): Promise<any> {
    const tokenData = this.biometricTokens.get(token);
    
    if (!tokenData) {
      return null;
    }

    if (Date.now() > tokenData.expiresAt) {
      this.biometricTokens.delete(token);
      return null;
    }

    return tokenData;
  }
}

// =============================================================================
// 4. PKP Wallet Service Implementation
// =============================================================================

@Injectable()
export class PKPWalletService {
  private readonly logger = new Logger(PKPWalletService.name);
  private readonly provider: ethers.providers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  }

  /**
   * Sign transaction using PKP
   */
  async signTransaction(params: {
    pkpAddress: string;
    transactionData: any;
    biometricVerified: boolean;
    authenticationId: string;
  }): Promise<string> {

    if (!params.biometricVerified) {
      throw new Error('Biometric verification required');
    }

    // In production, use actual PKP signing
    // This is a simplified example
    try {
      // Get PKP private key (in production, this would be done through Lit Protocol)
      const pkpPrivateKey = await this.getPKPPrivateKey(params.pkpAddress);
      const wallet = new ethers.Wallet(pkpPrivateKey, this.provider);

      // Sign transaction
      const signedTransaction = await wallet.signTransaction(params.transactionData);

      this.logger.log(`Transaction signed with PKP: ${params.pkpAddress}`);
      return signedTransaction;

    } catch (error) {
      this.logger.error('PKP transaction signing failed:', error);
      throw error;
    }
  }

  /**
   * Get PKP wallet balance
   */
  async getBalance(pkpAddress: string): Promise<string> {
    const balance = await this.provider.getBalance(pkpAddress);
    return ethers.utils.formatEther(balance);
  }

  /**
   * Get PKP private key (placeholder - use Lit Protocol in production)
   */
  private async getPKPPrivateKey(pkpAddress: string): Promise<string> {
    // In production, interact with Lit Protocol to get PKP signing capability
    // This is just a placeholder
    throw new Error('PKP signing not implemented - integrate with Lit Protocol');
  }
}

// =============================================================================
// 5. Module Configuration
// =============================================================================

import { Module } from '@nestjs/common';

@Module({
  controllers: [BiometricWalletController, PKPWalletController],
  providers: [WebAuthnService, PKPWalletService],
  exports: [WebAuthnService, PKPWalletService],
})
export class WebAuthnWalletModule {}

// =============================================================================
// 6. Integration with Existing Biometric Payment System
// =============================================================================

/**
 * Enhanced Biometric Purchase endpoint that supports WebAuthn
 */
@Controller('payments')
export class EnhancedPaymentController {
  
  constructor(
    private readonly webAuthnService: WebAuthnService,
    private readonly pkpWalletService: PKPWalletService,
    private readonly webPaymentService: any // Your existing service
  ) {}

  @Post('webauthn-purchase')
  async processWebAuthnPurchase(@Body() purchaseData: {
    pkpAddress: string;
    amount: number;
    description: string;
    paymentMethod: 'wallet' | 'apple-pay' | 'google-pay';
    biometricToken: string;
  }) {
    
    // Verify biometric token
    const tokenData = await this.webAuthnService.verifyBiometricToken(purchaseData.biometricToken);
    if (!tokenData) {
      throw new HttpException('Invalid biometric token', HttpStatus.UNAUTHORIZED);
    }

    // Process payment based on method
    if (purchaseData.paymentMethod === 'wallet') {
      // Direct wallet transaction
      const transactionData = {
        from: purchaseData.pkpAddress,
        to: process.env.MERCHANT_ADDRESS,
        value: ethers.utils.parseEther(purchaseData.amount.toString()),
        gasLimit: 21000
      };

      const signedTx = await this.pkpWalletService.signTransaction({
        pkpAddress: purchaseData.pkpAddress,
        transactionData,
        biometricVerified: true,
        authenticationId: tokenData.authenticationId
      });

      // Broadcast transaction
      const txResponse = await this.provider.sendTransaction(signedTx);
      
      return {
        success: true,
        transactionHash: txResponse.hash,
        paymentMethod: 'wallet',
        biometricVerified: true
      };

    } else {
      // Use existing Payment Request API flow
      return await this.webPaymentService.processPaymentRequest({
        ...purchaseData,
        biometricVerified: true,
        biometricToken: purchaseData.biometricToken
      });
    }
  }
}