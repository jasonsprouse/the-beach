import { Test, TestingModule } from '@nestjs/testing';
import { LitController } from './lit.controller';
import { LitService } from './lit.service';
import { MockLitService } from './lit.service.mock';

describe('LitController', () => {
  let controller: LitController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LitController],
      providers: [
        {
          provide: LitService,
          useClass: MockLitService,
        },
      ],
    }).compile();

    controller = module.get<LitController>(LitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return Lit Protocol configuration', () => {
      const config = controller.getConfig();

      expect(config).toHaveProperty('litNetwork');
      expect(config).toHaveProperty('debug');
      expect(config.litNetwork).toBe('datil-dev');
      expect(config.debug).toBe(true);
    });
  });

  describe('verifyWebAuthnRegistration', () => {
    it('should return success for WebAuthn registration verification', () => {
      const mockOptions = {
        challenge: 'mock-challenge',
        rp: {
          name: 'The Beach',
          id: 'localhost',
        },
        user: {
          id: 'mock-user-id',
          name: 'test@example.com',
          displayName: 'Test User',
        },
        pubKeyCredParams: [],
        timeout: 60000,
        attestation: 'none' as const,
      };

      const result = controller.verifyWebAuthnRegistration(mockOptions);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(true);
    });
  });
});
