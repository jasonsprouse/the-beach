import { Test, TestingModule } from '@nestjs/testing';
import { XrController } from './xr.controller';
import { AuthGuard } from '../auth/auth.guard';
import { LitService } from '../lit/lit.service';
import { MockLitService } from '../lit/lit.service.mock';
import { Response } from 'express';

describe('XrController', () => {
  let controller: XrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [XrController],
      providers: [
        AuthGuard,
        {
          provide: LitService,
          useClass: MockLitService,
        },
      ],
    }).compile();

    controller = module.get<XrController>(XrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getXrEnvironment', () => {
    it('should return the XR environment HTML file', () => {
      const mockSendFile = jest.fn();
      const mockResponse = {
        sendFile: mockSendFile,
      } as unknown as Response;

      controller.getXrEnvironment(mockResponse);

      expect(mockSendFile).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const callArg = mockSendFile.mock.calls[0][0] as string;
      expect(callArg).toContain('public');
      expect(callArg).toContain('xr-environment.html');
    });
  });

  describe('loadParadise', () => {
    it('should return success for authenticated request', () => {
      const result = controller.loadParadise();

      expect(result).toEqual({
        success: true,
        message: 'Paradise loading authorized',
        authenticated: true,
      });
    });
  });

  describe('getXrInfo', () => {
    it('should return XR environment information', () => {
      const result = controller.getXrInfo();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('features');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('endpoints');
      expect(result).toHaveProperty('requirements');
      expect(result.features).toBeInstanceOf(Array);
      expect(result.features.length).toBeGreaterThan(0);
    });
  });
});
