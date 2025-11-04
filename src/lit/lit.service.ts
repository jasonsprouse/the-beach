import { Injectable } from '@nestjs/common';

@Injectable()
export class LitService {
  constructor() {
    console.log('Lit Protocol Service initialized');
  }

  /**
   * Get Lit Protocol configuration for client-side initialization
   */
  getConfig() {
    return {
      litNetwork: process.env.LIT_NETWORK || 'datil-dev',
      debug: process.env.NODE_ENV !== 'production',
    };
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
