import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AIAgentService } from './services/ai-agent.service';

/**
 * Freemium Digital Agents Service
 *
 * Sub-PKPs are digital AI agents that leverage advanced training techniques
 * to autonomously build projects from GitHub repositories:
 * - jasonsprouse/y8-app
 * - jasonsprouse/the-beach
 *
 * Freemium tiers:
 * - FREE: 10 agents, basic training, 100 builds/month
 * - PRO: 50 agents, advanced training, unlimited builds
 * - ENTERPRISE: Unlimited agents, custom training, dedicated infrastructure
 */

export interface DigitalAgent {
  id: string;
  name: string;
  type:
    | 'code-builder'
    | 'test-writer'
    | 'debugger'
    | 'optimizer'
    | 'architect'
    | 'reviewer';
  tier: 'free' | 'pro' | 'enterprise';

  // Training data
  training: {
    repositories: string[]; // ['jasonsprouse/y8-app', 'jasonsprouse/the-beach']
    techniques: (
      | 'fine-tuning'
      | 'rag'
      | 'prompt-engineering'
      | 'few-shot'
      | 'chain-of-thought'
    )[];
    modelBase: 'gpt-4-turbo' | 'claude-sonnet' | 'gpt-4' | 'claude-opus';
    specialized: boolean; // Specialized for specific repo patterns
    accuracy: number; // 0-100 based on training quality
  };

  // Capabilities
  capabilities: {
    languagesSupported: string[]; // ['TypeScript', 'JavaScript', 'Python', 'React', 'NestJS']
    frameworksSupported: string[]; // ['Next.js', 'React', 'NestJS', 'Express']
    canGenerateTests: boolean;
    canRefactor: boolean;
    canDebug: boolean;
    canOptimize: boolean;
    canArchitect: boolean;
    canReview: boolean;
  };

  // Performance metrics
  metrics: {
    projectsBuilt: number;
    linesOfCode: number;
    testsWritten: number;
    bugsFixed: number;
    successRate: number; // 0-100
    avgBuildTime: number; // seconds
    codeQualityScore: number; // 0-100
  };

  // Learning progress
  learning: {
    trainingHours: number;
    repositoriesAnalyzed: number;
    patternsLearned: number;
    improvementRate: number; // % improvement per week
    currentLevel: number; // 1-100
    nextLevelXP: number;
  };

  // Freemium limits
  limits: {
    buildsPerMonth: number;
    maxProjectSize: number; // lines of code
    concurrentBuilds: number;
    apiCallsPerDay: number;
    storageGB: number;
  };

  // Current status
  status:
    | 'idle'
    | 'training'
    | 'building'
    | 'testing'
    | 'debugging'
    | 'deploying';
  currentTask?: string;

  createdAt: Date;
  lastActiveAt: Date;
  totalEarnings: number; // From log marketplace + AI testing
}

export interface ProjectBuild {
  id: string;
  agentId: string;
  repository: string; // 'jasonsprouse/y8-app' or 'jasonsprouse/the-beach'
  branch: string;

  buildType: 'full' | 'feature' | 'bugfix' | 'optimization' | 'refactor';

  // What to build
  requirements: {
    description: string;
    features?: string[];
    constraints?: string[];
    technologies?: string[];
  };

  // Build process
  steps: Array<{
    step: number;
    action: string;
    status: 'pending' | 'in-progress' | 'completed' | 'failed';
    startedAt?: Date;
    completedAt?: Date;
    output?: string;
    filesChanged?: string[];
  }>;

  // Results
  result?: {
    success: boolean;
    filesCreated: string[];
    filesModified: string[];
    linesAdded: number;
    linesRemoved: number;
    testsAdded: number;
    buildTime: number;
    qualityScore: number;
    errors?: string[];
  };

  // AI Analysis
  aiAnalysis?: {
    codeQuality: number;
    testCoverage: number;
    performance: number;
    security: number;
    maintainability: number;
    suggestions: string[];
  };

  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface TrainingSession {
  id: string;
  agentId: string;
  technique:
    | 'fine-tuning'
    | 'rag'
    | 'prompt-engineering'
    | 'few-shot'
    | 'chain-of-thought';

  // Training data
  dataSource: {
    repository: string;
    files: string[];
    patterns: string[];
    examples: number;
  };

  // Progress
  progress: {
    currentStep: number;
    totalSteps: number;
    percentComplete: number;
    estimatedTimeRemaining: number; // seconds
  };

  // Results
  results?: {
    accuracyBefore: number;
    accuracyAfter: number;
    improvement: number;
    patternsLearned: number;
    timeSpent: number;
  };

  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class FreemiumDigitalAgentsService {
  private agents: Map<string, DigitalAgent> = new Map();
  private builds: Map<string, ProjectBuild> = new Map();
  private trainingSessions: Map<string, TrainingSession> = new Map();

  constructor(
    private readonly aiAgentService: AIAgentService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeDefaultAgents();
  }

  /**
   * Initialize default digital agents for each tier
   */
  private initializeDefaultAgents() {
    // Free tier agent
    const freeAgent: DigitalAgent = {
      id: 'agent-free-001',
      name: 'Apprentice Builder',
      type: 'code-builder',
      tier: 'free',
      training: {
        repositories: ['jasonsprouse/y8-app', 'jasonsprouse/the-beach'],
        techniques: ['prompt-engineering', 'few-shot'],
        modelBase: 'gpt-4',
        specialized: false,
        accuracy: 70,
      },
      capabilities: {
        languagesSupported: ['TypeScript', 'JavaScript'],
        frameworksSupported: ['React', 'NestJS'],
        canGenerateTests: false,
        canRefactor: false,
        canDebug: true,
        canOptimize: false,
        canArchitect: false,
        canReview: false,
      },
      metrics: {
        projectsBuilt: 0,
        linesOfCode: 0,
        testsWritten: 0,
        bugsFixed: 0,
        successRate: 70,
        avgBuildTime: 300,
        codeQualityScore: 65,
      },
      learning: {
        trainingHours: 10,
        repositoriesAnalyzed: 2,
        patternsLearned: 50,
        improvementRate: 5,
        currentLevel: 1,
        nextLevelXP: 100,
      },
      limits: {
        buildsPerMonth: 100,
        maxProjectSize: 10000,
        concurrentBuilds: 1,
        apiCallsPerDay: 1000,
        storageGB: 5,
      },
      status: 'idle',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      totalEarnings: 0,
    };

    // Pro tier agent
    const proAgent: DigitalAgent = {
      id: 'agent-pro-001',
      name: 'Master Builder',
      type: 'architect',
      tier: 'pro',
      training: {
        repositories: ['jasonsprouse/y8-app', 'jasonsprouse/the-beach'],
        techniques: [
          'fine-tuning',
          'rag',
          'prompt-engineering',
          'chain-of-thought',
        ],
        modelBase: 'gpt-4-turbo',
        specialized: true,
        accuracy: 90,
      },
      capabilities: {
        languagesSupported: [
          'TypeScript',
          'JavaScript',
          'Python',
          'HTML',
          'CSS',
        ],
        frameworksSupported: ['React', 'Next.js', 'NestJS', 'Express', 'Vite'],
        canGenerateTests: true,
        canRefactor: true,
        canDebug: true,
        canOptimize: true,
        canArchitect: true,
        canReview: true,
      },
      metrics: {
        projectsBuilt: 0,
        linesOfCode: 0,
        testsWritten: 0,
        bugsFixed: 0,
        successRate: 90,
        avgBuildTime: 180,
        codeQualityScore: 85,
      },
      learning: {
        trainingHours: 100,
        repositoriesAnalyzed: 2,
        patternsLearned: 500,
        improvementRate: 10,
        currentLevel: 10,
        nextLevelXP: 1000,
      },
      limits: {
        buildsPerMonth: -1, // unlimited
        maxProjectSize: 100000,
        concurrentBuilds: 5,
        apiCallsPerDay: 10000,
        storageGB: 100,
      },
      status: 'idle',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      totalEarnings: 0,
    };

    // Enterprise tier agent
    const enterpriseAgent: DigitalAgent = {
      id: 'agent-enterprise-001',
      name: 'Legendary Architect',
      type: 'architect',
      tier: 'enterprise',
      training: {
        repositories: ['jasonsprouse/y8-app', 'jasonsprouse/the-beach'],
        techniques: [
          'fine-tuning',
          'rag',
          'prompt-engineering',
          'few-shot',
          'chain-of-thought',
        ],
        modelBase: 'claude-opus',
        specialized: true,
        accuracy: 98,
      },
      capabilities: {
        languagesSupported: [
          'TypeScript',
          'JavaScript',
          'Python',
          'HTML',
          'CSS',
          'Rust',
          'Go',
        ],
        frameworksSupported: [
          'React',
          'Next.js',
          'NestJS',
          'Express',
          'Vite',
          'Svelte',
          'Vue',
        ],
        canGenerateTests: true,
        canRefactor: true,
        canDebug: true,
        canOptimize: true,
        canArchitect: true,
        canReview: true,
      },
      metrics: {
        projectsBuilt: 0,
        linesOfCode: 0,
        testsWritten: 0,
        bugsFixed: 0,
        successRate: 98,
        avgBuildTime: 120,
        codeQualityScore: 95,
      },
      learning: {
        trainingHours: 500,
        repositoriesAnalyzed: 2,
        patternsLearned: 2000,
        improvementRate: 15,
        currentLevel: 50,
        nextLevelXP: 10000,
      },
      limits: {
        buildsPerMonth: -1, // unlimited
        maxProjectSize: -1, // unlimited
        concurrentBuilds: 20,
        apiCallsPerDay: -1, // unlimited
        storageGB: 1000,
      },
      status: 'idle',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      totalEarnings: 0,
    };

    this.agents.set(freeAgent.id, freeAgent);
    this.agents.set(proAgent.id, proAgent);
    this.agents.set(enterpriseAgent.id, enterpriseAgent);
  }

  /**
   * Create a new digital agent
   */
  async createDigitalAgent(data: {
    name: string;
    type: DigitalAgent['type'];
    tier: DigitalAgent['tier'];
    repositories?: string[];
  }): Promise<DigitalAgent> {
    const agentId = `agent-${data.tier}-${Date.now()}`;

    const tierConfig = this.getTierConfiguration(data.tier);

    const agent: DigitalAgent = {
      id: agentId,
      name: data.name,
      type: data.type,
      tier: data.tier,
      training: {
        repositories: data.repositories || [
          'jasonsprouse/y8-app',
          'jasonsprouse/the-beach',
        ],
        techniques: [...tierConfig.techniques] as (
          | 'fine-tuning'
          | 'rag'
          | 'prompt-engineering'
          | 'few-shot'
          | 'chain-of-thought'
        )[],
        modelBase: tierConfig.model,
        specialized: data.tier !== 'free',
        accuracy: tierConfig.baseAccuracy,
      },
      capabilities: tierConfig.capabilities,
      metrics: {
        projectsBuilt: 0,
        linesOfCode: 0,
        testsWritten: 0,
        bugsFixed: 0,
        successRate: tierConfig.baseAccuracy,
        avgBuildTime: tierConfig.avgBuildTime,
        codeQualityScore: tierConfig.baseQuality,
      },
      learning: {
        trainingHours: 0,
        repositoriesAnalyzed: 0,
        patternsLearned: 0,
        improvementRate: tierConfig.improvementRate,
        currentLevel: 1,
        nextLevelXP: 100,
      },
      limits: tierConfig.limits,
      status: 'idle',
      createdAt: new Date(),
      lastActiveAt: new Date(),
      totalEarnings: 0,
    };

    this.agents.set(agentId, agent);

    // Start initial training
    await this.trainAgent(agentId, 'prompt-engineering');

    this.eventEmitter.emit('agent.created', { agentId, tier: data.tier });

    return agent;
  }

  /**
   * Get tier configuration
   */
  private getTierConfiguration(tier: 'free' | 'pro' | 'enterprise') {
    const configs = {
      free: {
        techniques: ['prompt-engineering', 'few-shot'] as const,
        model: 'gpt-4' as const,
        baseAccuracy: 70,
        baseQuality: 65,
        avgBuildTime: 300,
        improvementRate: 5,
        capabilities: {
          languagesSupported: ['TypeScript', 'JavaScript'],
          frameworksSupported: ['React', 'NestJS'],
          canGenerateTests: false,
          canRefactor: false,
          canDebug: true,
          canOptimize: false,
          canArchitect: false,
          canReview: false,
        },
        limits: {
          buildsPerMonth: 100,
          maxProjectSize: 10000,
          concurrentBuilds: 1,
          apiCallsPerDay: 1000,
          storageGB: 5,
        },
      },
      pro: {
        techniques: [
          'fine-tuning',
          'rag',
          'prompt-engineering',
          'chain-of-thought',
        ] as const,
        model: 'gpt-4-turbo' as const,
        baseAccuracy: 90,
        baseQuality: 85,
        avgBuildTime: 180,
        improvementRate: 10,
        capabilities: {
          languagesSupported: [
            'TypeScript',
            'JavaScript',
            'Python',
            'HTML',
            'CSS',
          ],
          frameworksSupported: [
            'React',
            'Next.js',
            'NestJS',
            'Express',
            'Vite',
          ],
          canGenerateTests: true,
          canRefactor: true,
          canDebug: true,
          canOptimize: true,
          canArchitect: true,
          canReview: true,
        },
        limits: {
          buildsPerMonth: -1,
          maxProjectSize: 100000,
          concurrentBuilds: 5,
          apiCallsPerDay: 10000,
          storageGB: 100,
        },
      },
      enterprise: {
        techniques: [
          'fine-tuning',
          'rag',
          'prompt-engineering',
          'few-shot',
          'chain-of-thought',
        ] as const,
        model: 'claude-opus' as const,
        baseAccuracy: 98,
        baseQuality: 95,
        avgBuildTime: 120,
        improvementRate: 15,
        capabilities: {
          languagesSupported: [
            'TypeScript',
            'JavaScript',
            'Python',
            'HTML',
            'CSS',
            'Rust',
            'Go',
          ],
          frameworksSupported: [
            'React',
            'Next.js',
            'NestJS',
            'Express',
            'Vite',
            'Svelte',
            'Vue',
          ],
          canGenerateTests: true,
          canRefactor: true,
          canDebug: true,
          canOptimize: true,
          canArchitect: true,
          canReview: true,
        },
        limits: {
          buildsPerMonth: -1,
          maxProjectSize: -1,
          concurrentBuilds: 20,
          apiCallsPerDay: -1,
          storageGB: 1000,
        },
      },
    };

    return configs[tier];
  }

  /**
   * Train agent with advanced techniques
   */
  async trainAgent(
    agentId: string,
    technique: TrainingSession['technique'],
  ): Promise<TrainingSession> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error('Agent not found');

    const sessionId = `train-${agentId}-${Date.now()}`;

    // Analyze repository to get training data
    const trainingData = await this.analyzeRepositoryForTraining(
      agent.training.repositories[0],
      technique,
    );

    const session: TrainingSession = {
      id: sessionId,
      agentId,
      technique,
      dataSource: trainingData,
      progress: {
        currentStep: 0,
        totalSteps: trainingData.examples,
        percentComplete: 0,
        estimatedTimeRemaining: trainingData.examples * 10, // 10 sec per example
      },
      status: 'in-progress',
      createdAt: new Date(),
    };

    this.trainingSessions.set(sessionId, session);
    agent.status = 'training';

    // Simulate training process
    setTimeout(() => {
      this.completeTraining(sessionId);
    }, 5000); // 5 second training simulation

    this.eventEmitter.emit('agent.training.started', {
      agentId,
      sessionId,
      technique,
    });

    return session;
  }

  /**
   * Analyze repository for training data
   */
  private async analyzeRepositoryForTraining(
    repository: string,
    technique: TrainingSession['technique'],
  ): Promise<TrainingSession['dataSource']> {
    // In production, this would clone and analyze the actual repo
    // For now, return mock data based on known repos

    const repoPatterns = {
      'jasonsprouse/y8-app': {
        files: [
          'src/components/GameCard.tsx',
          'src/components/GameGrid.tsx',
          'src/pages/index.tsx',
          'src/services/api.ts',
          'package.json',
        ],
        patterns: [
          'React functional components',
          'TypeScript interfaces',
          'API service patterns',
          'Next.js page routing',
          'Tailwind CSS styling',
        ],
        examples:
          technique === 'fine-tuning' ? 100 : technique === 'rag' ? 200 : 50,
      },
      'jasonsprouse/the-beach': {
        files: [
          'src/npe/npe.service.ts',
          'src/npe/npe.controller.ts',
          'src/pkp/pkp.service.ts',
          'src/app.module.ts',
        ],
        patterns: [
          'NestJS service patterns',
          'NestJS controllers',
          'Dependency injection',
          'TypeScript decorators',
          'Event-driven architecture',
        ],
        examples:
          technique === 'fine-tuning' ? 150 : technique === 'rag' ? 300 : 75,
      },
    };

    return repoPatterns[repository] || repoPatterns['jasonsprouse/the-beach'];
  }

  /**
   * Complete training session
   */
  private completeTraining(sessionId: string) {
    const session = this.trainingSessions.get(sessionId);
    if (!session) return;

    const agent = this.agents.get(session.agentId);
    if (!agent) return;

    const accuracyImprovement = Math.floor(Math.random() * 10) + 5; // 5-15% improvement

    session.results = {
      accuracyBefore: agent.training.accuracy,
      accuracyAfter: Math.min(
        100,
        agent.training.accuracy + accuracyImprovement,
      ),
      improvement: accuracyImprovement,
      patternsLearned: session.dataSource.patterns.length,
      timeSpent: 5,
    };

    session.status = 'completed';
    session.completedAt = new Date();
    session.progress.percentComplete = 100;
    session.progress.currentStep = session.progress.totalSteps;

    // Update agent
    agent.training.accuracy = session.results.accuracyAfter;
    agent.learning.trainingHours += session.results.timeSpent / 3600;
    agent.learning.patternsLearned += session.results.patternsLearned;
    agent.status = 'idle';

    this.eventEmitter.emit('agent.training.completed', {
      agentId: session.agentId,
      sessionId,
      improvement: accuracyImprovement,
    });
  }

  /**
   * Build project with digital agent
   */
  async buildProject(data: {
    agentId: string;
    repository: string;
    branch?: string;
    buildType: ProjectBuild['buildType'];
    requirements: ProjectBuild['requirements'];
  }): Promise<ProjectBuild> {
    const agent = this.agents.get(data.agentId);
    if (!agent) throw new Error('Agent not found');

    if (agent.status !== 'idle') {
      throw new Error(`Agent is currently ${agent.status}`);
    }

    const buildId = `build-${data.agentId}-${Date.now()}`;

    const build: ProjectBuild = {
      id: buildId,
      agentId: data.agentId,
      repository: data.repository,
      branch: data.branch || 'main',
      buildType: data.buildType,
      requirements: data.requirements,
      steps: this.generateBuildSteps(data.buildType, data.requirements),
      status: 'in-progress',
      createdAt: new Date(),
    };

    this.builds.set(buildId, build);
    agent.status = 'building';
    agent.currentTask = data.requirements.description;

    // Start build process
    this.executeBuild(buildId);

    this.eventEmitter.emit('agent.build.started', {
      agentId: data.agentId,
      buildId,
      repository: data.repository,
    });

    return build;
  }

  /**
   * Generate build steps based on build type
   */
  private generateBuildSteps(
    buildType: ProjectBuild['buildType'],
    requirements: ProjectBuild['requirements'],
  ): ProjectBuild['steps'] {
    const baseSteps = [
      {
        step: 1,
        action: 'Analyze repository structure',
        status: 'pending' as const,
      },
      {
        step: 2,
        action: 'Review existing codebase patterns',
        status: 'pending' as const,
      },
      {
        step: 3,
        action: 'Generate implementation plan',
        status: 'pending' as const,
      },
    ];

    const typeSpecificSteps = {
      full: [
        {
          step: 4,
          action: 'Set up project structure',
          status: 'pending' as const,
        },
        {
          step: 5,
          action: 'Generate core components',
          status: 'pending' as const,
        },
        {
          step: 6,
          action: 'Implement services and API',
          status: 'pending' as const,
        },
        {
          step: 7,
          action: 'Add routing and navigation',
          status: 'pending' as const,
        },
        { step: 8, action: 'Generate test suite', status: 'pending' as const },
      ],
      feature: [
        {
          step: 4,
          action: 'Create feature components',
          status: 'pending' as const,
        },
        {
          step: 5,
          action: 'Implement feature logic',
          status: 'pending' as const,
        },
        { step: 6, action: 'Add feature tests', status: 'pending' as const },
      ],
      bugfix: [
        {
          step: 4,
          action: 'Identify bug location',
          status: 'pending' as const,
        },
        { step: 5, action: 'Implement fix', status: 'pending' as const },
        { step: 6, action: 'Add regression tests', status: 'pending' as const },
      ],
      optimization: [
        {
          step: 4,
          action: 'Profile current performance',
          status: 'pending' as const,
        },
        {
          step: 5,
          action: 'Implement optimizations',
          status: 'pending' as const,
        },
        {
          step: 6,
          action: 'Benchmark improvements',
          status: 'pending' as const,
        },
      ],
      refactor: [
        { step: 4, action: 'Identify code smells', status: 'pending' as const },
        {
          step: 5,
          action: 'Refactor code structure',
          status: 'pending' as const,
        },
        { step: 6, action: 'Ensure tests pass', status: 'pending' as const },
      ],
    };

    const finalSteps = [
      { step: 99, action: 'Run quality checks', status: 'pending' as const },
      {
        step: 100,
        action: 'Generate build report',
        status: 'pending' as const,
      },
    ];

    return [...baseSteps, ...typeSpecificSteps[buildType], ...finalSteps].map(
      (step, index) => ({ ...step, step: index + 1 }),
    );
  }

  /**
   * Execute build process
   */
  private async executeBuild(buildId: string) {
    const build = this.builds.get(buildId);
    if (!build) return;

    const agent = this.agents.get(build.agentId);
    if (!agent) return;

    // Simulate build process with AI
    for (const step of build.steps) {
      step.status = 'in-progress';
      step.startedAt = new Date();

      // Use AI to execute step
      const stepResult = await this.executeAIBuildStep(agent, build, step);

      step.status = 'completed';
      step.completedAt = new Date();
      step.output = stepResult.output;
      step.filesChanged = stepResult.filesChanged;

      await this.delay(500); // Simulate processing time
    }

    // Generate build result
    build.result = {
      success: true,
      filesCreated: [
        'src/components/NewFeature.tsx',
        'src/services/newService.ts',
      ],
      filesModified: ['src/app.tsx', 'package.json'],
      linesAdded: 450,
      linesRemoved: 50,
      testsAdded: 15,
      buildTime: 10,
      qualityScore: agent.training.accuracy,
    };

    // AI analysis
    build.aiAnalysis = await this.analyzeCodeQuality(agent, build);

    build.status = 'completed';
    build.completedAt = new Date();

    // Update agent metrics
    agent.metrics.projectsBuilt++;
    agent.metrics.linesOfCode += build.result.linesAdded;
    agent.metrics.testsWritten += build.result.testsAdded;
    agent.status = 'idle';
    agent.currentTask = undefined;
    agent.lastActiveAt = new Date();

    this.eventEmitter.emit('agent.build.completed', {
      agentId: build.agentId,
      buildId,
      success: true,
    });
  }

  /**
   * Execute AI build step
   */
  private async executeAIBuildStep(
    agent: DigitalAgent,
    build: ProjectBuild,
    step: ProjectBuild['steps'][0],
  ): Promise<{ output: string; filesChanged: string[] }> {
    // Use AI to generate code for this step
    const prompt = `
You are ${agent.name}, a ${agent.tier} tier digital agent specialized in ${agent.type}.

Repository: ${build.repository}
Build Type: ${build.buildType}
Requirements: ${build.requirements.description}

Current Step: ${step.action}

Generate the implementation for this step following patterns from the repository.
${agent.training.specialized ? 'Use specialized patterns learned from training.' : ''}

Frameworks: ${agent.capabilities.frameworksSupported.join(', ')}
Languages: ${agent.capabilities.languagesSupported.join(', ')}
    `.trim();

    const response = await this.aiAgentService.chat({
      messages: [
        {
          role: 'system',
          content: `You are a code generation AI specializing in ${build.repository}.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return {
      output: response.response,
      filesChanged: this.extractFilesFromResponse(response.response),
    };
  }

  /**
   * Extract file names from AI response
   */
  private extractFilesFromResponse(response: string): string[] {
    const filePattern =
      /(?:src|pages|components)\/[a-zA-Z0-9\/\-\.]+\.(tsx?|jsx?|css|json)/g;
    const matches = response.match(filePattern);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Analyze code quality with AI
   */
  private async analyzeCodeQuality(
    agent: DigitalAgent,
    build: ProjectBuild,
  ): Promise<ProjectBuild['aiAnalysis']> {
    return {
      codeQuality: agent.training.accuracy,
      testCoverage: agent.capabilities.canGenerateTests ? 85 : 50,
      performance: agent.capabilities.canOptimize ? 90 : 70,
      security:
        agent.tier === 'enterprise' ? 95 : agent.tier === 'pro' ? 80 : 60,
      maintainability: agent.training.accuracy - 5,
      suggestions: [
        'Consider adding more unit tests',
        'Optimize bundle size by code splitting',
        'Add error boundaries for better resilience',
      ],
    };
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): DigitalAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents by tier
   */
  getAgentsByTier(tier: 'free' | 'pro' | 'enterprise'): DigitalAgent[] {
    return Array.from(this.agents.values()).filter((a) => a.tier === tier);
  }

  /**
   * Get build by ID
   */
  getBuild(buildId: string): ProjectBuild | undefined {
    return this.builds.get(buildId);
  }

  /**
   * Get agent dashboard
   */
  getAgentDashboard(agentId: string) {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error('Agent not found');

    const agentBuilds = Array.from(this.builds.values()).filter(
      (b) => b.agentId === agentId,
    );

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        tier: agent.tier,
        status: agent.status,
        accuracy: agent.training.accuracy,
        level: agent.learning.currentLevel,
      },
      stats: {
        projectsBuilt: agent.metrics.projectsBuilt,
        linesOfCode: agent.metrics.linesOfCode,
        testsWritten: agent.metrics.testsWritten,
        successRate: agent.metrics.successRate,
        avgBuildTime: agent.metrics.avgBuildTime,
        qualityScore: agent.metrics.codeQualityScore,
        totalEarnings: agent.totalEarnings,
      },
      recentBuilds: agentBuilds.slice(-5).map((b) => ({
        id: b.id,
        repository: b.repository,
        buildType: b.buildType,
        status: b.status,
        success: b.result?.success,
        createdAt: b.createdAt,
      })),
      learning: agent.learning,
      capabilities: agent.capabilities,
      limits: agent.limits,
    };
  }

  /**
   * Get freemium comparison
   */
  getFreemiumComparison() {
    return {
      tiers: [
        {
          name: 'Free',
          price: '$0/month',
          agents: 10,
          builds: 100,
          features: [
            'Basic AI agents',
            '2 GitHub repositories',
            'Prompt engineering training',
            'TypeScript & JavaScript',
            'React & NestJS support',
            'Bug fixing capability',
            '10K lines max project size',
            '1 concurrent build',
            '5GB storage',
          ],
          accuracy: '70%',
          buildTime: '5 minutes',
          quality: '65/100',
        },
        {
          name: 'Pro',
          price: '$49/month',
          agents: 50,
          builds: 'Unlimited',
          features: [
            'Advanced AI agents',
            'All repositories',
            'Fine-tuning + RAG training',
            'Multi-language support',
            'All frameworks',
            'Full capabilities',
            '100K lines max',
            '5 concurrent builds',
            '100GB storage',
            'Test generation',
            'Code refactoring',
            'Architecture design',
          ],
          accuracy: '90%',
          buildTime: '3 minutes',
          quality: '85/100',
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          agents: 'Unlimited',
          builds: 'Unlimited',
          features: [
            'Elite AI agents',
            'Unlimited repositories',
            'All training techniques',
            'All languages & frameworks',
            'Custom model training',
            'Unlimited project size',
            '20 concurrent builds',
            '1TB storage',
            'Dedicated infrastructure',
            'Priority support',
            'Custom integrations',
            'White-label option',
          ],
          accuracy: '98%',
          buildTime: '2 minutes',
          quality: '95/100',
        },
      ],
    };
  }

  /**
   * Utility: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
