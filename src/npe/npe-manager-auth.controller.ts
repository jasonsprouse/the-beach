import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import {
  NPEManagerAuthService,
  AuthType,
  NPEManagerRole,
  NPEManagerProfile,
  SubPKPTaskManager,
  TaskApprovalRequest,
  AuthSession,
} from './services/npe-manager-auth.service';

/**
 * NPE Manager Authentication Controller
 * Production-ready API for managing NPE managers and their sub-PKP task managers
 */
@Controller('npe-manager')
export class NPEManagerAuthController {
  private readonly logger = new Logger(NPEManagerAuthController.name);

  constructor(private readonly authService: NPEManagerAuthService) {}

  /**
   * Authenticate NPE Manager
   * POST /npe-manager/auth/login
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body()
    body: {
      authType: AuthType;
      authProviderId: string;
      email?: string;
      name?: string;
      accessToken?: string;
      credential?: string;
      challenge?: string;
    },
    @Headers('x-forwarded-for') ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{
    success: boolean;
    manager: NPEManagerProfile;
    session: AuthSession;
    message: string;
  }> {
    this.logger.log(
      `Login attempt: ${body.authType} - ${body.email || body.authProviderId}`,
    );

    const result = await this.authService.authenticateManager({
      ...body,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
    });

    return {
      success: true,
      manager: result.manager,
      session: result.session,
      message: 'Authentication successful',
    };
  }

  /**
   * Login with Google
   * POST /npe-manager/auth/google
   */
  @Post('auth/google')
  @HttpCode(HttpStatus.OK)
  async loginWithGoogle(
    @Body() body: { accessToken: string; email: string; name: string },
    @Headers('x-forwarded-for') ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.login(
      {
        authType: AuthType.GOOGLE,
        authProviderId: body.email,
        email: body.email,
        name: body.name,
        accessToken: body.accessToken,
      },
      ipAddress,
      userAgent,
    );
  }

  /**
   * Login with Discord
   * POST /npe-manager/auth/discord
   */
  @Post('auth/discord')
  @HttpCode(HttpStatus.OK)
  async loginWithDiscord(
    @Body() body: { accessToken: string; userId: string; username: string },
    @Headers('x-forwarded-for') ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.login(
      {
        authType: AuthType.DISCORD,
        authProviderId: body.userId,
        name: body.username,
        accessToken: body.accessToken,
      },
      ipAddress,
      userAgent,
    );
  }

  /**
   * Login with GitHub
   * POST /npe-manager/auth/github
   */
  @Post('auth/github')
  @HttpCode(HttpStatus.OK)
  async loginWithGitHub(
    @Body()
    body: {
      accessToken: string;
      userId: string;
      username: string;
      email?: string;
    },
    @Headers('x-forwarded-for') ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.login(
      {
        authType: AuthType.GITHUB,
        authProviderId: body.userId,
        email: body.email,
        name: body.username,
        accessToken: body.accessToken,
      },
      ipAddress,
      userAgent,
    );
  }

  /**
   * Login with WebAuthn (Biometric)
   * POST /npe-manager/auth/webauthn
   */
  @Post('auth/webauthn')
  @HttpCode(HttpStatus.OK)
  async loginWithWebAuthn(
    @Body() body: { credential: string; challenge: string; userId: string },
    @Headers('x-forwarded-for') ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.login(
      {
        authType: AuthType.WEBAUTHN,
        authProviderId: body.userId,
        credential: body.credential,
        challenge: body.challenge,
      },
      ipAddress,
      userAgent,
    );
  }

  /**
   * Login with Passkey (Platform Authenticator)
   * POST /npe-manager/auth/passkey
   */
  @Post('auth/passkey')
  @HttpCode(HttpStatus.OK)
  async loginWithPasskey(
    @Body() body: { credential: string; challenge: string; userId: string },
    @Headers('x-forwarded-for') ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.login(
      {
        authType: AuthType.PASSKEY,
        authProviderId: body.userId,
        credential: body.credential,
        challenge: body.challenge,
      },
      ipAddress,
      userAgent,
    );
  }

  /**
   * Verify session
   * GET /npe-manager/auth/verify
   */
  @Get('auth/verify')
  verifySession(@Headers('authorization') authHeader: string): {
    success: boolean;
    session: AuthSession;
  } {
    const sessionId = this.extractSessionId(authHeader);
    const session = this.authService.verifySession(sessionId);
    return { success: true, session };
  }

  /**
   * Generate API key
   * POST /npe-manager/auth/api-key
   */
  @Post('auth/api-key')
  async generateAPIKey(@Headers('authorization') authHeader: string): Promise<{
    success: boolean;
    apiKey: string;
    message: string;
  }> {
    const sessionId = this.extractSessionId(authHeader);
    const session = this.authService.verifySession(sessionId);
    const apiKey = this.authService.generateAPIKey(session.managerId);

    return {
      success: true,
      apiKey,
      message: 'API key generated successfully',
    };
  }

  /**
   * Create Sub-PKP Task Manager
   * POST /npe-manager/sub-pkp
   */
  @Post('sub-pkp')
  async createSubPKP(
    @Headers('authorization') authHeader: string,
    @Body()
    body: {
      purpose: SubPKPTaskManager['purpose'];
      name: string;
      description: string;
      autonomyLevel: SubPKPTaskManager['autonomyLevel'];
      gameManagerType: SubPKPTaskManager['gameManagerType'];
      spendingLimit?: Partial<SubPKPTaskManager['spendingLimit']>;
      improvementGoals?: Partial<SubPKPTaskManager['improvementGoals']>;
    },
  ): Promise<{
    success: boolean;
    subPKP: SubPKPTaskManager;
    message: string;
  }> {
    const managerId = await this.getManagerId(authHeader);
    const subPKP = await this.authService.createSubPKPTaskManager(
      managerId,
      body,
    );

    return {
      success: true,
      subPKP,
      message: 'Sub-PKP task manager created successfully',
    };
  }

  /**
   * Get all sub-PKPs for manager
   * GET /npe-manager/sub-pkp
   */
  @Get('sub-pkp')
  async getSubPKPs(@Headers('authorization') authHeader: string): Promise<{
    success: boolean;
    subPKPs: SubPKPTaskManager[];
    count: number;
  }> {
    const managerId = await this.getManagerId(authHeader);
    const subPKPs = this.authService.getManagerSubPKPs(managerId);

    return {
      success: true,
      subPKPs,
      count: subPKPs.length,
    };
  }

  /**
   * Request task approval
   * POST /npe-manager/approval/request
   */
  @Post('approval/request')
  async requestApproval(
    @Headers('authorization') authHeader: string,
    @Body()
    body: {
      subPKPId: string;
      action: string;
      taskDescription: string;
      estimatedCost: number;
      estimatedTime: number;
      riskLevel: TaskApprovalRequest['riskLevel'];
      aiConfidence: number;
      aiReasoning: string;
    },
  ): Promise<{
    success: boolean;
    request: TaskApprovalRequest;
    message: string;
  }> {
    // Verify the request is coming from a valid sub-PKP
    await this.getManagerId(authHeader);

    const request = await this.authService.requestTaskApproval(body.subPKPId, {
      action: body.action,
      taskDescription: body.taskDescription,
      estimatedCost: body.estimatedCost,
      estimatedTime: body.estimatedTime,
      riskLevel: body.riskLevel,
      aiConfidence: body.aiConfidence,
      aiReasoning: body.aiReasoning,
    });

    return {
      success: true,
      request,
      message:
        request.status === 'approved'
          ? 'Request auto-approved'
          : 'Approval requested',
    };
  }

  /**
   * Respond to approval request
   * PUT /npe-manager/approval/:requestId
   */
  @Put('approval/:requestId')
  async respondToApproval(
    @Headers('authorization') authHeader: string,
    @Param('requestId') requestId: string,
    @Body()
    body: {
      approved: boolean;
      reason?: string;
      conditions?: string[];
    },
  ): Promise<{
    success: boolean;
    request: TaskApprovalRequest;
    message: string;
  }> {
    const managerId = await this.getManagerId(authHeader);
    const request = await this.authService.respondToApproval(
      requestId,
      managerId,
      body,
    );

    return {
      success: true,
      request,
      message: `Approval ${body.approved ? 'granted' : 'rejected'}`,
    };
  }

  /**
   * Get pending approvals
   * GET /npe-manager/approval/pending
   */
  @Get('approval/pending')
  async getPendingApprovals(
    @Headers('authorization') authHeader: string,
  ): Promise<{
    success: boolean;
    requests: TaskApprovalRequest[];
    count: number;
  }> {
    const managerId = await this.getManagerId(authHeader);
    const requests = this.authService.getPendingApprovals(managerId);

    return {
      success: true,
      requests,
      count: requests.length,
    };
  }

  /**
   * Get manager dashboard
   * GET /npe-manager/dashboard
   */
  @Get('dashboard')
  async getDashboard(@Headers('authorization') authHeader: string): Promise<{
    success: boolean;
    manager: NPEManagerProfile;
    subPKPs: SubPKPTaskManager[];
    pendingApprovals: TaskApprovalRequest[];
    stats: {
      totalSubPKPs: number;
      activeSubPKPs: number;
      totalTasksCompleted: number;
      averageSuccessRate: number;
      totalSpent: number;
      pendingApprovals: number;
    };
  }> {
    const managerId = await this.getManagerId(authHeader);
    const session = this.authService.verifySession(
      this.extractSessionId(authHeader),
    );
    const manager = await this.authService['managers'].get(managerId);
    const subPKPs = this.authService.getManagerSubPKPs(managerId);
    const pendingApprovals = this.authService.getPendingApprovals(managerId);

    // Calculate stats
    const activeSubPKPs = subPKPs.filter((s) => s.status === 'active').length;
    const totalTasksCompleted = subPKPs.reduce(
      (sum, s) => sum + s.totalTasksCompleted,
      0,
    );
    const averageSuccessRate =
      subPKPs.length > 0
        ? subPKPs.reduce(
            (sum, s) => sum + s.improvementMetrics.successRate,
            0,
          ) / subPKPs.length
        : 0;
    const totalSpent = subPKPs.reduce((sum, s) => sum + s.totalSpent, 0);

    return {
      success: true,
      manager: manager!,
      subPKPs,
      pendingApprovals,
      stats: {
        totalSubPKPs: subPKPs.length,
        activeSubPKPs,
        totalTasksCompleted,
        averageSuccessRate,
        totalSpent,
        pendingApprovals: pendingApprovals.length,
      },
    };
  }

  // Helper methods

  private extractSessionId(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    return authHeader.substring(7);
  }

  private async getManagerId(authHeader: string): Promise<string> {
    // Check if it's a session token or API key
    const token = this.extractSessionId(authHeader);

    if (token.startsWith('npem_')) {
      // API key
      const manager = this.authService.verifyAPIKey(token);
      return manager.id;
    } else {
      // Session token
      const session = this.authService.verifySession(token);
      return session.managerId;
    }
  }
}
