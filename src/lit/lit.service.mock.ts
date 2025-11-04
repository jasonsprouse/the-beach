import { Injectable } from '@nestjs/common';

@Injectable()
export class MockLitService {
  getConfig() {
    return {
      litNetwork: 'datil-dev',
      debug: true,
    };
  }

  verifyAuthToken(token: string): Promise<boolean> {
    return Promise.resolve(token === 'valid-token');
  }
}
