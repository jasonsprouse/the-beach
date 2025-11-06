import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import {
  LogDataMarketplaceService,
  LogAnalysis,
  DataTransaction,
} from './log-data-marketplace.service';

/**
 * Log Data Marketplace Controller
 *
 * AI agents monitor pipeline logs, extract valuable data,
 * and pay for insights to improve NPE PKP development
 */
@Controller('npe/log-marketplace')
export class LogDataMarketplaceController {
  constructor(private readonly marketplaceService: LogDataMarketplaceService) {}

  /**
   * Analyze log entry
   * POST /npe/log-marketplace/analyze
   */
  @Post('analyze')
  async analyzeLog(
    @Body() body: { source: string; logContent: string; subPKPId?: string },
  ): Promise<LogAnalysis> {
    return await this.marketplaceService.analyzeLogEntry(body);
  }

  /**
   * Pay for log data
   * POST /npe/log-marketplace/pay/:logAnalysisId
   */
  @Post('pay/:logAnalysisId')
  async payForData(
    @Param('logAnalysisId') logAnalysisId: string,
    @Body() body: { subPKPId: string },
  ): Promise<DataTransaction> {
    return await this.marketplaceService.payForLogData(
      logAnalysisId,
      body.subPKPId,
    );
  }

  /**
   * Get marketplace dashboard
   * GET /npe/log-marketplace/dashboard
   */
  @Get('dashboard')
  getDashboard() {
    return this.marketplaceService.getMarketplaceDashboard();
  }

  /**
   * Get log analyses for a Sub-PKP
   * GET /npe/log-marketplace/sub-pkp/:subPKPId
   */
  @Get('sub-pkp/:subPKPId')
  getSubPKPLogs(@Param('subPKPId') subPKPId: string): LogAnalysis[] {
    return this.marketplaceService.getSubPKPLogAnalyses(subPKPId);
  }

  /**
   * Simulate pipeline monitoring
   * POST /npe/log-marketplace/simulate
   */
  @Post('simulate')
  async simulateMonitoring(
    @Body() body: { subPKPId: string; iterations: number },
  ) {
    const results: LogAnalysis[] = [];
    let totalPaid = 0;
    let totalValue = 0;

    // Sample logs from different pipeline stages
    const sampleLogs = [
      {
        source: 'build',
        content: `[2025-11-06 10:30:15] BUILD STARTED
[2025-11-06 10:30:16] Installing dependencies...
[2025-11-06 10:30:45] npm install completed in 29.4s
[2025-11-06 10:30:46] Running TypeScript compilation...
[2025-11-06 10:31:12] ERROR: Type 'string' is not assignable to type 'number' at line 42
[2025-11-06 10:31:12] BUILD FAILED
[2025-11-06 10:31:12] Build time: 57.2s`,
      },
      {
        source: 'test',
        content: `[2025-11-06 10:32:00] TEST SUITE STARTED
[2025-11-06 10:32:01] Running unit tests...
[2025-11-06 10:32:15] ✓ User authentication works (142ms)
[2025-11-06 10:32:18] ✗ Payment processing fails on timeout (5024ms)
[2025-11-06 10:32:18] ERROR: Connection timeout after 5000ms
[2025-11-06 10:32:20] Coverage: 78.5% (target: 80%)
[2025-11-06 10:32:20] 15 passing, 1 failing`,
      },
      {
        source: 'deploy',
        content: `[2025-11-06 10:35:00] DEPLOYMENT STARTED
[2025-11-06 10:35:05] Building Docker image...
[2025-11-06 10:35:42] Image built successfully (37.1s)
[2025-11-06 10:35:43] Pushing to registry...
[2025-11-06 10:36:18] WARNING: Image size 2.4GB exceeds recommended 1GB
[2025-11-06 10:36:20] Deploying to production...
[2025-11-06 10:36:25] DEPLOYMENT SUCCESSFUL
[2025-11-06 10:36:25] URL: https://api.example.com`,
      },
      {
        source: 'runtime',
        content: `[2025-11-06 10:40:00] API REQUEST: GET /api/users
[2025-11-06 10:40:00] Processing request...
[2025-11-06 10:40:02] Database query took 1842ms (slow query warning)
[2025-11-06 10:40:02] Response sent (2.1s total)
[2025-11-06 10:40:05] SECURITY WARNING: Unauthorized access attempt from IP 192.168.1.100
[2025-11-06 10:40:05] Access denied
[2025-11-06 10:40:10] Memory usage: 85% (high memory alert)`,
      },
      {
        source: 'runtime',
        content: `[2025-11-06 10:45:00] CRITICAL ERROR: Uncaught exception
[2025-11-06 10:45:00] TypeError: Cannot read property 'id' of undefined
[2025-11-06 10:45:00] at processOrder (orders.service.ts:42:18)
[2025-11-06 10:45:00] at OrderController.createOrder (orders.controller.ts:28:25)
[2025-11-06 10:45:00] Request failed with status 500
[2025-11-06 10:45:00] Potential revenue loss: $2,400 (12 failed transactions)`,
      },
    ];

    for (let i = 0; i < body.iterations; i++) {
      const log = sampleLogs[i % sampleLogs.length];

      const analysis = await this.marketplaceService.analyzeLogEntry({
        source: log.source,
        logContent: log.content,
        subPKPId: body.subPKPId,
      });

      results.push(analysis);
      totalPaid += analysis.paymentAmount;
      totalValue += analysis.valueScore;
    }

    const dashboard = this.marketplaceService.getMarketplaceDashboard();

    return {
      simulationComplete: true,
      iterations: body.iterations,
      results: results.map((r) => ({
        id: r.id,
        source: r.source,
        valueScore: r.valueScore,
        paymentAmount: r.paymentAmount,
        quality: r.quality.overall,
        insights: {
          errors: r.aiInsights.errorPatterns.length,
          performance: r.aiInsights.performanceIssues.length,
          security: r.aiInsights.securityConcerns.length,
          improvements: r.aiInsights.improvementOpportunities.length,
        },
        improvementPotential: r.improvementPotential,
        paid: r.paid,
      })),
      summary: {
        totalPaid: Math.round(totalPaid * 100) / 100,
        averageValue: Math.round(totalValue / body.iterations),
        averagePayment: Math.round((totalPaid / body.iterations) * 100) / 100,
        totalInsights: results.reduce(
          (sum, r) =>
            sum +
            r.aiInsights.errorPatterns.length +
            r.aiInsights.performanceIssues.length +
            r.aiInsights.securityConcerns.length,
          0,
        ),
      },
      dashboard,
    };
  }

  /**
   * Batch analyze logs
   * POST /npe/log-marketplace/batch-analyze
   */
  @Post('batch-analyze')
  async batchAnalyze(
    @Body()
    body: {
      subPKPId: string;
      logs: Array<{
        source: string;
        content: string;
      }>;
    },
  ) {
    const results: LogAnalysis[] = [];
    let totalPaid = 0;

    for (const log of body.logs) {
      const analysis = await this.marketplaceService.analyzeLogEntry({
        source: log.source,
        logContent: log.content,
        subPKPId: body.subPKPId,
      });

      results.push(analysis);
      if (analysis.paid) {
        totalPaid += analysis.paymentAmount;
      }
    }

    return {
      totalLogs: body.logs.length,
      totalPaid: Math.round(totalPaid * 100) / 100,
      averageValue:
        results.reduce((sum, r) => sum + r.valueScore, 0) / results.length,
      averageQuality:
        results.reduce((sum, r) => sum + r.quality.overall, 0) / results.length,
      results: results.map((r) => ({
        id: r.id,
        source: r.source,
        valueScore: r.valueScore,
        payment: r.paymentAmount,
        paid: r.paid,
      })),
    };
  }

  /**
   * Get pricing model
   * GET /npe/log-marketplace/pricing
   */
  @Get('pricing')
  getPricing() {
    return {
      basePrice: 0.1,
      qualityMultiplier: 0.01,
      bonuses: {
        uniqueness: 0.5,
        criticalError: 5.0,
        security: 10.0,
        performance: 2.0,
      },
      formula:
        'Payment = (Base + Quality * Multiplier + Bonuses) * ValueScore%',
      examples: [
        {
          scenario: 'Basic log entry',
          quality: 60,
          value: 50,
          payment: '$0.35',
        },
        {
          scenario: 'High-quality performance log',
          quality: 85,
          value: 75,
          bonuses: ['performance'],
          payment: '$2.20',
        },
        {
          scenario: 'Critical security vulnerability',
          quality: 95,
          value: 100,
          bonuses: ['security', 'uniqueness'],
          payment: '$11.45',
        },
      ],
    };
  }

  /**
   * Get monitoring agents
   * GET /npe/log-marketplace/agents
   */
  @Get('agents')
  getAgents() {
    const dashboard = this.marketplaceService.getMarketplaceDashboard();

    return {
      agents: dashboard.monitoringAgents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        expertise: agent.expertise,
        monitoredStages: agent.monitoredStages,
        active: agent.active,
        stats: {
          logsAnalyzed: agent.logsAnalyzed,
          insightsGenerated: agent.insightsGenerated,
          moneyPaid: Math.round(agent.moneyPaid * 100) / 100,
          accuracy: agent.accuracy,
        },
        aiModel: agent.aiModel,
      })),
      totalAgents: dashboard.monitoringAgents.length,
      activeAgents: dashboard.monitoringAgents.filter((a) => a.active).length,
    };
  }

  /**
   * Get top earners
   * GET /npe/log-marketplace/top-earners
   */
  @Get('top-earners')
  getTopEarners(@Query('limit') limit?: string) {
    const dashboard = this.marketplaceService.getMarketplaceDashboard();
    const earnerLimit = limit ? parseInt(limit, 10) : 10;

    return {
      topEarners: dashboard.topDataSellers
        .slice(0, earnerLimit)
        .map((seller, index) => ({
          rank: index + 1,
          subPKPId: seller.subPKPId,
          totalEarnings: Math.round(seller.earnings * 100) / 100,
          logsSubmitted: seller.logs,
          averageEarnings:
            Math.round((seller.earnings / seller.logs) * 100) / 100,
        })),
      totalMarketplace: {
        totalPaid: dashboard.totalPaid,
        totalInsights: dashboard.totalInsights,
        averagePayment: dashboard.averagePayment,
      },
    };
  }

  /**
   * Get quality trends
   * GET /npe/log-marketplace/quality-trends
   */
  @Get('quality-trends')
  getQualityTrends() {
    const dashboard = this.marketplaceService.getMarketplaceDashboard();

    return {
      currentTrends: dashboard.qualityTrends,
      insights: [
        {
          metric: 'Quality',
          value: dashboard.qualityTrends.averageQuality,
          target: 80,
          status:
            dashboard.qualityTrends.averageQuality >= 80
              ? 'good'
              : 'needs-improvement',
        },
        {
          metric: 'Value',
          value: dashboard.qualityTrends.averageValue,
          target: 70,
          status:
            dashboard.qualityTrends.averageValue >= 70
              ? 'good'
              : 'needs-improvement',
        },
        {
          metric: 'ROI',
          value: dashboard.qualityTrends.averageROI,
          target: 5000,
          status:
            dashboard.qualityTrends.averageROI >= 5000 ? 'excellent' : 'good',
        },
      ],
      recommendations: this.generateRecommendations(dashboard.qualityTrends),
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(trends: any): string[] {
    const recommendations: string[] = [];

    if (trends.averageQuality < 80) {
      recommendations.push(
        'Focus on generating more complete and detailed logs',
      );
    }

    if (trends.averageValue < 70) {
      recommendations.push(
        'Include more actionable insights in logs (errors, performance metrics)',
      );
    }

    if (trends.averageROI < 5000) {
      recommendations.push(
        'Target critical errors and security issues for higher ROI',
      );
    } else {
      recommendations.push(
        'Excellent ROI! Keep focusing on high-value data generation',
      );
    }

    return recommendations;
  }
}
