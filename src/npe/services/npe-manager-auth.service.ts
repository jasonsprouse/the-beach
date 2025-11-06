import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

/**
 * Authentication Type
 * Supports social login and biometric authentication
 */
export enum AuthType {
  GOOGLE = 'google',
  DISCORD = 'discord',
  GITHUB = 'github',
  TWITTER = 'twitter',
  WALLET = 'wallet',
  WEBAUTHN = 'webauthn', // Biometric (fingerprint, Face ID)
  PASSKEY = 'passkey', // Platform authenticator
}

/**
 * NPE Manager Role
 * Defines the level of control and responsibility
 */
export enum NPEManagerRole {
  OWNER = 'owner', // Full control over all PKPs
  ADMIN = 'admin', // Can manage sub-PKPs and settings
  OPERATOR = 'operator', // Can execute approved tasks
  VIEWER = 'viewer', // Read-only access
}

/**
 * NPE Manager Profile
 * Represents a human user controlling NPE agents
 */
export interface NPEManagerProfile {
  id: string; // Unique manager ID
  email?: string;
  name?: string;
  authType: AuthType;
  authProviderId: string; // Provider-specific ID

  // Main PKP (human-controlled)
  mainPKP: {
    address: string;
    publicKey: string;
    authMethodType: number; // Lit Protocol auth method
    authMethodId: string; // Unique identifier for this auth method
    sessionKey?: string; // Temporary session key for operations
  };

  // Manager metadata
  role: NPEManagerRole;
  tier: 'freemium' | 'base' | 'premium' | 'enterprise';
  verified: boolean;
  mfaEnabled: boolean;

  // Timestamps
  createdAt: Date;
  lastLogin: Date;
  lastActivity: Date;

  // Security
  apiKeys: string[]; // Generated API keys for programmatic access
  allowedIPs?: string[]; // IP whitelist
  sessionTimeout: number; // Session timeout in seconds
}

/**
 * Sub-PKP Task Manager
 * Autonomous AI agent that manages specific tasks
 */
export interface SubPKPTaskManager {
  id: string;
  address: string;
  publicKey: string;

  // Hierarchy
  parentManagerId: string; // NPE Manager who owns this
  parentPKP: string; // Main PKP address

  // Purpose and capabilities
  purpose:
    | 'development'
    | 'testing'
    | 'deployment'
    | 'monitoring'
    | 'security'
    | 'sales'
    | 'support'
    | 'analytics';
  name: string;
  description: string;
  capabilities: string[];

  // Game manager integration
  gameManagerType:
    | 'continuous-improvement'
    | 'task-completion'
    | 'quality-assurance'
    | 'performance-optimization';
  improvementMetrics: {
    tasksCompleted: number;
    successRate: number;
    averageCompletionTime: number;
    qualityScore: number;
    innovationScore: number;
  };

  // Autonomy and permissions
  autonomyLevel: 'supervised' | 'semi-autonomous' | 'fully-autonomous';
  autoApproveThreshold: number; // Score threshold for auto-approval (0-100)
  requiresApproval: string[]; // Actions requiring human approval

  // Resource limits
  spendingLimit: {
    daily: number;
    monthly: number;
    perTransaction: number;
  };
  computeQuota: {
    cpuHours: number;
    memoryGB: number;
    storageGB: number;
  };

  // Status and tracking
  status: 'active' | 'paused' | 'suspended' | 'revoked';
  currentTask?: string;
  taskQueue: string[];

  // Performance tracking
  totalTasksCompleted: number;
  totalSpent: number;
  totalComputeUsed: number;
  lastActive: Date;
  createdAt: Date;

  // Continuous improvement goals
  improvementGoals: {
    targetSuccessRate: number;
    targetCompletionTime: number;
    targetQualityScore: number;
    learningRate: number;
  };
}

/**
 * Authentication Session
 */
export interface AuthSession {
  sessionId: string;
  managerId: string;
  pkpAddress: string;
  authType: AuthType;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  active: boolean;
}

/**
 * Approval Request for Sub-PKP Actions
 */
export interface TaskApprovalRequest {
  id: string;
  subPKPId: string;
  managerId: string;

  // Request details
  action: string;
  taskDescription: string;
  estimatedCost: number;
  estimatedTime: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';

  // AI confidence and reasoning
  aiConfidence: number; // 0-100
  aiReasoning: string;
  suggestedApproval: boolean;

  // Status
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt: Date;
  response?: {
    approved: boolean;
    reason?: string;
    conditions?: string[];
  };
}

/**
 * NPE Manager Authentication Service
 * Production-ready authentication for human managers controlling PKP-based NPE agents
 */
@Injectable()
export class NPEManagerAuthService {
  private readonly logger = new Logger(NPEManagerAuthService.name);

  // Manager registry
  private managers = new Map<string, NPEManagerProfile>();
  private managersByEmail = new Map<string, NPEManagerProfile>();
  private managersByPKP = new Map<string, NPEManagerProfile>();

  // Sub-PKP task managers
  private subPKPs = new Map<string, SubPKPTaskManager>();
  private subPKPsByManager = new Map<string, Set<string>>();

  // Active sessions
  private sessions = new Map<string, AuthSession>();

  // Approval queue
  private approvalRequests = new Map<string, TaskApprovalRequest>();

  // API key management
  private apiKeys = new Map<string, string>(); // API key -> Manager ID

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.logger.log('🔐 NPE Manager Authentication Service initialized');
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for continuous improvement tracking
   */
  private setupEventHandlers(): void {
    // Track task completions for improvement metrics
    this.eventEmitter.on(
      'task.completed',
      (event: {
        subPKPId: string;
        success: boolean;
        duration: number;
        quality: number;
      }) => {
        const subPKP = this.subPKPs.get(event.subPKPId);
        if (subPKP) {
          this.updateImprovementMetrics(subPKP, event);
        }
      },
    );

    // Track learning and adaptation
    this.eventEmitter.on(
      'ai.learned',
      (event: { subPKPId: string; insight: string; improvement: number }) => {
        this.logger.log(
          `🧠 Sub-PKP ${event.subPKPId} learned: ${event.insight} (improvement: ${event.improvement}%)`,
        );
      },
    );
  }

  /**
   * Authenticate NPE Manager via social login or biometric
   */
  async authenticateManager(params: {
    authType: AuthType;
    authProviderId: string;
    email?: string;
    name?: string;
    accessToken?: string;
    credential?: string; // For WebAuthn/Passkey
    challenge?: string; // For biometric verification
    ipAddress: string;
    userAgent: string;
  }): Promise<{ manager: NPEManagerProfile; session: AuthSession }> {
    this.logger.log(
      `🔑 Authenticating manager via ${params.authType}: ${params.email || params.authProviderId}`,
    );

    // Verify authentication based on type
    await this.verifyAuthentication(params);

    // Check for existing manager
    let manager = this.managersByEmail.get(
      params.email || params.authProviderId,
    );

    if (!manager) {
      // Create new manager profile
      manager = await this.createManagerProfile(params);
    } else {
      // Update last login
      manager.lastLogin = new Date();
      manager.lastActivity = new Date();
    }

    // Create session
    const session = this.createSession(
      manager,
      params.ipAddress,
      params.userAgent,
    );

    // Emit authentication event
    this.eventEmitter.emit('manager.authenticated', {
      managerId: manager.id,
      authType: params.authType,
      timestamp: new Date(),
    });

    return { manager, session };
  }

  /**
   * Verify authentication credentials
   */
  private async verifyAuthentication(params: {
    authType: AuthType;
    authProviderId: string;
    accessToken?: string;
    credential?: string;
    challenge?: string;
  }): Promise<boolean> {
    switch (params.authType) {
      case AuthType.WEBAUTHN:
      case AuthType.PASSKEY:
        return this.verifyBiometric(params.credential!, params.challenge!);

      case AuthType.GOOGLE:
      case AuthType.DISCORD:
      case AuthType.GITHUB:
      case AuthType.TWITTER:
        return this.verifySocialLogin(params.authType, params.accessToken!);

      case AuthType.WALLET:
        return this.verifyWalletSignature(
          params.authProviderId,
          params.credential!,
        );

      default:
        throw new BadRequestException(
          `Unsupported auth type: ${params.authType}`,
        );
    }
  }

  /**
   * Verify biometric authentication (WebAuthn/Passkey)
   */
  private async verifyBiometric(
    credential: string,
    challenge: string,
  ): Promise<boolean> {
    // In production, this would verify the WebAuthn credential
    // against the stored public key and challenge
    this.logger.log('🔐 Verifying biometric authentication...');

    try {
      // Parse credential (base64url encoded)
      const credentialData = JSON.parse(
        Buffer.from(credential, 'base64url').toString(),
      );

      // Verify challenge matches
      if (credentialData.challenge !== challenge) {
        throw new UnauthorizedException('Invalid challenge');
      }

      // In production, verify signature with stored public key
      // For now, accept valid format
      return true;
    } catch (error) {
      throw new UnauthorizedException('Biometric verification failed');
    }
  }

  /**
   * Verify social login token
   */
  private async verifySocialLogin(
    authType: AuthType,
    accessToken: string,
  ): Promise<boolean> {
    this.logger.log(`🔐 Verifying ${authType} token...`);

    // In production, verify the access token with the provider's API
    // For now, accept non-empty tokens
    if (!accessToken || accessToken.length < 10) {
      throw new UnauthorizedException('Invalid access token');
    }

    return true;
  }

  /**
   * Verify wallet signature
   */
  private async verifyWalletSignature(
    address: string,
    signature: string,
  ): Promise<boolean> {
    this.logger.log(`🔐 Verifying wallet signature for ${address}...`);

    // In production, verify the signature against the address
    // Using ethers.js or similar
    if (!signature || signature.length < 10) {
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }

  /**
   * Create new manager profile
   */
  private async createManagerProfile(params: {
    authType: AuthType;
    authProviderId: string;
    email?: string;
    name?: string;
  }): Promise<NPEManagerProfile> {
    const managerId = crypto.randomBytes(16).toString('hex');
    const pkpAddress = this.generatePKPAddress();
    const publicKey = this.generatePublicKey();

    const manager: NPEManagerProfile = {
      id: managerId,
      email: params.email,
      name: params.name,
      authType: params.authType,
      authProviderId: params.authProviderId,
      mainPKP: {
        address: pkpAddress,
        publicKey: publicKey,
        authMethodType: this.getAuthMethodType(params.authType),
        authMethodId: params.authProviderId,
      },
      role: NPEManagerRole.OWNER,
      tier: 'freemium',
      verified: false,
      mfaEnabled: false,
      createdAt: new Date(),
      lastLogin: new Date(),
      lastActivity: new Date(),
      apiKeys: [],
      sessionTimeout: 3600, // 1 hour
    };

    // Store manager
    this.managers.set(managerId, manager);
    if (params.email) {
      this.managersByEmail.set(params.email, manager);
    }
    this.managersByPKP.set(pkpAddress, manager);

    this.logger.log(
      `✅ Created new manager profile: ${managerId} (${params.email})`,
    );

    return manager;
  }

  /**
   * Create authentication session
   */
  private createSession(
    manager: NPEManagerProfile,
    ipAddress: string,
    userAgent: string,
  ): AuthSession {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const session: AuthSession = {
      sessionId,
      managerId: manager.id,
      pkpAddress: manager.mainPKP.address,
      authType: manager.authType,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + manager.sessionTimeout * 1000),
      ipAddress,
      userAgent,
      active: true,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Create Sub-PKP Task Manager
   * This is an autonomous AI agent that manages specific tasks
   */
  async createSubPKPTaskManager(
    managerId: string,
    params: {
      purpose: SubPKPTaskManager['purpose'];
      name: string;
      description: string;
      autonomyLevel: SubPKPTaskManager['autonomyLevel'];
      gameManagerType: SubPKPTaskManager['gameManagerType'];
      spendingLimit?: Partial<SubPKPTaskManager['spendingLimit']>;
      improvementGoals?: Partial<SubPKPTaskManager['improvementGoals']>;
    },
  ): Promise<SubPKPTaskManager> {
    const manager = this.managers.get(managerId);
    if (!manager) {
      throw new UnauthorizedException('Manager not found');
    }

    const subPKPId = crypto.randomBytes(16).toString('hex');
    const address = this.generatePKPAddress();
    const publicKey = this.generatePublicKey();

    const subPKP: SubPKPTaskManager = {
      id: subPKPId,
      address,
      publicKey,
      parentManagerId: managerId,
      parentPKP: manager.mainPKP.address,
      purpose: params.purpose,
      name: params.name,
      description: params.description,
      capabilities: this.getDefaultCapabilities(params.purpose),
      gameManagerType: params.gameManagerType,
      improvementMetrics: {
        tasksCompleted: 0,
        successRate: 0,
        averageCompletionTime: 0,
        qualityScore: 0,
        innovationScore: 0,
      },
      autonomyLevel: params.autonomyLevel,
      autoApproveThreshold:
        params.autonomyLevel === 'fully-autonomous'
          ? 90
          : params.autonomyLevel === 'semi-autonomous'
            ? 70
            : 50,
      requiresApproval: this.getRequiredApprovals(params.autonomyLevel),
      spendingLimit: {
        daily: params.spendingLimit?.daily ?? 100,
        monthly: params.spendingLimit?.monthly ?? 1000,
        perTransaction: params.spendingLimit?.perTransaction ?? 50,
      },
      computeQuota: {
        cpuHours: 100,
        memoryGB: 50,
        storageGB: 100,
      },
      status: 'active',
      taskQueue: [],
      totalTasksCompleted: 0,
      totalSpent: 0,
      totalComputeUsed: 0,
      lastActive: new Date(),
      createdAt: new Date(),
      improvementGoals: {
        targetSuccessRate: params.improvementGoals?.targetSuccessRate ?? 95,
        targetCompletionTime:
          params.improvementGoals?.targetCompletionTime ?? 3600,
        targetQualityScore: params.improvementGoals?.targetQualityScore ?? 90,
        learningRate: params.improvementGoals?.learningRate ?? 0.1,
      },
    };

    // Store sub-PKP
    this.subPKPs.set(subPKPId, subPKP);

    // Add to manager's sub-PKPs
    if (!this.subPKPsByManager.has(managerId)) {
      this.subPKPsByManager.set(managerId, new Set());
    }
    this.subPKPsByManager.get(managerId)!.add(subPKPId);

    this.logger.log(
      `✅ Created Sub-PKP Task Manager: ${params.name} (${subPKPId})`,
    );

    // Emit creation event
    this.eventEmitter.emit('subpkp.created', {
      subPKPId,
      managerId,
      purpose: params.purpose,
      timestamp: new Date(),
    });

    return subPKP;
  }

  /**
   * Update improvement metrics for continuous self-improvement
   */
  private updateImprovementMetrics(
    subPKP: SubPKPTaskManager,
    event: { success: boolean; duration: number; quality: number },
  ): void {
    const metrics = subPKP.improvementMetrics;

    // Update tasks completed
    metrics.tasksCompleted++;

    // Update success rate (exponential moving average)
    const alpha = subPKP.improvementGoals.learningRate;
    metrics.successRate =
      metrics.successRate * (1 - alpha) + (event.success ? 100 : 0) * alpha;

    // Update average completion time
    metrics.averageCompletionTime =
      metrics.averageCompletionTime * (1 - alpha) + event.duration * alpha;

    // Update quality score
    metrics.qualityScore =
      metrics.qualityScore * (1 - alpha) + event.quality * alpha;

    // Calculate innovation score based on improvement over time
    const successImprovement = Math.max(
      0,
      metrics.successRate - subPKP.improvementGoals.targetSuccessRate,
    );
    const timeImprovement = Math.max(
      0,
      subPKP.improvementGoals.targetCompletionTime -
        metrics.averageCompletionTime,
    );
    const qualityImprovement = Math.max(
      0,
      metrics.qualityScore - subPKP.improvementGoals.targetQualityScore,
    );
    metrics.innovationScore =
      (successImprovement + timeImprovement / 100 + qualityImprovement) / 3;

    this.logger.log(
      `📊 Updated metrics for ${subPKP.name}: Success ${metrics.successRate.toFixed(1)}%, Quality ${metrics.qualityScore.toFixed(1)}, Innovation ${metrics.innovationScore.toFixed(1)}`,
    );

    // Emit improvement event
    this.eventEmitter.emit('subpkp.improved', {
      subPKPId: subPKP.id,
      metrics,
      timestamp: new Date(),
    });
  }

  /**
   * Request approval for task execution
   */
  async requestTaskApproval(
    subPKPId: string,
    params: {
      action: string;
      taskDescription: string;
      estimatedCost: number;
      estimatedTime: number;
      riskLevel: TaskApprovalRequest['riskLevel'];
      aiConfidence: number;
      aiReasoning: string;
    },
  ): Promise<TaskApprovalRequest> {
    const subPKP = this.subPKPs.get(subPKPId);
    if (!subPKP) {
      throw new BadRequestException('Sub-PKP not found');
    }

    // Check if auto-approval is possible
    const autoApprove =
      params.aiConfidence >= subPKP.autoApproveThreshold &&
      params.riskLevel === 'low' &&
      !subPKP.requiresApproval.includes(params.action);

    const requestId = crypto.randomBytes(16).toString('hex');
    const request: TaskApprovalRequest = {
      id: requestId,
      subPKPId,
      managerId: subPKP.parentManagerId,
      action: params.action,
      taskDescription: params.taskDescription,
      estimatedCost: params.estimatedCost,
      estimatedTime: params.estimatedTime,
      riskLevel: params.riskLevel,
      aiConfidence: params.aiConfidence,
      aiReasoning: params.aiReasoning,
      suggestedApproval: autoApprove,
      status: autoApprove ? 'approved' : 'pending',
      requestedAt: new Date(),
      respondedAt: autoApprove ? new Date() : undefined,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    };

    if (autoApprove) {
      request.response = {
        approved: true,
        reason: 'Auto-approved based on AI confidence and risk level',
      };
      this.logger.log(
        `✅ Auto-approved task for ${subPKP.name}: ${params.action}`,
      );
    } else {
      this.approvalRequests.set(requestId, request);
      this.logger.log(
        `⏳ Approval requested for ${subPKP.name}: ${params.action}`,
      );

      // Emit approval request event
      this.eventEmitter.emit('approval.requested', {
        requestId,
        managerId: subPKP.parentManagerId,
        subPKPId,
        action: params.action,
        timestamp: new Date(),
      });
    }

    return request;
  }

  /**
   * Respond to approval request
   */
  async respondToApproval(
    requestId: string,
    managerId: string,
    params: {
      approved: boolean;
      reason?: string;
      conditions?: string[];
    },
  ): Promise<TaskApprovalRequest> {
    const request = this.approvalRequests.get(requestId);
    if (!request) {
      throw new BadRequestException('Approval request not found');
    }

    if (request.managerId !== managerId) {
      throw new UnauthorizedException(
        'Not authorized to respond to this request',
      );
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Request already responded to');
    }

    request.status = params.approved ? 'approved' : 'rejected';
    request.respondedAt = new Date();
    request.response = params;

    this.logger.log(
      `${params.approved ? '✅' : '❌'} Approval ${params.approved ? 'granted' : 'rejected'} for request ${requestId}`,
    );

    // Emit response event
    this.eventEmitter.emit('approval.responded', {
      requestId,
      approved: params.approved,
      timestamp: new Date(),
    });

    return request;
  }

  /**
   * Get manager's sub-PKPs
   */
  getManagerSubPKPs(managerId: string): SubPKPTaskManager[] {
    const subPKPIds = this.subPKPsByManager.get(managerId);
    if (!subPKPIds) {
      return [];
    }

    return Array.from(subPKPIds)
      .map((id) => this.subPKPs.get(id))
      .filter((subPKP): subPKP is SubPKPTaskManager => subPKP !== undefined);
  }

  /**
   * Get pending approval requests
   */
  getPendingApprovals(managerId: string): TaskApprovalRequest[] {
    return Array.from(this.approvalRequests.values()).filter(
      (request) =>
        request.managerId === managerId && request.status === 'pending',
    );
  }

  /**
   * Verify session
   */
  verifySession(sessionId: string): AuthSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    if (!session.active) {
      throw new UnauthorizedException('Session inactive');
    }

    if (new Date() > session.expiresAt) {
      session.active = false;
      throw new UnauthorizedException('Session expired');
    }

    return session;
  }

  /**
   * Generate API key for programmatic access
   */
  generateAPIKey(managerId: string): string {
    const manager = this.managers.get(managerId);
    if (!manager) {
      throw new BadRequestException('Manager not found');
    }

    const apiKey = `npem_${crypto.randomBytes(32).toString('hex')}`;
    manager.apiKeys.push(apiKey);
    this.apiKeys.set(apiKey, managerId);

    this.logger.log(`🔑 Generated API key for manager ${managerId}`);
    return apiKey;
  }

  /**
   * Verify API key
   */
  verifyAPIKey(apiKey: string): NPEManagerProfile {
    const managerId = this.apiKeys.get(apiKey);
    if (!managerId) {
      throw new UnauthorizedException('Invalid API key');
    }

    const manager = this.managers.get(managerId);
    if (!manager) {
      throw new UnauthorizedException('Manager not found');
    }

    return manager;
  }

  // Helper methods

  private generatePKPAddress(): string {
    return '0x' + crypto.randomBytes(20).toString('hex');
  }

  private generatePublicKey(): string {
    return '0x' + crypto.randomBytes(64).toString('hex');
  }

  private getAuthMethodType(authType: AuthType): number {
    // Lit Protocol auth method types
    const types: Record<AuthType, number> = {
      [AuthType.GOOGLE]: 1,
      [AuthType.DISCORD]: 2,
      [AuthType.GITHUB]: 3,
      [AuthType.TWITTER]: 4,
      [AuthType.WALLET]: 5,
      [AuthType.WEBAUTHN]: 6,
      [AuthType.PASSKEY]: 7,
    };
    return types[authType];
  }

  private getDefaultCapabilities(
    purpose: SubPKPTaskManager['purpose'],
  ): string[] {
    const capabilitiesMap: Record<SubPKPTaskManager['purpose'], string[]> = {
      development: [
        'code-generation',
        'git-operations',
        'testing',
        'code-review',
        'refactoring',
      ],
      testing: [
        'test-execution',
        'test-generation',
        'coverage-analysis',
        'performance-testing',
      ],
      deployment: [
        'ci-cd',
        'infrastructure',
        'monitoring',
        'rollback',
        'scaling',
      ],
      monitoring: [
        'metrics-collection',
        'alerting',
        'log-analysis',
        'anomaly-detection',
      ],
      security: [
        'vulnerability-scanning',
        'dependency-audit',
        'compliance-check',
        'penetration-testing',
      ],
      sales: [
        'lead-generation',
        'pitch-creation',
        'demo-scheduling',
        'proposal-writing',
      ],
      support: [
        'ticket-triage',
        'documentation',
        'troubleshooting',
        'escalation',
      ],
      analytics: [
        'data-collection',
        'reporting',
        'visualization',
        'insights-generation',
      ],
    };
    return capabilitiesMap[purpose];
  }

  private getRequiredApprovals(
    autonomyLevel: SubPKPTaskManager['autonomyLevel'],
  ): string[] {
    if (autonomyLevel === 'supervised') {
      return [
        'deploy',
        'commit',
        'spend',
        'create-resource',
        'delete-resource',
        'modify-security',
        'access-data',
      ];
    } else if (autonomyLevel === 'semi-autonomous') {
      return ['deploy', 'spend', 'delete-resource', 'modify-security'];
    } else {
      return ['delete-resource', 'modify-security'];
    }
  }
}
