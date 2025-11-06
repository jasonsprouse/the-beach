import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import {
  FreemiumDigitalAgentsService,
  DigitalAgent,
  ProjectBuild,
  TrainingSession,
} from './freemium-digital-agents.service';

/**
 * Freemium Digital Agents Controller
 *
 * API endpoints for managing AI digital agents that autonomously
 * build projects from jasonsprouse/y8-app and jasonsprouse/the-beach
 */
@Controller('npe/digital-agents')
export class FreemiumDigitalAgentsController {
  constructor(private readonly agentsService: FreemiumDigitalAgentsService) {}

  /**
   * Create a new digital agent
   * POST /npe/digital-agents/create
   */
  @Post('create')
  async createAgent(
    @Body()
    body: {
      name: string;
      type: DigitalAgent['type'];
      tier: DigitalAgent['tier'];
      repositories?: string[];
    },
  ): Promise<DigitalAgent> {
    return await this.agentsService.createDigitalAgent(body);
  }

  /**
   * Get agent details
   * GET /npe/digital-agents/:agentId
   */
  @Get(':agentId')
  getAgent(@Param('agentId') agentId: string): DigitalAgent {
    const agent = this.agentsService.getAgent(agentId);
    if (!agent) throw new Error('Agent not found');
    return agent;
  }

  /**
   * Get agents by tier
   * GET /npe/digital-agents/tier/:tier
   */
  @Get('tier/:tier')
  getAgentsByTier(
    @Param('tier') tier: 'free' | 'pro' | 'enterprise',
  ): DigitalAgent[] {
    return this.agentsService.getAgentsByTier(tier);
  }

  /**
   * Train agent with advanced techniques
   * POST /npe/digital-agents/:agentId/train
   */
  @Post(':agentId/train')
  async trainAgent(
    @Param('agentId') agentId: string,
    @Body()
    body: {
      technique: TrainingSession['technique'];
    },
  ): Promise<TrainingSession> {
    return await this.agentsService.trainAgent(agentId, body.technique);
  }

  /**
   * Build project with agent
   * POST /npe/digital-agents/:agentId/build
   */
  @Post(':agentId/build')
  async buildProject(
    @Param('agentId') agentId: string,
    @Body()
    body: {
      repository: string;
      branch?: string;
      buildType: ProjectBuild['buildType'];
      requirements: ProjectBuild['requirements'];
    },
  ): Promise<ProjectBuild> {
    return await this.agentsService.buildProject({
      agentId,
      ...body,
    });
  }

  /**
   * Get build details
   * GET /npe/digital-agents/build/:buildId
   */
  @Get('build/:buildId')
  getBuild(@Param('buildId') buildId: string): ProjectBuild {
    const build = this.agentsService.getBuild(buildId);
    if (!build) throw new Error('Build not found');
    return build;
  }

  /**
   * Get agent dashboard
   * GET /npe/digital-agents/:agentId/dashboard
   */
  @Get(':agentId/dashboard')
  getDashboard(@Param('agentId') agentId: string) {
    return this.agentsService.getAgentDashboard(agentId);
  }

  /**
   * Get freemium tier comparison
   * GET /npe/digital-agents/comparison
   */
  @Get('freemium/comparison')
  getComparison() {
    return this.agentsService.getFreemiumComparison();
  }

  /**
   * Demo: Build Y8 App feature
   * POST /npe/digital-agents/demo/y8-feature
   */
  @Post('demo/y8-feature')
  async buildY8Feature(
    @Body() body: { agentId: string; featureName: string; description: string },
  ) {
    return await this.agentsService.buildProject({
      agentId: body.agentId,
      repository: 'jasonsprouse/y8-app',
      branch: 'main',
      buildType: 'feature',
      requirements: {
        description: body.description,
        features: [body.featureName],
        technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
      },
    });
  }

  /**
   * Demo: Build The Beach NPE feature
   * POST /npe/digital-agents/demo/beach-feature
   */
  @Post('demo/beach-feature')
  async buildBeachFeature(
    @Body() body: { agentId: string; featureName: string; description: string },
  ) {
    return await this.agentsService.buildProject({
      agentId: body.agentId,
      repository: 'jasonsprouse/the-beach',
      branch: 'master',
      buildType: 'feature',
      requirements: {
        description: body.description,
        features: [body.featureName],
        technologies: ['NestJS', 'TypeScript', 'Event-Driven Architecture'],
      },
    });
  }

  /**
   * Simulate full project build
   * POST /npe/digital-agents/simulate/full-build
   */
  @Post('simulate/full-build')
  async simulateFullBuild(
    @Body()
    body: {
      tier: 'free' | 'pro' | 'enterprise';
      repository: 'jasonsprouse/y8-app' | 'jasonsprouse/the-beach';
      projectDescription: string;
    },
  ) {
    // Create agent for simulation
    const agent = await this.agentsService.createDigitalAgent({
      name: `${body.tier.toUpperCase()} Builder Demo`,
      type: 'architect',
      tier: body.tier,
      repositories: [body.repository],
    });

    // Train agent
    const training = await this.agentsService.trainAgent(
      agent.id,
      body.tier === 'free'
        ? 'prompt-engineering'
        : body.tier === 'pro'
          ? 'rag'
          : 'fine-tuning',
    );

    // Wait for training to complete
    await this.delay(6000);

    // Build project
    const build = await this.agentsService.buildProject({
      agentId: agent.id,
      repository: body.repository,
      buildType: 'full',
      requirements: {
        description: body.projectDescription,
        technologies: body.repository.includes('y8-app')
          ? ['React', 'Next.js', 'TypeScript', 'Tailwind']
          : ['NestJS', 'TypeScript', 'Redis', 'Socket.IO'],
      },
    });

    // Wait for build to complete
    await this.delay(15000);

    // Get updated build and dashboard
    const completedBuild = this.agentsService.getBuild(build.id);
    const dashboard = this.agentsService.getAgentDashboard(agent.id);

    return {
      simulation: {
        tier: body.tier,
        repository: body.repository,
        totalTime: '21 seconds',
      },
      agent: {
        id: agent.id,
        name: agent.name,
        accuracy: agent.training.accuracy,
        tier: agent.tier,
      },
      training: {
        technique: training.technique,
        patternsLearned: training.dataSource.patterns.length,
        improvement: '5-15% accuracy',
      },
      build: {
        id: completedBuild?.id,
        status: completedBuild?.status,
        steps: completedBuild?.steps.length,
        result: completedBuild?.result,
        aiAnalysis: completedBuild?.aiAnalysis,
      },
      dashboard,
    };
  }

  /**
   * Compare agent performance across tiers
   * GET /npe/digital-agents/comparison/performance
   */
  @Get('comparison/performance')
  async comparePerformance() {
    const freeAgents = this.agentsService.getAgentsByTier('free');
    const proAgents = this.agentsService.getAgentsByTier('pro');
    const enterpriseAgents = this.agentsService.getAgentsByTier('enterprise');

    const calculateAverage = (
      agents: DigitalAgent[],
      metric: keyof DigitalAgent['metrics'],
    ) => {
      if (agents.length === 0) return 0;
      return (
        agents.reduce((sum, a) => sum + a.metrics[metric], 0) / agents.length
      );
    };

    return {
      tierComparison: [
        {
          tier: 'Free',
          agentCount: freeAgents.length,
          avgAccuracy: calculateAverage(freeAgents, 'successRate'),
          avgBuildTime: calculateAverage(freeAgents, 'avgBuildTime'),
          avgQuality: calculateAverage(freeAgents, 'codeQualityScore'),
          totalProjects: freeAgents.reduce(
            (sum, a) => sum + a.metrics.projectsBuilt,
            0,
          ),
          totalLinesOfCode: freeAgents.reduce(
            (sum, a) => sum + a.metrics.linesOfCode,
            0,
          ),
        },
        {
          tier: 'Pro',
          agentCount: proAgents.length,
          avgAccuracy: calculateAverage(proAgents, 'successRate'),
          avgBuildTime: calculateAverage(proAgents, 'avgBuildTime'),
          avgQuality: calculateAverage(proAgents, 'codeQualityScore'),
          totalProjects: proAgents.reduce(
            (sum, a) => sum + a.metrics.projectsBuilt,
            0,
          ),
          totalLinesOfCode: proAgents.reduce(
            (sum, a) => sum + a.metrics.linesOfCode,
            0,
          ),
        },
        {
          tier: 'Enterprise',
          agentCount: enterpriseAgents.length,
          avgAccuracy: calculateAverage(enterpriseAgents, 'successRate'),
          avgBuildTime: calculateAverage(enterpriseAgents, 'avgBuildTime'),
          avgQuality: calculateAverage(enterpriseAgents, 'codeQualityScore'),
          totalProjects: enterpriseAgents.reduce(
            (sum, a) => sum + a.metrics.projectsBuilt,
            0,
          ),
          totalLinesOfCode: enterpriseAgents.reduce(
            (sum, a) => sum + a.metrics.linesOfCode,
            0,
          ),
        },
      ],
      recommendation: this.generateTierRecommendation(
        freeAgents,
        proAgents,
        enterpriseAgents,
      ),
    };
  }

  /**
   * Generate tier recommendation
   */
  private generateTierRecommendation(
    freeAgents: DigitalAgent[],
    proAgents: DigitalAgent[],
    enterpriseAgents: DigitalAgent[],
  ): string {
    // Simple recommendation logic
    if (enterpriseAgents.length > 0) {
      return 'Enterprise tier recommended for maximum performance and unlimited builds';
    } else if (proAgents.length > 0) {
      return 'Pro tier provides excellent balance of features and cost';
    } else {
      return 'Free tier is great to start - upgrade to Pro for advanced features';
    }
  }

  /**
   * Get training techniques overview
   * GET /npe/digital-agents/training/techniques
   */
  @Get('training/techniques')
  getTrainingTechniques() {
    return {
      techniques: [
        {
          name: 'Prompt Engineering',
          description: 'Craft optimal prompts to guide AI behavior',
          tier: 'free',
          accuracy: '60-75%',
          timeToTrain: '5 minutes',
          examples: 50,
          useCases: [
            'Quick setup for basic tasks',
            'Simple code generation',
            'Pattern matching',
          ],
        },
        {
          name: 'Few-Shot Learning',
          description: 'Provide examples to teach patterns',
          tier: 'free',
          accuracy: '70-80%',
          timeToTrain: '10 minutes',
          examples: 75,
          useCases: [
            'Learn from code examples',
            'Adapt to coding style',
            'Understand patterns',
          ],
        },
        {
          name: 'RAG (Retrieval-Augmented Generation)',
          description: 'Access codebase knowledge in real-time',
          tier: 'pro',
          accuracy: '85-92%',
          timeToTrain: '30 minutes',
          examples: 200,
          useCases: [
            'Context-aware code generation',
            'Consistent with existing patterns',
            'Knowledge of entire codebase',
          ],
        },
        {
          name: 'Chain-of-Thought',
          description: 'Step-by-step reasoning for complex tasks',
          tier: 'pro',
          accuracy: '88-95%',
          timeToTrain: '45 minutes',
          examples: 150,
          useCases: [
            'Complex architecture decisions',
            'Multi-step refactoring',
            'Debugging difficult issues',
          ],
        },
        {
          name: 'Fine-Tuning',
          description: 'Custom model trained on your codebase',
          tier: 'enterprise',
          accuracy: '95-99%',
          timeToTrain: '2-4 hours',
          examples: 1000,
          useCases: [
            'Maximum accuracy',
            'Specialized for your stack',
            'Production-ready code',
          ],
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
