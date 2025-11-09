import { Test, TestingModule } from '@nestjs/testing';
import { GameManagerService } from './game-manager.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PKPAuthService } from './services/pkp-auth.service';

describe('GameManagerService', () => {
  let service: GameManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameManagerService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: PKPAuthService,
          useValue: {
            isMainPKP: jest.fn().mockReturnValue(true),
            isSubPKP: jest.fn().mockReturnValue(false),
            getParentPKP: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GameManagerService>(GameManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLastCompletedSession', () => {
    it('should return null if there are no completed sessions', () => {
      expect(service.getLastCompletedSession()).toBeNull();
    });

    it('should return the last completed session', async () => {
      const agentPKP = {
        address: '0x123',
        publicKey: '0x456',
      };
      const agent = await service.registerAgent(agentPKP, 'test-agent', []);
      const session1 = await service.createSession({ id: 'customer-1' }, agent, 'test-service');
      const session2 = await service.createSession({ id: 'customer-2' }, agent, 'test-service');

      // Mock Date.now to control timestamps
      const dateSpy = jest.spyOn(Date, 'now');

      dateSpy.mockReturnValue(1000);
      await service.completeSession(session1.id);

      dateSpy.mockReturnValue(2000);
      await service.completeSession(session2.id);

      const lastSession = service.getLastCompletedSession();
      expect(lastSession).toBeDefined();
      if (lastSession) {
        expect(lastSession.id).toBe(session2.id);
      }
      dateSpy.mockRestore();
    });
  });
});
