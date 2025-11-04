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
  verifyAuthToken(token: string): Promise<boolean> {
    return Promise.resolve(
      ((): boolean => {
        try {
          // Parse the session signatures
          const sessionSigs = JSON.parse(token) as unknown;

          // Basic validation - check if sessionSigs has required structure
          if (!sessionSigs || typeof sessionSigs !== 'object') {
            console.warn('Invalid session signatures format');
            return false;
          }

          // Check if sessionSigs contains at least one signature
          const sigKeys = Object.keys(sessionSigs as Record<string, unknown>);
          if (sigKeys.length === 0) {
            console.warn('No signatures found in session');
            return false;
          }

          // Validate each signature has required fields
          for (const key of sigKeys) {
            const sig = (sessionSigs as Record<string, unknown>)[
              key
            ] as Record<string, unknown>;
            if (!sig.sig || !sig.derivedVia || !sig.signedMessage) {
              console.warn('Invalid signature structure for key:', key);
              return false;
            }
          }

          // TODO: In production, add additional verification:
          // - Verify signature cryptographically
          // - Check expiration time
          // - Verify against PKP public key
          // - Validate resource ability requests

          console.log('Token verification successful');
          return true;
        } catch (error) {
          console.error('Error verifying token:', error);
          return false;
        }
      })(),
    );
  }
}
