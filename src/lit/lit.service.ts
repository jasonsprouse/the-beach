import { Injectable, OnModuleInit } from '@nestjs/common';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

@Injectable()
export class LitService implements OnModuleInit {
  private litNodeClient: LitNodeClient;
  private isInitialized = false;

  constructor() {
    console.log('Lit Protocol Service initialized');
  }

  async onModuleInit() {
    await this.initializeLitClients();
  }

  /**
   * Initialize Lit Protocol clients on the backend
   */
  private async initializeLitClients() {
    try {
      const litNetwork = (process.env.LIT_NETWORK || 'datil-dev') as any;
      const debug = process.env.NODE_ENV !== 'production';

      // Initialize Lit Node Client
      this.litNodeClient = new LitNodeClient({
        litNetwork,
        debug,
      });

      await this.litNodeClient.connect();
      console.log('Lit Node Client connected successfully');

      this.isInitialized = true;
      console.log('Lit Protocol clients initialized successfully');
    } catch (error) {
      console.error('Error initializing Lit Protocol clients:', error);
      console.warn(
        'Continuing without Lit Protocol - some features may be limited',
      );
      // Don't throw error - allow app to start even if Lit Protocol can't connect
      // This is useful in sandboxed environments or when blockchain nodes are unavailable
    }
  }

  /**
   * Get Lit Protocol configuration for client-side initialization
   */
  getConfig() {
    return {
      litNetwork: process.env.LIT_NETWORK || 'datil-dev',
      debug: process.env.NODE_ENV !== 'production',
      initialized: this.isInitialized,
    };
  }

  /**
   * Get the Lit Node Client instance
   */
  getLitNodeClient(): LitNodeClient {
    if (!this.isInitialized) {
      throw new Error('Lit Protocol clients not initialized');
    }
    return this.litNodeClient;
  }

  /**
   * Verify authentication token
   * Validates the session signatures from Lit Protocol
   * @param token - JSON string containing session signatures
   * @returns Promise<boolean> - True if token is valid
   */
  /**
   * Interface for session signature structure
   */
  private isValidSessionSignature(
    sig: unknown,
  ): sig is { sig: string; derivedVia: string; signedMessage: string } {
    const sigObj = sig as Record<string, unknown>;
    return Boolean(
      sigObj && sigObj.sig && sigObj.derivedVia && sigObj.signedMessage,
    );
  }

  verifyAuthToken(token: string): Promise<boolean> {
    try {
      // Parse the session signatures
      const sessionSigs = JSON.parse(token) as unknown;

      // Basic validation - check if sessionSigs has required structure
      if (!sessionSigs || typeof sessionSigs !== 'object') {
        console.warn('Invalid session signatures format');
        return Promise.resolve(false);
      }

      const sessionSigsObj = sessionSigs as Record<string, unknown>;

      // Check if sessionSigs contains at least one signature
      const sigKeys = Object.keys(sessionSigsObj);
      if (sigKeys.length === 0) {
        console.warn('No signatures found in session');
        return Promise.resolve(false);
      }

      // Validate each signature has required fields
      for (const key of sigKeys) {
        const sig = sessionSigsObj[key];
        if (!this.isValidSessionSignature(sig)) {
          console.warn('Invalid signature structure for key:', key);
          return Promise.resolve(false);
        }
      }

      // TODO: In production, add additional verification:
      // - Verify signature cryptographically
      // - Check expiration time
      // - Verify against PKP public key
      // - Validate resource ability requests

      console.log('Token verification successful');
      return Promise.resolve(true);
    } catch (error) {
      console.error('Error verifying token:', error);
      return Promise.resolve(false);
    }
  }
}
