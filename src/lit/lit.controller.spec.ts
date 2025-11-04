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
    it('should generate WebAuthn registration options with minimal data', async () => {
      const mockSession = {};
      const minimalBody = { username: 'testuser' };

      const result = await controller.generateRegisterOptions(
        minimalBody,
        mockSession,
      );

      expect(result).toHaveProperty('challenge');
      expect(result).toHaveProperty('rp');
      expect(result).toHaveProperty('user');
      expect(result.user.name).toBe('testuser');
      expect(result.user.displayName).toBe('testuser');
      expect(mockSession).toHaveProperty('currentChallenge');
    });

    it('should generate WebAuthn registration options without username', async () => {
      const mockSession = {};
      const emptyBody = {};

      const result = await controller.generateRegisterOptions(
        emptyBody,
        mockSession,
      );

      expect(result).toHaveProperty('challenge');
      expect(result).toHaveProperty('rp');
      expect(result).toHaveProperty('user');
      expect(result.user.name).toMatch(/^user_\d+$/);
      expect(mockSession).toHaveProperty('currentChallenge');
    });

    it('should reject username shorter than 3 characters', async () => {
      const mockSession = {};
      const invalidBody = { username: 'ab' };

      await expect(
        controller.generateRegisterOptions(invalidBody, mockSession),
      ).rejects.toThrow('Username must be at least 3 characters');
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
