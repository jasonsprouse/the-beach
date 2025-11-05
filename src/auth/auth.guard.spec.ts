import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { LitService } from '../lit/lit.service';
import { MockLitService } from '../lit/lit.service.mock';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: LitService,
          useClass: MockLitService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid authorization header', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer valid-token',
      });

      const result = await guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const mockContext = createMockExecutionContext({});

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'No valid authentication found. Please login again.',
      );
    });

    it('should throw UnauthorizedException for invalid token format (missing Bearer)', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'valid-token',
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Invalid token format',
      );
    });

    it('should throw UnauthorizedException for invalid token format (missing token)', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer ',
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Invalid token format',
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer invalid-token',
      });

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        'Invalid token',
      );
    });
  });
});

function createMockExecutionContext(
  headers: Record<string, string>,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
      }),
    }),
  } as ExecutionContext;
}
