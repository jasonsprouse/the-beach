import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AIAgentService } from './services/ai-agent.service';

/**
 * Log Data Quality Score
 */
export interface LogDataQuality {
  completeness: number; // 0-100
  relevance: number; // 0-100
  actionability: number; // 0-100
  uniqueness: number; // 0-100
  overall: number; // 0-100
}

/**
 * Log Entry Analysis
 */
export interface LogAnalysis {
  id: string;
  timestamp: Date;
  source: string; // Which pipeline stage
  logContent: string;

  // AI Analysis
  aiInsights: {
    errorPatterns: string[];
    performanceIssues: string[];
    securityConcerns: string[];
    improvementOpportunities: string[];
    learningValue: number; // 0-100
  };

  // Data Quality
  quality: LogDataQuality;

  // Value Assessment
  valueScore: number; // 0-100 (how valuable is this data)
  paymentAmount: number; // $ to pay for this log data

  // Improvement Impact
  improvementPotential: {
    developmentSpeed: number; // % improvement
    codeQuality: number; // % improvement
    errorReduction: number; // % improvement
    estimatedROI: number; // $ return on investment
  };

  // Payment Status
  paid: boolean;
  paidAt?: Date;
  paidTo?: string; // Sub-PKP that generated the log
}

/**
 * Pipeline Monitoring Agent
 */
export interface PipelineMonitoringAgent {
  id: string;
  name: string;
  monitoredStages: string[]; // build, test, deploy, runtime
  active: boolean;

  // Performance
  logsAnalyzed: number;
  insightsGenerated: number;
  moneyPaid: number;

  // Specialization
  expertise: 'errors' | 'performance' | 'security' | 'quality' | 'all';

  // Learning
  aiModel: string;
  trainingData: number; // MB of training data collected
  accuracy: number; // % prediction accuracy
}

/**
 * Data Marketplace Transaction
 */
export interface DataTransaction {
  id: string;
  timestamp: Date;
  logAnalysisId: string;
  seller: string; // Sub-PKP that generated valuable logs
  buyer: string; // System or other Sub-PKPs
  dataType:
    | 'error-pattern'
    | 'performance-metric'
    | 'security-insight'
    | 'quality-data';
  price: number;
  qualityScore: number;
  status: 'pending' | 'completed' | 'disputed';
}

/**
 * Log Data Marketplace Service
 *
 * AI agents monitor software pipeline logs, extract valuable data,
 * and pay for high-quality insights to improve NPE PKP development.
 */
@Injectable()
export class LogDataMarketplaceService {
  private readonly logger = new Logger(LogDataMarketplaceService.name);

  // Monitoring agents
  private monitoringAgents = new Map<string, PipelineMonitoringAgent>();

  // Log analyses
  private logAnalyses = new Map<string, LogAnalysis>();

  // Transactions
  private transactions = new Map<string, DataTransaction>();

  // Revenue tracking
  private totalPaid = 0;
  private totalInsights = 0;

  // Pricing model
  private pricingRules = {
    basePrice: 0.1, // $0.10 per log entry
    qualityMultiplier: 0.01, // $0.01 per quality point
    uniquenessBonus: 0.5, // $0.50 for unique insights
    criticalErrorBonus: 5.0, // $5.00 for critical error detection
    securityBonus: 10.0, // $10.00 for security vulnerabilities
    performanceBonus: 2.0, // $2.00 for performance insights
  };

  constructor(
    private readonly aiService: AIAgentService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('💰 Log Data Marketplace Service initialized');
    this.setupMonitoringAgents();
  }

  /**
   * Setup default monitoring agents
   */
  private setupMonitoringAgents(): void {
    // Error monitoring agent
    this.createMonitoringAgent({
      name: 'Error Detective',
      monitoredStages: ['build', 'test', 'deploy', 'runtime'],
      expertise: 'errors',
      aiModel: 'gpt-4-turbo',
    });

    // Performance monitoring agent
    this.createMonitoringAgent({
      name: 'Performance Analyzer',
      monitoredStages: ['build', 'runtime'],
      expertise: 'performance',
      aiModel: 'gpt-4-turbo',
    });

    // Security monitoring agent
    this.createMonitoringAgent({
      name: 'Security Guardian',
      monitoredStages: ['build', 'test', 'deploy', 'runtime'],
      expertise: 'security',
      aiModel: 'gpt-4-turbo',
    });

    // Quality monitoring agent
    this.createMonitoringAgent({
      name: 'Quality Inspector',
      monitoredStages: ['test', 'deploy'],
      expertise: 'quality',
      aiModel: 'gpt-4-turbo',
    });
  }

  /**
   * Create monitoring agent
   */
  private createMonitoringAgent(params: {
    name: string;
    monitoredStages: string[];
    expertise: PipelineMonitoringAgent['expertise'];
    aiModel: string;
  }): PipelineMonitoringAgent {
    const agent: PipelineMonitoringAgent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: params.name,
      monitoredStages: params.monitoredStages,
      active: true,
      logsAnalyzed: 0,
      insightsGenerated: 0,
      moneyPaid: 0,
      expertise: params.expertise,
      aiModel: params.aiModel,
      trainingData: 0,
      accuracy: 85, // Start at 85% accuracy
    };

    this.monitoringAgents.set(agent.id, agent);
    this.logger.log(`🤖 Created monitoring agent: ${agent.name}`);

    return agent;
  }

  /**
   * Analyze log entry with AI
   */
  async analyzeLogEntry(params: {
    source: string; // Pipeline stage
    logContent: string;
    subPKPId?: string; // Optional: who generated this log
  }): Promise<LogAnalysis> {
    const startTime = Date.now();
    const analysisId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.logger.log(`📊 Analyzing log from ${params.source}`);

    // Find best agent for this analysis
    const agent = this.selectBestAgent(params.source);
    if (agent) {
      agent.logsAnalyzed++;
    }

    // Use AI to extract insights
    const aiInsights = await this.extractInsights(
      params.logContent,
      params.source,
    );

    // Assess data quality
    const quality = this.assessDataQuality(params.logContent, aiInsights);

    // Calculate value score
    const valueScore = this.calculateValueScore(quality, aiInsights);

    // Calculate payment amount
    const paymentAmount = this.calculatePayment(
      valueScore,
      quality,
      aiInsights,
    );

    // Estimate improvement potential
    const improvementPotential = this.estimateImprovementPotential(
      aiInsights,
      quality,
    );

    const analysis: LogAnalysis = {
      id: analysisId,
      timestamp: new Date(),
      source: params.source,
      logContent: params.logContent,
      aiInsights,
      quality,
      valueScore,
      paymentAmount,
      improvementPotential,
      paid: false,
    };

    // Store analysis
    this.logAnalyses.set(analysisId, analysis);

    // Update agent stats
    if (agent && aiInsights.learningValue > 50) {
      agent.insightsGenerated++;
    }

    this.logger.log(
      `✅ Log analyzed: Value=${valueScore}/100, Payment=$${paymentAmount.toFixed(2)}`,
    );

    // Emit event
    this.eventEmitter.emit('log.analyzed', {
      analysisId,
      source: params.source,
      valueScore,
      paymentAmount,
      subPKPId: params.subPKPId,
      timestamp: new Date(),
    });

    // Auto-pay if valuable enough
    if (valueScore >= 70 && params.subPKPId) {
      await this.payForLogData(analysisId, params.subPKPId);
    }

    return analysis;
  }

  /**
   * Extract AI insights from log
   */
  private async extractInsights(
    logContent: string,
    source: string,
  ): Promise<LogAnalysis['aiInsights']> {
    try {
      const prompt = `Analyze this ${source} pipeline log and extract actionable insights:

LOG:
${logContent}

Identify:
1. Error patterns (what types of errors, root causes)
2. Performance issues (slow builds, bottlenecks, inefficiencies)
3. Security concerns (vulnerabilities, unsafe practices)
4. Improvement opportunities (how to make pipeline better)
5. Learning value (0-100: how valuable is this data for AI training)

Be specific and actionable. Focus on insights that can improve NPE PKP development.`;

      const result = await this.aiService.answerQuestion({
        question: prompt,
        context: 'Pipeline log analysis',
      });

      // Parse AI response (in production, use structured output)
      const errorPatterns = this.extractSection(result.answer, 'error');
      const performanceIssues = this.extractSection(
        result.answer,
        'performance',
      );
      const securityConcerns = this.extractSection(result.answer, 'security');
      const improvementOpportunities = this.extractSection(
        result.answer,
        'improvement',
      );
      const learningValue = this.extractNumber(
        result.answer,
        'learning value',
        60,
      );

      return {
        errorPatterns,
        performanceIssues,
        securityConcerns,
        improvementOpportunities,
        learningValue: Math.min(100, Math.max(0, learningValue)),
      };
    } catch (error) {
      this.logger.error(`Failed to extract insights: ${error.message}`);

      // Fallback: basic pattern matching
      return {
        errorPatterns: this.detectErrorPatterns(logContent),
        performanceIssues: this.detectPerformanceIssues(logContent),
        securityConcerns: this.detectSecurityConcerns(logContent),
        improvementOpportunities: ['Review log for optimization opportunities'],
        learningValue: 30,
      };
    }
  }

  /**
   * Assess data quality
   */
  private assessDataQuality(
    logContent: string,
    aiInsights: LogAnalysis['aiInsights'],
  ): LogDataQuality {
    // Completeness: how much information is in the log
    const completeness = Math.min(100, (logContent.length / 1000) * 100);

    // Relevance: how relevant to development
    const relevance = this.calculateRelevance(aiInsights);

    // Actionability: can we act on this data
    const actionability = this.calculateActionability(aiInsights);

    // Uniqueness: is this new/unique data
    const uniqueness = this.calculateUniqueness(logContent, aiInsights);

    // Overall quality
    const overall = (completeness + relevance + actionability + uniqueness) / 4;

    return {
      completeness: Math.round(completeness),
      relevance: Math.round(relevance),
      actionability: Math.round(actionability),
      uniqueness: Math.round(uniqueness),
      overall: Math.round(overall),
    };
  }

  /**
   * Calculate value score
   */
  private calculateValueScore(
    quality: LogDataQuality,
    aiInsights: LogAnalysis['aiInsights'],
  ): number {
    let score = quality.overall;

    // Bonus for insights
    if (aiInsights.errorPatterns.length > 0) score += 10;
    if (aiInsights.performanceIssues.length > 0) score += 8;
    if (aiInsights.securityConcerns.length > 0) score += 15;
    if (aiInsights.improvementOpportunities.length > 0) score += 7;

    // Learning value bonus
    score += aiInsights.learningValue * 0.2;

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate payment for log data
   */
  private calculatePayment(
    valueScore: number,
    quality: LogDataQuality,
    aiInsights: LogAnalysis['aiInsights'],
  ): number {
    let payment = this.pricingRules.basePrice;

    // Quality-based pricing
    payment += quality.overall * this.pricingRules.qualityMultiplier;

    // Uniqueness bonus
    if (quality.uniqueness > 80) {
      payment += this.pricingRules.uniquenessBonus;
    }

    // Insight bonuses
    if (aiInsights.errorPatterns.some((e) => e.includes('critical'))) {
      payment += this.pricingRules.criticalErrorBonus;
    }

    if (aiInsights.securityConcerns.length > 0) {
      payment += this.pricingRules.securityBonus;
    }

    if (aiInsights.performanceIssues.length > 0) {
      payment += this.pricingRules.performanceBonus;
    }

    // Value multiplier
    payment *= valueScore / 100;

    return Math.round(payment * 100) / 100;
  }

  /**
   * Estimate improvement potential
   */
  private estimateImprovementPotential(
    aiInsights: LogAnalysis['aiInsights'],
    quality: LogDataQuality,
  ): LogAnalysis['improvementPotential'] {
    // Development speed improvement
    const developmentSpeed = Math.min(
      30,
      aiInsights.errorPatterns.length * 3 +
        aiInsights.improvementOpportunities.length * 2,
    );

    // Code quality improvement
    const codeQuality = Math.min(
      25,
      quality.overall / 5 + aiInsights.improvementOpportunities.length * 2,
    );

    // Error reduction
    const errorReduction = Math.min(40, aiInsights.errorPatterns.length * 5);

    // ROI estimation (conservative)
    const estimatedROI =
      developmentSpeed * 100 + // $100 per % speed improvement
      codeQuality * 200 + // $200 per % quality improvement
      errorReduction * 150; // $150 per % error reduction

    return {
      developmentSpeed: Math.round(developmentSpeed),
      codeQuality: Math.round(codeQuality),
      errorReduction: Math.round(errorReduction),
      estimatedROI: Math.round(estimatedROI),
    };
  }

  /**
   * Pay for log data
   */
  async payForLogData(
    logAnalysisId: string,
    recipientSubPKPId: string,
  ): Promise<DataTransaction> {
    const analysis = this.logAnalyses.get(logAnalysisId);
    if (!analysis) {
      throw new Error('Log analysis not found');
    }

    if (analysis.paid) {
      throw new Error('Log data already paid for');
    }

    // Create transaction
    const transaction: DataTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      logAnalysisId,
      seller: recipientSubPKPId,
      buyer: 'system',
      dataType: this.categorizeData(analysis.aiInsights),
      price: analysis.paymentAmount,
      qualityScore: analysis.quality.overall,
      status: 'completed',
    };

    // Store transaction
    this.transactions.set(transaction.id, transaction);

    // Mark as paid
    analysis.paid = true;
    analysis.paidAt = new Date();
    analysis.paidTo = recipientSubPKPId;

    // Update totals
    this.totalPaid += analysis.paymentAmount;
    this.totalInsights++;

    this.logger.log(
      `💰 Paid $${analysis.paymentAmount.toFixed(2)} to ${recipientSubPKPId} for log data`,
    );

    // Emit payment event
    this.eventEmitter.emit('log.payment', {
      transactionId: transaction.id,
      amount: analysis.paymentAmount,
      recipient: recipientSubPKPId,
      quality: analysis.quality.overall,
      valueScore: analysis.valueScore,
      timestamp: new Date(),
    });

    // Award game points for generating valuable logs
    this.awardLogGenerationPoints(recipientSubPKPId, analysis);

    return transaction;
  }

  /**
   * Award points for generating valuable logs
   */
  private awardLogGenerationPoints(
    subPKPId: string,
    analysis: LogAnalysis,
  ): void {
    // Calculate points based on data value
    let points = 10; // Base points

    // Quality bonus
    points += Math.floor(analysis.quality.overall / 10);

    // Value bonus
    points += Math.floor(analysis.valueScore / 5);

    // Payment bonus (big multiplier)
    points += Math.floor(analysis.paymentAmount * 2);

    // Improvement potential bonus
    points += Math.floor(analysis.improvementPotential.estimatedROI / 100);

    // Emit task completion for game manager
    this.eventEmitter.emit('task.completed', {
      subPKPId,
      success: true,
      duration: 60, // Assume 1 minute
      quality: analysis.quality.overall,
      taskType: 'log-generation',
    });

    // Emit innovation for high-value data
    if (analysis.valueScore >= 80) {
      this.eventEmitter.emit('innovation.detected', {
        subPKPId,
        innovation: `Generated high-value log data worth $${analysis.paymentAmount.toFixed(2)}`,
        impact: Math.min(100, analysis.valueScore),
      });
    }

    this.logger.log(
      `🎮 Awarded ${points} points to ${subPKPId} for valuable log data`,
    );
  }

  /**
   * Get marketplace dashboard
   */
  getMarketplaceDashboard(): {
    totalPaid: number;
    totalInsights: number;
    averagePayment: number;
    topDataSellers: Array<{ subPKPId: string; earnings: number; logs: number }>;
    monitoringAgents: PipelineMonitoringAgent[];
    recentTransactions: DataTransaction[];
    qualityTrends: {
      averageQuality: number;
      averageValue: number;
      averageROI: number;
    };
  } {
    const transactions = Array.from(this.transactions.values());
    const analyses = Array.from(this.logAnalyses.values());

    // Calculate top sellers
    const sellerStats = new Map<string, { earnings: number; logs: number }>();
    transactions.forEach((tx) => {
      const stats = sellerStats.get(tx.seller) || { earnings: 0, logs: 0 };
      stats.earnings += tx.price;
      stats.logs++;
      sellerStats.set(tx.seller, stats);
    });

    const topDataSellers = Array.from(sellerStats.entries())
      .map(([subPKPId, stats]) => ({ subPKPId, ...stats }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10);

    // Quality trends
    const averageQuality =
      analyses.length > 0
        ? analyses.reduce((sum, a) => sum + a.quality.overall, 0) /
          analyses.length
        : 0;

    const averageValue =
      analyses.length > 0
        ? analyses.reduce((sum, a) => sum + a.valueScore, 0) / analyses.length
        : 0;

    const averageROI =
      analyses.length > 0
        ? analyses.reduce(
            (sum, a) => sum + a.improvementPotential.estimatedROI,
            0,
          ) / analyses.length
        : 0;

    return {
      totalPaid: Math.round(this.totalPaid * 100) / 100,
      totalInsights: this.totalInsights,
      averagePayment:
        transactions.length > 0
          ? Math.round((this.totalPaid / transactions.length) * 100) / 100
          : 0,
      topDataSellers,
      monitoringAgents: Array.from(this.monitoringAgents.values()),
      recentTransactions: transactions.slice(-20),
      qualityTrends: {
        averageQuality: Math.round(averageQuality),
        averageValue: Math.round(averageValue),
        averageROI: Math.round(averageROI),
      },
    };
  }

  /**
   * Get log analyses for a Sub-PKP
   */
  getSubPKPLogAnalyses(subPKPId: string): LogAnalysis[] {
    return Array.from(this.logAnalyses.values())
      .filter((a) => a.paidTo === subPKPId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Helper methods

  private selectBestAgent(source: string): PipelineMonitoringAgent | null {
    const agents = Array.from(this.monitoringAgents.values())
      .filter((a) => a.active && a.monitoredStages.includes(source))
      .sort((a, b) => b.accuracy - a.accuracy);

    return agents[0] || null;
  }

  private extractSection(text: string, keyword: string): string[] {
    const lines = text.split('\n');
    const results: string[] = [];

    for (const line of lines) {
      if (line.toLowerCase().includes(keyword)) {
        const cleaned = line.replace(/^[-*•]\s*/, '').trim();
        if (cleaned) results.push(cleaned);
      }
    }

    return results.slice(0, 10); // Max 10 items
  }

  private extractNumber(
    text: string,
    keyword: string,
    defaultValue: number,
  ): number {
    const regex = new RegExp(`${keyword}[^\\d]*(\\d+)`, 'i');
    const match = text.match(regex);
    return match ? parseInt(match[1], 10) : defaultValue;
  }

  private detectErrorPatterns(log: string): string[] {
    const patterns: string[] = [];

    if (log.match(/error|exception|failed|failure/i)) {
      patterns.push('Error or exception detected');
    }
    if (log.match(/timeout|timed out/i)) {
      patterns.push('Timeout issue detected');
    }
    if (log.match(/memory|out of memory/i)) {
      patterns.push('Memory issue detected');
    }

    return patterns;
  }

  private detectPerformanceIssues(log: string): string[] {
    const issues: string[] = [];

    if (log.match(/slow|performance|bottleneck/i)) {
      issues.push('Performance degradation detected');
    }
    if (log.match(/\d{4,}ms|\d+\.\d+s/)) {
      issues.push('Long execution time detected');
    }

    return issues;
  }

  private detectSecurityConcerns(log: string): string[] {
    const concerns: string[] = [];

    if (log.match(/unauthorized|forbidden|denied/i)) {
      concerns.push('Access control issue detected');
    }
    if (log.match(/vulnerability|exploit|injection/i)) {
      concerns.push('Security vulnerability detected');
    }

    return concerns;
  }

  private calculateRelevance(aiInsights: LogAnalysis['aiInsights']): number {
    let relevance = 50;

    relevance += aiInsights.errorPatterns.length * 10;
    relevance += aiInsights.performanceIssues.length * 8;
    relevance += aiInsights.securityConcerns.length * 12;
    relevance += aiInsights.improvementOpportunities.length * 5;

    return Math.min(100, relevance);
  }

  private calculateActionability(
    aiInsights: LogAnalysis['aiInsights'],
  ): number {
    let actionability = 40;

    actionability += aiInsights.improvementOpportunities.length * 15;
    actionability += aiInsights.errorPatterns.length * 10;

    return Math.min(100, actionability);
  }

  private calculateUniqueness(
    logContent: string,
    aiInsights: LogAnalysis['aiInsights'],
  ): number {
    // Check if we've seen similar logs
    const existingAnalyses = Array.from(this.logAnalyses.values());

    let uniqueness = 100;

    for (const existing of existingAnalyses.slice(-100)) {
      if (this.calculateSimilarity(logContent, existing.logContent) > 0.8) {
        uniqueness -= 20;
      }
    }

    return Math.max(0, uniqueness);
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private categorizeData(
    aiInsights: LogAnalysis['aiInsights'],
  ): DataTransaction['dataType'] {
    if (aiInsights.securityConcerns.length > 0) return 'security-insight';
    if (aiInsights.performanceIssues.length > 0) return 'performance-metric';
    if (aiInsights.errorPatterns.length > 0) return 'error-pattern';
    return 'quality-data';
  }
}
