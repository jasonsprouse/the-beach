import { Injectable } from '@nestjs/common';

@Injectable()
export class LitAuthService {
  private readonly pkpStore: Map<string, string> = new Map();

  async associatePkp(username: string, pkpPublicKey: string) {
    if (this.pkpStore.has(username)) {
      return { success: false, message: 'Username already exists' };
    }
    this.pkpStore.set(username, pkpPublicKey);
    return { success: true };
  }

  async getPkp(username: string) {
    const pkpPublicKey = this.pkpStore.get(username);
    if (!pkpPublicKey) {
      return { success: false, message: 'User not found' };
    }
    return { success: true, pkpPublicKey };
  }
}
