import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import {
  AITestingRevenueService,
  CodeImprovementTest,
} from './ai-testing-revenue.service';

/**
 * AI Testing & Revenue Controller
 *
 * Endpoints for rigorous AI testing and revenue tracking
 */
@Controller('npe/ai-testing')
export class AITestingRevenueController {
  constructor(private readonly testingService: AITestingRevenueService) {}

  /**
   * Test code improvement with AI
   * POST /npe/ai-testing/test
   */
  @Post('test')
  async testCode(
    @Body()
    body: {
      subPKPId: string;
      code: string;
      language: string;
      context?: string;
      testType: 'performance' | 'quality' | 'security' | 'revenue-impact';
    },
  ): Promise<CodeImprovementTest> {
    return await this.testingService.testCodeImprovement({
      subPKPId: body.subPKPId,
      originalCode: body.code,
      language: body.language,
      context: body.context,
      testType: body.testType,
    });
  }

  /**
   * Deploy code improvement
   * POST /npe/ai-testing/deploy/:testId
   */
  @Post('deploy/:testId')
  async deployImprovement(@Param('testId') testId: string) {
    return await this.testingService.deployImprovement(testId);
  }

  /**
   * Get revenue dashboard
   * GET /npe/ai-testing/revenue-dashboard
   */
  @Get('revenue-dashboard')
  getRevenueDashboard() {
    return this.testingService.getRevenueDashboard();
  }

  /**
   * Get test results for a sub-PKP
   * GET /npe/ai-testing/results/:subPKPId
   */
  @Get('results/:subPKPId')
  getTestResults(@Param('subPKPId') subPKPId: string): CodeImprovementTest[] {
    return this.testingService.getTestResults(subPKPId);
  }

  /**
   * Run comprehensive test suite
   * POST /npe/ai-testing/test-suite
   */
  @Post('test-suite')
  async runTestSuite(
    @Body()
    body: {
      subPKPId: string;
      codeFiles: Array<{
        code: string;
        language: string;
        description: string;
      }>;
    },
  ) {
    const results: CodeImprovementTest[] = [];
    let totalEstimatedRevenue = 0;

    for (const file of body.codeFiles) {
      const test = await this.testingService.testCodeImprovement({
        subPKPId: body.subPKPId,
        originalCode: file.code,
        language: file.language,
        context: file.description,
        testType: 'revenue-impact',
      });

      results.push(test);
      totalEstimatedRevenue += test.estimatedMonthlyRevenue;
    }

    return {
      tests: results,
      totalTests: results.length,
      passedTests: results.filter((t) => t.passed).length,
      failedTests: results.filter((t) => !t.passed).length,
      totalEstimatedRevenue,
      averageQualityScore:
        results.reduce((sum, t) => sum + t.metrics.codeQualityScore, 0) /
        results.length,
      deploymentRecommendations: {
        deploy: results.filter((t) => t.aiAnalysis.recommendation === 'deploy')
          .length,
        refine: results.filter((t) => t.aiAnalysis.recommendation === 'refine')
          .length,
        reject: results.filter((t) => t.aiAnalysis.recommendation === 'reject')
          .length,
      },
    };
  }

  /**
   * Simulate revenue generation (for testing)
   * POST /npe/ai-testing/simulate-revenue
   */
  @Post('simulate-revenue')
  async simulateRevenue(
    @Body() body: { subPKPId: string; iterations: number },
  ) {
    const sampleCode = `
// Sample e-commerce checkout function
async function processCheckout(cart, paymentInfo) {
  // Validate cart
  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty');
  }
  
  // Calculate total
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Process payment
  const payment = await paymentService.charge(paymentInfo, total);
  
  // Create order
  const order = await orderService.create({
    items: cart.items,
    total,
    paymentId: payment.id,
  });
  
  return order;
}`;

    const results: Array<{
      iteration: number;
      testId: string;
      passed: boolean;
      qualityScore: number;
      estimatedRevenue: number;
      recommendation: string;
    }> = [];
    const languages = ['TypeScript', 'JavaScript', 'Python'];

    for (let i = 0; i < body.iterations; i++) {
      const test = await this.testingService.testCodeImprovement({
        subPKPId: body.subPKPId,
        originalCode: sampleCode,
        language: languages[i % languages.length],
        context: `Iteration ${i + 1} - Testing revenue optimization`,
        testType: 'revenue-impact',
      });

      results.push({
        iteration: i + 1,
        testId: test.id,
        passed: test.passed,
        qualityScore: test.metrics.codeQualityScore,
        estimatedRevenue: test.estimatedMonthlyRevenue,
        recommendation: test.aiAnalysis.recommendation,
      });

      // Deploy high-value improvements
      if (
        test.aiAnalysis.recommendation === 'deploy' &&
        test.estimatedMonthlyRevenue > 1000
      ) {
        await this.testingService.deployImprovement(test.id);
      }
    }

    const dashboard = this.testingService.getRevenueDashboard();

    return {
      simulationComplete: true,
      iterations: body.iterations,
      results,
      dashboard,
      summary: {
        totalEstimatedRevenue: results.reduce(
          (sum, r) => sum + r.estimatedRevenue,
          0,
        ),
        averageQualityScore:
          results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length,
        deploymentRate:
          (results.filter((r) => r.recommendation === 'deploy').length /
            results.length) *
          100,
      },
    };
  }

  /**
   * Get top performing improvements
   * GET /npe/ai-testing/top-performers
   */
  @Get('top-performers')
  getTopPerformers(@Query('limit') limit?: string) {
    const dashboard = this.testingService.getRevenueDashboard();
    const performerLimit = limit ? parseInt(limit, 10) : 10;

    return {
      topPerformers: dashboard.topPerformingTests
        .slice(0, performerLimit)
        .map((test) => ({
          testId: test.id,
          subPKPId: test.subPKPId,
          language: test.language,
          qualityScore: test.metrics.codeQualityScore,
          securityScore: test.metrics.securityScore,
          estimatedRevenue: test.estimatedMonthlyRevenue,
          actualRevenue: test.actualMonthlyRevenue,
          revenueAccuracy: test.actualMonthlyRevenue
            ? (
                (test.actualMonthlyRevenue / test.estimatedMonthlyRevenue) *
                100
              ).toFixed(2)
            : null,
          deployedAt: test.deployedAt,
          recommendation: test.aiAnalysis.recommendation,
          improvements: test.aiAnalysis.improvements.length,
        })),
      totalRevenue: dashboard.totalActualRevenue,
      averageRevenue: dashboard.averageRevenuePerImprovement,
    };
  }

  /**
   * Get revenue forecast
   * GET /npe/ai-testing/forecast
   */
  @Get('forecast')
  getRevenueForecast() {
    const dashboard = this.testingService.getRevenueDashboard();

    // Simple projection based on current performance
    const monthlyGrowthRate = 1.15; // 15% monthly growth
    const forecast: Array<{
      month: number;
      projectedRevenue: number;
      projectedAnnual: number;
    }> = [];

    let currentRevenue =
      dashboard.totalActualRevenue || dashboard.totalEstimatedRevenue;

    for (let month = 1; month <= 12; month++) {
      currentRevenue *= monthlyGrowthRate;
      forecast.push({
        month,
        projectedRevenue: Math.round(currentRevenue),
        projectedAnnual: Math.round(currentRevenue * 12),
      });
    }

    return {
      currentMonthlyRevenue: dashboard.totalActualRevenue,
      estimatedMonthlyRevenue: dashboard.totalEstimatedRevenue,
      deployedImprovements: dashboard.deployedImprovements,
      averageRevenuePerImprovement: Math.round(
        dashboard.averageRevenuePerImprovement,
      ),
      forecast,
      assumptions: {
        monthlyGrowthRate: '15%',
        deploymentRate: '80%',
        revenueAccuracy: `${dashboard.revenueAccuracy}%`,
      },
    };
  }

  /**
   * Get test analytics
   * GET /npe/ai-testing/analytics/:subPKPId
   */
  @Get('analytics/:subPKPId')
  getAnalytics(@Param('subPKPId') subPKPId: string) {
    const tests = this.testingService.getTestResults(subPKPId);

    if (tests.length === 0) {
      return {
        message: 'No test data available',
        subPKPId,
      };
    }

    const totalTests = tests.length;
    const passedTests = tests.filter((t) => t.passed).length;
    const deployedTests = tests.filter((t) => t.deployedAt).length;

    return {
      subPKPId,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      passRate: ((passedTests / totalTests) * 100).toFixed(2) + '%',
      deployedTests,
      deploymentRate: ((deployedTests / totalTests) * 100).toFixed(2) + '%',

      qualityMetrics: {
        averageCodeQuality: (
          tests.reduce((sum, t) => sum + t.metrics.codeQualityScore, 0) /
          totalTests
        ).toFixed(2),
        averageSecurityScore: (
          tests.reduce((sum, t) => sum + t.metrics.securityScore, 0) /
          totalTests
        ).toFixed(2),
        averageMaintainability: (
          tests.reduce((sum, t) => sum + t.metrics.maintainabilityScore, 0) /
          totalTests
        ).toFixed(2),
      },

      revenueMetrics: {
        totalEstimatedRevenue: tests.reduce(
          (sum, t) => sum + t.estimatedMonthlyRevenue,
          0,
        ),
        totalActualRevenue: tests.reduce(
          (sum, t) => sum + (t.actualMonthlyRevenue || 0),
          0,
        ),
        averageEstimatedRevenue: Math.round(
          tests.reduce((sum, t) => sum + t.estimatedMonthlyRevenue, 0) /
            totalTests,
        ),
        highestRevenueTest: Math.max(
          ...tests.map((t) => t.estimatedMonthlyRevenue),
        ),
      },

      recommendations: {
        deploy: tests.filter((t) => t.aiAnalysis.recommendation === 'deploy')
          .length,
        refine: tests.filter((t) => t.aiAnalysis.recommendation === 'refine')
          .length,
        reject: tests.filter((t) => t.aiAnalysis.recommendation === 'reject')
          .length,
      },

      averageTestDuration: Math.round(
        tests.reduce((sum, t) => sum + t.testDurationMs, 0) / totalTests,
      ),
      averageConfidence: (
        tests.reduce((sum, t) => sum + t.aiAnalysis.confidenceScore, 0) /
        totalTests
      ).toFixed(2),
    };
  }
}
