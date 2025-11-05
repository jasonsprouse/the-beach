import { Injectable } from '@nestjs/common';

@Injectable()
export class MockLitService {
  private isInitialized = true;

  async onModuleInit() {
    // Mock initialization - nothing to do
  }

  getConfig() {
    return {
      litNetwork: 'datil-dev',
      debug: true,
      initialized: this.isInitialized,
    };
  }

  getLitNodeClient() {
    return null; // Mock - not used in tests
  }

  verifyAuthToken(token: string): Promise<boolean> {
    return Promise.resolve(token === 'valid-token');
  }
}
