import { Test, TestingModule } from '@nestjs/testing';
import { MockLitService } from './lit.service.mock';

describe('MockLitService', () => {
  let service: MockLitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockLitService],
    }).compile();

    service = module.get<MockLitService>(MockLitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return mock configuration', () => {
      const config = service.getConfig();
      expect(config).toEqual({
        litNetwork: 'datil-dev',
        debug: true,
      });
    });
  });

  describe('verifyAuthToken', () => {
    it('should return true for valid-token', async () => {
      const result = await service.verifyAuthToken('valid-token');
      expect(result).toBe(true);
    });

    it('should return false for invalid tokens', async () => {
      const result = await service.verifyAuthToken('invalid-token');
      expect(result).toBe(false);
    });

    it('should return false for empty token', async () => {
      const result = await service.verifyAuthToken('');
      expect(result).toBe(false);
    });
  });
});
