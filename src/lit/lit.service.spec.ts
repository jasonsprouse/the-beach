import { Test, TestingModule } from '@nestjs/testing';
import { LitService } from './lit.service';

describe('LitService', () => {
  let service: LitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LitService],
    }).compile();

    service = module.get<LitService>(LitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return Lit Protocol configuration', () => {
      const config = service.getConfig();
      expect(config).toHaveProperty('litNetwork');
      expect(config).toHaveProperty('debug');
      expect(config.litNetwork).toBe('datil-dev');
    });
  });

  describe('verifyAuthToken', () => {
    it('should return true for valid session signatures', async () => {
      const validToken = JSON.stringify({
        'https://node.litgateway.com': {
          sig: 'valid-signature',
          derivedVia: 'web3.eth.personal.sign',
          signedMessage: 'test-message',
          address: '0xtest',
        },
      });

      const result = await service.verifyAuthToken(validToken);
      expect(result).toBe(true);
    });

    it('should return false for invalid JSON', async () => {
      const invalidToken = 'not-valid-json';
      const result = await service.verifyAuthToken(invalidToken);
      expect(result).toBe(false);
    });

    it('should return false for empty session signatures', async () => {
      const emptyToken = JSON.stringify({});
      const result = await service.verifyAuthToken(emptyToken);
      expect(result).toBe(false);
    });

    it('should return false for malformed signature structure', async () => {
      const malformedToken = JSON.stringify({
        'https://node.litgateway.com': {
          sig: 'valid-signature',
          // missing derivedVia and signedMessage
        },
      });

      const result = await service.verifyAuthToken(malformedToken);
      expect(result).toBe(false);
    });

    it('should return false for non-object token', async () => {
      const invalidToken = JSON.stringify('string-value');
      const result = await service.verifyAuthToken(invalidToken);
      expect(result).toBe(false);
    });
  });
});
