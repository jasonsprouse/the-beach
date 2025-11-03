import { Injectable, OnModuleInit } from '@nestjs/common';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

@Injectable()
export class LitService implements OnModuleInit {
  private litNodeClient: LitNodeClient;

  constructor() {
    console.log('Lit Protocol Service initializing...');
  }

  async onModuleInit() {
    this.litNodeClient = new LitNodeClient({
      litNetwork: (process.env.LIT_NETWORK || 'cayenne') as any,
    });
    await this.litNodeClient.connect();
    console.log('Lit Protocol Service initialized and connected.');
  }

  /**
   * Get Lit Protocol configuration for client-side initialization
   */
  getConfig() {
    return {
      litNetwork: process.env.LIT_NETWORK || 'cayenne',
      debug: process.env.NODE_ENV !== 'production',
    };
  }

  /**
   * Verify authentication token using a Lit Action
   */
  async verifyAuthToken(token: string): Promise<boolean> {
    if (!this.litNodeClient.ready) {
      console.error('LitNodeClient not ready');
      return false;
    }
    try {
      const sessionSigs = JSON.parse(token);

      const res = await this.litNodeClient.executeJs({
        code: `(async () => {
          const verified = await Lit.Actions.verifySessionSig({
            sessionSig: sessionSigs,
          });
          Lit.Actions.setResponse({response: JSON.stringify({verified})});
        })();`,
        sessionSigs,
      });

      const { response } = res;
      const result = JSON.parse(response as string);
      return result.verified;
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return false;
    }
  }
}
