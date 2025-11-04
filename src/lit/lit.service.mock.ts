import { Injectable } from '@nestjs/common';

@Injectable()
export class MockLitService {
  getConfig() {
    return {
      litNetwork: 'datil-dev',
      debug: true,
    };
  }

  async verifyAuthToken(token: string): Promise<boolean> {
    return token === 'valid-token';
  }
}
