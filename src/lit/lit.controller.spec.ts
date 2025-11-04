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
      expect(config).toHaveProperty('initialized');
      expect(config.litNetwork).toBe('datil-dev');
      expect(config.debug).toBe(true);
      expect(config.initialized).toBe(true);
    });
  });

  describe('generateRegisterOptions', () => {
    it('should generate WebAuthn registration options', async () => {
      const mockSession = {};

      const result = await controller.generateRegisterOptions(mockSession);

      expect(result).toHaveProperty('challenge');
      expect(result).toHaveProperty('rp');
      expect(result).toHaveProperty('user');
      expect(mockSession).toHaveProperty('currentChallenge');
    });
  });

  describe('generateAuthenticateOptions', () => {
    it('should throw error when no authenticators registered', async () => {
      const mockSession = {};

      await expect(
        controller.generateAuthenticateOptions(mockSession),
      ).rejects.toThrow();
    });
  });
});
