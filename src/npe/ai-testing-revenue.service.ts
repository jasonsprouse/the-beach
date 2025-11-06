import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AIAgentService } from './services/ai-agent.service';
import { ContinuousImprovementGameManager } from './continuous-improvement-game.service';

/**
 * Code Improvement Test Result
 */
export interface CodeImprovementTest {
  id: string;
  subPKPId: string;
  testType: 'performance' | 'quality' | 'security' | 'revenue-impact';
  originalCode: string;
  improvedCode: string;
  language: string;

  // Test metrics
  metrics: {
    // Performance
    executionTimeMs?: number;
    memoryUsageMB?: number;
    complexityScore?: number;

    // Quality
    codeQualityScore: number; // 0-100
    securityScore: number; // 0-100
    maintainabilityScore: number; // 0-100
    testCoverage?: number;

    // Revenue impact
    revenueImpact: RevenueImpact;
  };

  // AI analysis
  aiAnalysis: {
    improvements: Array<{
      type: string;
      description: string;
      impact: 'low' | 'medium' | 'high' | 'critical';
      revenueImplication: string;
    }>;
    riskAssessment: {
      level: 'low' | 'medium' | 'high';
      risks: string[];
      mitigations: string[];
    };
    recommendation: 'deploy' | 'refine' | 'reject';
    confidenceScore: number; // 0-100
  };

  // Test execution
  testStartedAt: Date;
  testCompletedAt?: Date;
  testDurationMs: number;
  passed: boolean;

  // Revenue tracking
  estimatedMonthlyRevenue: number;
  actualMonthlyRevenue?: number;
  deployedAt?: Date;
}

/**
 * Revenue Impact Analysis
 */
export interface RevenueImpact {
  // Direct revenue metrics
  revenuePerRequest: number;
  requestsPerDay: number;
  estimatedDailyRevenue: number;
  estimatedMonthlyRevenue: number;
  estimatedAnnualRevenue: number;

  // Improvement metrics
  revenueIncrease: number; // Percentage increase
  revenueIncreaseAmount: number; // Dollar amount

  // User engagement
  userSatisfactionScore: number; // 0-100
  expectedUserRetention: number; // Percentage
  expectedChurnReduction: number; // Percentage

  // Cost metrics
  costPerRequest: number;
  profitMargin: number; // Percentage
  roiMultiplier: number;

  // Market impact
  competitiveAdvantage: string;
  marketDifferentiation: string;
  pricingPower: number; // 0-100
}

/**
 * Revenue Test Suite
 */
export interface RevenueTestSuite {
  id: string;
  name: string;
  description: string;
  tests: CodeImprovementTest[];
  totalEstimatedRevenue: number;
  totalActualRevenue: number;
  roiScore: number;
  createdAt: Date;
  lastRunAt: Date;
}

/**
 * AI Testing and Revenue Tracking Service
 *
 * Uses rigorous AI testing to simulate code improvements
 * and measures their value in monetary terms
 */
@Injectable()
export class AITestingRevenueService {
  private readonly logger = new Logger(AITestingRevenueService.name);

  // Test suites
  private testSuites = new Map<string, RevenueTestSuite>();

  // Test results
  private testResults = new Map<string, CodeImprovementTest>();

  // Revenue tracking
  private totalEstimatedRevenue = 0;
  private totalActualRevenue = 0;
  private deployedImprovements = 0;

  constructor(
    private readonly aiService: AIAgentService,
    private readonly gameManager: ContinuousImprovementGameManager,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('💰 AI Testing & Revenue Service initialized');
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Listen to task completions and test them
    this.eventEmitter.on(
      'task.completed',
      async (event: {
        subPKPId: string;
        taskId: string;
        code?: string;
        language?: string;
      }) => {
        if (event.code && event.language) {
          await this.runAutomatedRevenueTest(
            event.subPKPId,
            event.code,
            event.language,
          );
        }
      },
    );
  }

  /**
   * Run comprehensive AI testing on code
   */
  async testCodeImprovement(params: {
    subPKPId: string;
    originalCode: string;
    language: string;
    context?: string;
    testType: CodeImprovementTest['testType'];
  }): Promise<CodeImprovementTest> {
    const startTime = Date.now();
    const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(
      `🧪 Starting ${params.testType} test for ${params.subPKPId}`,
    );

    // Step 1: AI Code Review
    const codeReview = await this.aiService.reviewCode({
      code: params.originalCode,
      language: params.language,
      context: params.context,
    });

    // Step 2: Generate Improved Code
    const optimization = await this.aiService.optimizeCode({
      code: params.originalCode,
      language: params.language,
      goals: [
        'performance',
        'security',
        'maintainability',
        'revenue generation',
        'user experience',
      ],
    });

    // Step 3: Analyze Revenue Impact
    const revenueImpact = await this.analyzeRevenueImpact(
      params.originalCode,
      optimization.optimizedCode,
      params.language,
      codeReview,
    );

    // Step 4: Run AI Risk Assessment
    const riskAssessment = await this.assessDeploymentRisk(
      optimization.optimizedCode,
      params.language,
      revenueImpact,
    );

    // Step 5: Generate Recommendation
    const recommendation = this.generateDeploymentRecommendation(
      codeReview.score,
      revenueImpact,
      riskAssessment,
    );

    const test: CodeImprovementTest = {
      id: testId,
      subPKPId: params.subPKPId,
      testType: params.testType,
      originalCode: params.originalCode,
      improvedCode: optimization.optimizedCode,
      language: params.language,

      metrics: {
        codeQualityScore: codeReview.score,
        securityScore: this.calculateSecurityScore(codeReview.issues),
        maintainabilityScore: this.calculateMaintainabilityScore(
          optimization.improvements,
        ),
        complexityScore: this.estimateComplexity(optimization.optimizedCode),
        revenueImpact,
      },

      aiAnalysis: {
        improvements: optimization.improvements.map((imp) => ({
          type: imp.type,
          description: imp.description,
          impact: imp.impact as any,
          revenueImplication: this.extractRevenueImplication(imp),
        })),
        riskAssessment,
        recommendation,
        confidenceScore: this.calculateConfidenceScore(
          codeReview,
          revenueImpact,
          riskAssessment,
        ),
      },

      testStartedAt: new Date(startTime),
      testCompletedAt: new Date(),
      testDurationMs: Date.now() - startTime,
      passed: codeReview.score >= 70 && riskAssessment.level !== 'high',

      estimatedMonthlyRevenue: revenueImpact.estimatedMonthlyRevenue,
    };

    // Store test result
    this.testResults.set(testId, test);

    // Update revenue tracking
    this.totalEstimatedRevenue += revenueImpact.estimatedMonthlyRevenue;

    // Award game points based on test quality
    this.awardTestingPoints(params.subPKPId, test);

    // Emit test completion event
    this.eventEmitter.emit('test.completed', {
      testId,
      subPKPId: params.subPKPId,
      passed: test.passed,
      revenueImpact: revenueImpact.estimatedMonthlyRevenue,
      recommendation,
      timestamp: new Date(),
    });

    this.logger.log(
      `✅ Test completed: ${testId} - ${recommendation} (Est. revenue: $${revenueImpact.estimatedMonthlyRevenue}/mo)`,
    );

    return test;
  }

  /**
   * Analyze revenue impact of code improvement
   */
  private async analyzeRevenueImpact(
    originalCode: string,
    improvedCode: string,
    language: string,
    codeReview: any,
  ): Promise<RevenueImpact> {
    // Use AI to estimate revenue impact
    const prompt = `Analyze the revenue impact of this code improvement:

ORIGINAL CODE:
\`\`\`${language}
${originalCode}
\`\`\`

IMPROVED CODE:
\`\`\`${language}
${improvedCode}
\`\`\`

CODE QUALITY SCORE: ${codeReview.score}/100

Estimate:
1. Performance improvement (% faster)
2. User satisfaction increase (0-100)
3. Revenue per request ($)
4. Expected requests per day
5. User retention improvement (%)
6. Competitive advantage gained
7. Pricing power increase (0-100)

Provide realistic estimates based on code quality and improvements.`;

    try {
      const result = await this.aiService.answerQuestion({
        question: prompt,
        context: 'Revenue analysis for code deployment',
      });

      // Parse AI response (in production, use structured output)
      const performanceGain = this.extractNumber(
        result.answer,
        'performance',
        15,
      );
      const satisfactionIncrease = this.extractNumber(
        result.answer,
        'satisfaction',
        10,
      );
      const revenuePerRequest = this.extractNumber(
        result.answer,
        'revenue per request',
        0.05,
      );
      const requestsPerDay = this.extractNumber(
        result.answer,
        'requests per day',
        1000,
      );
      const retentionIncrease = this.extractNumber(
        result.answer,
        'retention',
        5,
      );
      const pricingPower = this.extractNumber(
        result.answer,
        'pricing power',
        60,
      );

      // Calculate revenue metrics
      const baselineRevenue = revenuePerRequest * requestsPerDay * 30;
      const improvedRevenue = baselineRevenue * (1 + performanceGain / 100);
      const revenueIncrease =
        ((improvedRevenue - baselineRevenue) / baselineRevenue) * 100;

      // Cost analysis
      const costPerRequest = revenuePerRequest * 0.3; // 30% cost ratio
      const profitMargin =
        ((improvedRevenue - costPerRequest * requestsPerDay * 30) /
          improvedRevenue) *
        100;

      return {
        revenuePerRequest,
        requestsPerDay,
        estimatedDailyRevenue: improvedRevenue / 30,
        estimatedMonthlyRevenue: Math.round(improvedRevenue),
        estimatedAnnualRevenue: Math.round(improvedRevenue * 12),

        revenueIncrease: Math.round(revenueIncrease * 100) / 100,
        revenueIncreaseAmount: Math.round(improvedRevenue - baselineRevenue),

        userSatisfactionScore: Math.min(100, 70 + satisfactionIncrease),
        expectedUserRetention: Math.min(100, 85 + retentionIncrease),
        expectedChurnReduction: Math.round(retentionIncrease / 2),

        costPerRequest,
        profitMargin: Math.round(profitMargin * 100) / 100,
        roiMultiplier:
          Math.round((improvedRevenue / (baselineRevenue || 1)) * 100) / 100,

        competitiveAdvantage: this.extractCompetitiveAdvantage(result.answer),
        marketDifferentiation: this.extractMarketDifferentiation(result.answer),
        pricingPower,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze revenue impact: ${error.message}`);

      // Fallback to simple estimates
      return this.generateFallbackRevenueImpact(codeReview.score);
    }
  }

  /**
   * Assess deployment risk
   */
  private async assessDeploymentRisk(
    code: string,
    language: string,
    revenueImpact: RevenueImpact,
  ): Promise<CodeImprovementTest['aiAnalysis']['riskAssessment']> {
    const risks: string[] = [];
    const mitigations: string[] = [];

    // Revenue risk
    if (revenueImpact.revenueIncrease < 5) {
      risks.push('Low revenue impact - may not justify deployment cost');
      mitigations.push('Bundle with other improvements or A/B test first');
    }

    // Complexity risk
    const complexity = this.estimateComplexity(code);
    if (complexity > 15) {
      risks.push('High code complexity - increased maintenance burden');
      mitigations.push('Add comprehensive documentation and tests');
    }

    // User experience risk
    if (revenueImpact.userSatisfactionScore < 80) {
      risks.push('Moderate user satisfaction impact');
      mitigations.push('Gather user feedback before full rollout');
    }

    // Calculate risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (risks.length >= 3) riskLevel = 'high';
    else if (risks.length >= 2) riskLevel = 'medium';

    return {
      level: riskLevel,
      risks,
      mitigations,
    };
  }

  /**
   * Generate deployment recommendation
   */
  private generateDeploymentRecommendation(
    qualityScore: number,
    revenueImpact: RevenueImpact,
    riskAssessment: any,
  ): 'deploy' | 'refine' | 'reject' {
    // Reject if high risk or low quality
    if (riskAssessment.level === 'high' || qualityScore < 60) {
      return 'reject';
    }

    // Recommend refinement if medium risk or moderate revenue
    if (
      riskAssessment.level === 'medium' ||
      revenueImpact.revenueIncrease < 10
    ) {
      return 'refine';
    }

    // Deploy if high quality and good revenue potential
    if (qualityScore >= 80 && revenueImpact.revenueIncrease >= 10) {
      return 'deploy';
    }

    return 'refine';
  }

  /**
   * Award testing points to sub-PKP
   */
  private awardTestingPoints(
    subPKPId: string,
    test: CodeImprovementTest,
  ): void {
    // Calculate points based on test quality and revenue impact
    let points = 0;

    // Base points for completing test
    points += 20;

    // Quality bonus
    points += Math.floor(test.metrics.codeQualityScore / 10);

    // Revenue bonus (major points for high revenue impact)
    const revenueBonus = Math.floor(
      test.metrics.revenueImpact.estimatedMonthlyRevenue / 100,
    );
    points += Math.min(revenueBonus, 100); // Cap at 100 bonus points

    // Security bonus
    points += Math.floor(test.metrics.securityScore / 10);

    // Passed test bonus
    if (test.passed) {
      points += 30;
    }

    // Deployment recommendation bonus
    if (test.aiAnalysis.recommendation === 'deploy') {
      points += 50;
    }

    // Emit task completion to game manager
    this.eventEmitter.emit('task.completed', {
      subPKPId,
      success: test.passed,
      duration: test.testDurationMs / 1000,
      quality: test.metrics.codeQualityScore,
      taskType: 'ai-testing',
    });

    // Emit revenue event for high-value improvements
    if (test.metrics.revenueImpact.estimatedMonthlyRevenue >= 1000) {
      this.eventEmitter.emit('innovation.detected', {
        subPKPId,
        innovation: `High-value code improvement: $${test.metrics.revenueImpact.estimatedMonthlyRevenue}/mo`,
        impact: Math.min(
          100,
          test.metrics.revenueImpact.estimatedMonthlyRevenue / 100,
        ),
      });
    }

    this.logger.log(`🎮 Awarded ${points} points to ${subPKPId} for testing`);
  }

  /**
   * Run automated revenue test (triggered by events)
   */
  private async runAutomatedRevenueTest(
    subPKPId: string,
    code: string,
    language: string,
  ): Promise<void> {
    try {
      await this.testCodeImprovement({
        subPKPId,
        originalCode: code,
        language,
        testType: 'revenue-impact',
      });
    } catch (error) {
      this.logger.error(`Automated test failed: ${error.message}`);
    }
  }

  /**
   * Deploy code improvement and track actual revenue
   */
  async deployImprovement(testId: string): Promise<{
    deployed: boolean;
    message: string;
    estimatedRevenue: number;
  }> {
    const test = this.testResults.get(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    if (test.aiAnalysis.recommendation === 'reject') {
      return {
        deployed: false,
        message: 'Deployment rejected due to high risk or low quality',
        estimatedRevenue: 0,
      };
    }

    // Mark as deployed
    test.deployedAt = new Date();
    this.deployedImprovements++;

    // Start tracking actual revenue (in production, integrate with analytics)
    this.startRevenueTracking(test);

    this.logger.log(
      `🚀 Deployed improvement: ${testId} (Est. $${test.estimatedMonthlyRevenue}/mo)`,
    );

    // Award deployment achievement
    this.eventEmitter.emit('achievement.unlocked', {
      subPKPId: test.subPKPId,
      achievement: {
        id: `deployment_${testId}`,
        name: 'Code Deployed',
        description: `Deployed revenue-generating improvement`,
        icon: '🚀',
        rarity: test.estimatedMonthlyRevenue > 5000 ? 'epic' : 'rare',
      },
    });

    return {
      deployed: true,
      message: 'Code improvement deployed successfully',
      estimatedRevenue: test.estimatedMonthlyRevenue,
    };
  }

  /**
   * Start tracking actual revenue for deployed improvement
   */
  private startRevenueTracking(test: CodeImprovementTest): void {
    // In production, integrate with analytics services
    // For now, simulate revenue tracking
    setTimeout(() => {
      const actualRevenue =
        test.estimatedMonthlyRevenue * (0.8 + Math.random() * 0.4);
      test.actualMonthlyRevenue = Math.round(actualRevenue);
      this.totalActualRevenue += test.actualMonthlyRevenue;

      this.logger.log(
        `📊 Revenue update: ${test.id} - $${test.actualMonthlyRevenue}/mo (estimated: $${test.estimatedMonthlyRevenue})`,
      );

      // Emit revenue event
      this.eventEmitter.emit('revenue.tracked', {
        testId: test.id,
        subPKPId: test.subPKPId,
        estimatedRevenue: test.estimatedMonthlyRevenue,
        actualRevenue: test.actualMonthlyRevenue,
        accuracy:
          (test.actualMonthlyRevenue / test.estimatedMonthlyRevenue) * 100,
        timestamp: new Date(),
      });
    }, 5000); // Simulate 5 second tracking delay
  }

  /**
   * Get revenue dashboard
   */
  getRevenueDashboard(): {
    totalEstimatedRevenue: number;
    totalActualRevenue: number;
    deployedImprovements: number;
    averageRevenuePerImprovement: number;
    topPerformingTests: CodeImprovementTest[];
    revenueAccuracy: number;
  } {
    const topTests = Array.from(this.testResults.values())
      .filter((t) => t.deployedAt)
      .sort(
        (a, b) => (b.actualMonthlyRevenue || 0) - (a.actualMonthlyRevenue || 0),
      )
      .slice(0, 10);

    const accuracy =
      this.totalEstimatedRevenue > 0
        ? (this.totalActualRevenue / this.totalEstimatedRevenue) * 100
        : 0;

    return {
      totalEstimatedRevenue: this.totalEstimatedRevenue,
      totalActualRevenue: this.totalActualRevenue,
      deployedImprovements: this.deployedImprovements,
      averageRevenuePerImprovement:
        this.deployedImprovements > 0
          ? this.totalActualRevenue / this.deployedImprovements
          : 0,
      topPerformingTests: topTests,
      revenueAccuracy: Math.round(accuracy * 100) / 100,
    };
  }

  /**
   * Get test results for a sub-PKP
   */
  getTestResults(subPKPId: string): CodeImprovementTest[] {
    return Array.from(this.testResults.values())
      .filter((test) => test.subPKPId === subPKPId)
      .sort((a, b) => b.testStartedAt.getTime() - a.testStartedAt.getTime());
  }

  // Helper methods

  private calculateSecurityScore(issues: any[]): number {
    const criticalIssues = issues.filter(
      (i) => i.severity === 'critical',
    ).length;
    const highIssues = issues.filter((i) => i.severity === 'high').length;

    let score = 100;
    score -= criticalIssues * 20;
    score -= highIssues * 10;

    return Math.max(0, score);
  }

  private calculateMaintainabilityScore(improvements: any[]): number {
    const highImpact = improvements.filter((i) => i.impact === 'high').length;
    return Math.min(100, 60 + highImpact * 10);
  }

  private estimateComplexity(code: string): number {
    const lines = code.split('\n').length;
    const functions = (code.match(/function|=>/g) || []).length;
    const conditionals = (code.match(/if|switch|case|\?/g) || []).length;

    return Math.floor(lines / 10 + functions * 2 + conditionals * 1.5);
  }

  private calculateConfidenceScore(
    codeReview: any,
    revenueImpact: RevenueImpact,
    riskAssessment: any,
  ): number {
    let confidence = 50;

    // Quality confidence
    confidence += (codeReview.score - 50) / 2;

    // Revenue confidence
    if (revenueImpact.revenueIncrease > 20) confidence += 20;
    else if (revenueImpact.revenueIncrease > 10) confidence += 10;

    // Risk confidence
    if (riskAssessment.level === 'low') confidence += 20;
    else if (riskAssessment.level === 'medium') confidence += 10;

    return Math.min(100, Math.max(0, Math.round(confidence)));
  }

  private extractNumber(
    text: string,
    keyword: string,
    defaultValue: number,
  ): number {
    const regex = new RegExp(`${keyword}[^\\d]*(\\d+\\.?\\d*)`, 'i');
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : defaultValue;
  }

  private extractRevenueImplication(improvement: any): string {
    const implications = {
      performance:
        'Faster response times → Higher user satisfaction → Increased conversions',
      security:
        'Reduced vulnerabilities → Lower incident costs → Better reputation',
      quality:
        'Cleaner code → Faster feature delivery → More revenue opportunities',
      maintainability:
        'Easier updates → Lower dev costs → Higher profit margins',
    };

    return (
      implications[improvement.type] ||
      'Positive impact on overall system value'
    );
  }

  private extractCompetitiveAdvantage(text: string): string {
    if (text.includes('unique') || text.includes('differentiat')) {
      return 'Strong market differentiation';
    }
    if (text.includes('faster') || text.includes('better')) {
      return 'Performance advantage over competitors';
    }
    return 'Incremental competitive improvement';
  }

  private extractMarketDifferentiation(text: string): string {
    return 'Enhanced user experience and reliability';
  }

  private generateFallbackRevenueImpact(qualityScore: number): RevenueImpact {
    const baseRevenue = 1000 + qualityScore * 10;

    return {
      revenuePerRequest: 0.05,
      requestsPerDay: 1000,
      estimatedDailyRevenue: baseRevenue / 30,
      estimatedMonthlyRevenue: baseRevenue,
      estimatedAnnualRevenue: baseRevenue * 12,
      revenueIncrease: qualityScore / 10,
      revenueIncreaseAmount: baseRevenue * 0.1,
      userSatisfactionScore: qualityScore,
      expectedUserRetention: 85,
      expectedChurnReduction: 5,
      costPerRequest: 0.015,
      profitMargin: 70,
      roiMultiplier: 1.2,
      competitiveAdvantage: 'Standard improvement',
      marketDifferentiation: 'Quality enhancement',
      pricingPower: 60,
    };
  }
}
