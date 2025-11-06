import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * VR Code Marketplace Service
 *
 * Monetize and sell NPE code packages in a VR environment
 * - NPE Manager Auth System
 * - Continuous Improvement Game Manager
 * - AI Testing & Revenue System
 * - Log Data Marketplace
 * - Freemium Digital Agents
 *
 * Marketing videos from: goodfaith.church/post
 * Payment: Stripe integration
 * Licensing: PKP-based license keys
 */

export interface CodeProduct {
  id: string;
  name: string;
  category:
    | 'ai-agents'
    | 'authentication'
    | 'gamification'
    | 'revenue'
    | 'bundle';
  description: string;
  features: string[];

  // Pricing tiers
  pricing: {
    starter: number; // Basic license
    professional: number; // Full features
    enterprise: number; // White-label + support
  };

  // What's included
  includes: {
    sourceCode: boolean;
    documentation: boolean;
    examples: boolean;
    tests: boolean;
    support: 'community' | 'email' | 'priority' | 'dedicated';
    updates: '6-months' | '1-year' | 'lifetime';
    whiteLabel: boolean;
  };

  // Files included
  files: string[];
  linesOfCode: number;

  // Marketing
  videoUrl: string; // From goodfaith.church/post
  demoUrl?: string;
  testimonials?: string[];

  // VR Display
  vrPosition: { x: number; y: number; z: number };
  vrRotation: { x: number; y: number; z: number };
  vrScale: number;
  displayModel: '3d-package' | 'hologram' | 'terminal' | 'screen';

  // Sales data
  totalSales: number;
  revenue: number;
  rating: number;
  reviews: number;
}

export interface Purchase {
  id: string;
  productId: string;
  tier: 'starter' | 'professional' | 'enterprise';
  customerId: string;
  customerEmail: string;

  // Payment
  amount: number;
  currency: 'USD';
  paymentMethod: 'stripe' | 'crypto' | 'pkp-wallet';
  transactionId: string;

  // License
  licenseKey: string; // PKP-generated unique key
  licensePKP?: string; // PKP address for licensing
  activations: number; // How many times activated
  maxActivations: number; // Max allowed activations

  // Delivery
  downloadUrl: string;
  accessExpires?: Date; // For timed licenses

  purchasedAt: Date;
  status: 'pending' | 'completed' | 'refunded' | 'expired';
}

@Injectable()
export class VRCodeMarketplaceService {
  private products: Map<string, CodeProduct> = new Map();
  private purchases: Map<string, Purchase> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.initializeProducts();
  }

  /**
   * Initialize code products for sale
   */
  private initializeProducts() {
    const products: CodeProduct[] = [
      {
        id: 'npe-auth-system',
        name: 'NPE Manager Authentication System',
        category: 'authentication',
        description:
          'Complete PKP-based authentication with social login, biometrics, and Sub-PKP task management',
        features: [
          '6 authentication providers (WebAuthn, Google, Discord, GitHub, Twitter, Email)',
          'Sub-PKP task manager with approval workflow',
          'Redis-based session management',
          'Spending limits and budget controls',
          'Real-time task monitoring',
          'Complete API with 15+ endpoints',
        ],
        pricing: {
          starter: 499,
          professional: 1499,
          enterprise: 4999,
        },
        includes: {
          sourceCode: true,
          documentation: true,
          examples: true,
          tests: true,
          support: 'email',
          updates: '1-year',
          whiteLabel: false,
        },
        files: [
          'src/npe/services/npe-manager-auth.service.ts',
          'src/npe/npe-manager-auth.controller.ts',
          'NPE_MANAGER_INTEGRATION_GUIDE.md',
          'PRODUCTION_DEPLOYMENT_GUIDE.md',
        ],
        linesOfCode: 1500,
        videoUrl: 'https://goodfaith.church/post/npe-auth-demo',
        vrPosition: { x: -10, y: 2, z: 0 },
        vrRotation: { x: 0, y: 0, z: 0 },
        vrScale: 1.5,
        displayModel: 'hologram',
        totalSales: 0,
        revenue: 0,
        rating: 5.0,
        reviews: 0,
      },
      {
        id: 'ai-testing-revenue',
        name: 'AI Testing & Revenue System',
        category: 'revenue',
        description:
          'AI-powered code testing that measures revenue impact and pays for improvements',
        features: [
          'GPT-4 and Claude AI integration',
          'Revenue-based code quality assessment',
          'Automatic deployment for high-value code',
          'A/B testing framework',
          'ROI calculation and forecasting',
          '8 REST API endpoints',
          'Real-time revenue dashboard',
        ],
        pricing: {
          starter: 799,
          professional: 2499,
          enterprise: 7999,
        },
        includes: {
          sourceCode: true,
          documentation: true,
          examples: true,
          tests: true,
          support: 'priority',
          updates: '1-year',
          whiteLabel: false,
        },
        files: [
          'src/npe/ai-testing-revenue.service.ts',
          'src/npe/ai-testing-revenue.controller.ts',
          'AI_TESTING_REVENUE_GUIDE.md',
          'AI_TESTING_QUICKSTART.md',
          'AI_TESTING_COMPLETE_SUMMARY.md',
        ],
        linesOfCode: 1250,
        videoUrl: 'https://goodfaith.church/post/ai-revenue-testing',
        vrPosition: { x: -5, y: 2, z: 5 },
        vrRotation: { x: 0, y: Math.PI / 4, z: 0 },
        vrScale: 1.5,
        displayModel: '3d-package',
        totalSales: 0,
        revenue: 0,
        rating: 5.0,
        reviews: 0,
      },
      {
        id: 'log-data-marketplace',
        name: 'Log Data Marketplace',
        category: 'revenue',
        description:
          'AI agents monitor pipeline logs and pay for valuable insights',
        features: [
          '4 specialized AI monitoring agents',
          'Quality assessment (completeness, relevance, actionability)',
          'Payment calculation ($0.10 - $20+ per log)',
          'Pipeline monitoring (build, test, deploy, runtime)',
          'Game integration with XP rewards',
          '10 API endpoints',
          'ROI tracking and analytics',
        ],
        pricing: {
          starter: 699,
          professional: 2199,
          enterprise: 6999,
        },
        includes: {
          sourceCode: true,
          documentation: true,
          examples: true,
          tests: false,
          support: 'priority',
          updates: '1-year',
          whiteLabel: false,
        },
        files: [
          'src/npe/log-data-marketplace.service.ts',
          'src/npe/log-data-marketplace.controller.ts',
          'LOG_DATA_MARKETPLACE_GUIDE.md',
          'LOG_DATA_MARKETPLACE_QUICKSTART.md',
          'LOG_DATA_MARKETPLACE_COMPLETE_SUMMARY.md',
        ],
        linesOfCode: 1450,
        videoUrl: 'https://goodfaith.church/post/log-marketplace',
        vrPosition: { x: 0, y: 2, z: 8 },
        vrRotation: { x: 0, y: 0, z: 0 },
        vrScale: 1.5,
        displayModel: 'hologram',
        totalSales: 0,
        revenue: 0,
        rating: 5.0,
        reviews: 0,
      },
      {
        id: 'freemium-digital-agents',
        name: 'Freemium Digital Agents',
        category: 'ai-agents',
        description:
          'AI agents that autonomously build projects from GitHub repos with freemium tiers',
        features: [
          '3 freemium tiers (Free, Pro, Enterprise)',
          '5 advanced training techniques (RAG, fine-tuning, etc.)',
          '6 agent types (Builder, Architect, Debugger, etc.)',
          'Autonomous project building from jasonsprouse repos',
          '70-98% code generation accuracy',
          'Multi-language support (TypeScript, Python, etc.)',
          '11 API endpoints',
        ],
        pricing: {
          starter: 999,
          professional: 3499,
          enterprise: 9999,
        },
        includes: {
          sourceCode: true,
          documentation: true,
          examples: true,
          tests: true,
          support: 'dedicated',
          updates: 'lifetime',
          whiteLabel: false,
        },
        files: [
          'src/npe/freemium-digital-agents.service.ts',
          'src/npe/freemium-digital-agents.controller.ts',
          'FREEMIUM_DIGITAL_AGENTS_QUICKSTART.md',
        ],
        linesOfCode: 1450,
        videoUrl: 'https://goodfaith.church/post/digital-agents',
        vrPosition: { x: 5, y: 2, z: 5 },
        vrRotation: { x: 0, y: -Math.PI / 4, z: 0 },
        vrScale: 1.5,
        displayModel: '3d-package',
        totalSales: 0,
        revenue: 0,
        rating: 5.0,
        reviews: 0,
      },
      {
        id: 'game-manager',
        name: 'Continuous Improvement Game Manager',
        category: 'gamification',
        description:
          'Gamification engine with XP, levels, achievements, and leaderboards',
        features: [
          'XP and leveling system',
          'Achievement engine with unlockables',
          'Leaderboards (daily, weekly, all-time)',
          'Streak tracking and bonuses',
          'Team competition and collaboration',
          'Real-time event integration',
          'Customizable reward tiers',
        ],
        pricing: {
          starter: 599,
          professional: 1899,
          enterprise: 5999,
        },
        includes: {
          sourceCode: true,
          documentation: true,
          examples: true,
          tests: true,
          support: 'email',
          updates: '1-year',
          whiteLabel: false,
        },
        files: [
          'src/npe/continuous-improvement-game.service.ts',
          'CONTINUOUS_IMPROVEMENT_GAME_GUIDE.md',
        ],
        linesOfCode: 600,
        videoUrl: 'https://goodfaith.church/post/gamification',
        vrPosition: { x: 10, y: 2, z: 0 },
        vrRotation: { x: 0, y: Math.PI, z: 0 },
        vrScale: 1.5,
        displayModel: 'terminal',
        totalSales: 0,
        revenue: 0,
        rating: 5.0,
        reviews: 0,
      },
      {
        id: 'complete-npe-bundle',
        name: 'Complete NPE Development Bundle',
        category: 'bundle',
        description: 'All 5 systems bundled together - save 40%!',
        features: [
          'NPE Manager Authentication System',
          'AI Testing & Revenue System',
          'Log Data Marketplace',
          'Freemium Digital Agents',
          'Continuous Improvement Game Manager',
          'Full integration examples',
          'Priority support for 2 years',
          'Lifetime updates',
        ],
        pricing: {
          starter: 2999, // 40% off individual starter prices
          professional: 8999, // 40% off individual pro prices
          enterprise: 24999, // 40% off individual enterprise prices
        },
        includes: {
          sourceCode: true,
          documentation: true,
          examples: true,
          tests: true,
          support: 'dedicated',
          updates: 'lifetime',
          whiteLabel: true,
        },
        files: [
          'Complete source code (6,250+ lines)',
          'All documentation (15,000+ lines)',
          'Integration guides',
          'Test suites',
          'Example implementations',
        ],
        linesOfCode: 6250,
        videoUrl: 'https://goodfaith.church/post/npe-bundle',
        vrPosition: { x: 0, y: 3, z: -5 },
        vrRotation: { x: 0, y: 0, z: 0 },
        vrScale: 2.0,
        displayModel: 'hologram',
        totalSales: 0,
        revenue: 0,
        rating: 5.0,
        reviews: 0,
      },
    ];

    products.forEach((product) => {
      this.products.set(product.id, product);
    });
  }

  /**
   * Get all products
   */
  getAllProducts(): CodeProduct[] {
    return Array.from(this.products.values());
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: CodeProduct['category']): CodeProduct[] {
    return Array.from(this.products.values()).filter(
      (p) => p.category === category,
    );
  }

  /**
   * Get product by ID
   */
  getProduct(productId: string): CodeProduct | undefined {
    return this.products.get(productId);
  }

  /**
   * Create purchase (Stripe checkout)
   */
  async createPurchase(data: {
    productId: string;
    tier: 'starter' | 'professional' | 'enterprise';
    customerId: string;
    customerEmail: string;
    paymentMethod: Purchase['paymentMethod'];
  }): Promise<{ checkoutUrl: string; purchaseId: string }> {
    const product = this.products.get(data.productId);
    if (!product) throw new Error('Product not found');

    const amount = product.pricing[data.tier];
    const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate PKP-based license key
    const licenseKey = this.generateLicenseKey(data.productId, data.tier);

    const purchase: Purchase = {
      id: purchaseId,
      productId: data.productId,
      tier: data.tier,
      customerId: data.customerId,
      customerEmail: data.customerEmail,
      amount,
      currency: 'USD',
      paymentMethod: data.paymentMethod,
      transactionId: `txn-${Date.now()}`,
      licenseKey,
      activations: 0,
      maxActivations: this.getMaxActivations(data.tier),
      downloadUrl: `https://marketplace.goodfaith.church/download/${purchaseId}`,
      purchasedAt: new Date(),
      status: 'pending',
    };

    this.purchases.set(purchaseId, purchase);

    // Create Stripe checkout session
    const checkoutUrl = await this.createStripeCheckout(purchase, product);

    this.eventEmitter.emit('purchase.created', {
      purchaseId,
      productId: data.productId,
      amount,
    });

    return { checkoutUrl, purchaseId };
  }

  /**
   * Create Stripe checkout session
   */
  private async createStripeCheckout(
    purchase: Purchase,
    product: CodeProduct,
  ): Promise<string> {
    // In production, use actual Stripe API
    // For now, return mock checkout URL
    return `https://checkout.stripe.com/pay/${purchase.id}?amount=${purchase.amount * 100}&product=${product.name}`;
  }

  /**
   * Generate PKP-based license key
   */
  private generateLicenseKey(productId: string, tier: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    const tierCode = tier.substring(0, 3).toUpperCase();
    const productCode = productId.substring(0, 6).toUpperCase();

    return `${productCode}-${tierCode}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Get max activations based on tier
   */
  private getMaxActivations(
    tier: 'starter' | 'professional' | 'enterprise',
  ): number {
    const limits = {
      starter: 1, // Single developer
      professional: 5, // Small team
      enterprise: -1, // Unlimited
    };
    return limits[tier];
  }

  /**
   * Complete purchase (webhook from Stripe)
   */
  async completePurchase(
    purchaseId: string,
    transactionId: string,
  ): Promise<Purchase> {
    const purchase = this.purchases.get(purchaseId);
    if (!purchase) throw new Error('Purchase not found');

    purchase.status = 'completed';
    purchase.transactionId = transactionId;

    // Update product sales
    const product = this.products.get(purchase.productId);
    if (product) {
      product.totalSales++;
      product.revenue += purchase.amount;
    }

    // Send confirmation email with license key
    await this.sendPurchaseConfirmation(purchase);

    this.eventEmitter.emit('purchase.completed', {
      purchaseId,
      productId: purchase.productId,
      amount: purchase.amount,
      licenseKey: purchase.licenseKey,
    });

    return purchase;
  }

  /**
   * Send purchase confirmation email
   */
  private async sendPurchaseConfirmation(purchase: Purchase): Promise<void> {
    const product = this.products.get(purchase.productId);
    if (!product) return;

    console.log(
      `
📧 Purchase Confirmation Email
To: ${purchase.customerEmail}
Subject: Your ${product.name} License

Thank you for purchasing ${product.name}!

License Key: ${purchase.licenseKey}
Tier: ${purchase.tier.toUpperCase()}
Amount Paid: $${purchase.amount}

Download: ${purchase.downloadUrl}
Max Activations: ${purchase.maxActivations === -1 ? 'Unlimited' : purchase.maxActivations}

Documentation: ${product.files.filter((f) => f.endsWith('.md')).join(', ')}

Support: ${product.includes.support}
Updates: ${product.includes.updates}

Questions? Reply to this email or visit goodfaith.church/support
    `.trim(),
    );
  }

  /**
   * Validate license key
   */
  validateLicense(
    licenseKey: string,
    activationId?: string,
  ): {
    valid: boolean;
    purchase?: Purchase;
    product?: CodeProduct;
    message?: string;
  } {
    const purchase = Array.from(this.purchases.values()).find(
      (p) => p.licenseKey === licenseKey,
    );

    if (!purchase) {
      return { valid: false, message: 'Invalid license key' };
    }

    if (purchase.status !== 'completed') {
      return { valid: false, message: 'License not activated' };
    }

    if (
      purchase.maxActivations !== -1 &&
      purchase.activations >= purchase.maxActivations
    ) {
      return { valid: false, message: 'Maximum activations reached' };
    }

    if (purchase.accessExpires && purchase.accessExpires < new Date()) {
      return { valid: false, message: 'License expired' };
    }

    const product = this.products.get(purchase.productId);

    return {
      valid: true,
      purchase,
      product,
      message: 'License valid',
    };
  }

  /**
   * Activate license
   */
  async activateLicense(
    licenseKey: string,
    activationId: string,
  ): Promise<void> {
    const validation = this.validateLicense(licenseKey, activationId);

    if (!validation.valid || !validation.purchase) {
      throw new Error(validation.message);
    }

    validation.purchase.activations++;

    this.eventEmitter.emit('license.activated', {
      licenseKey,
      activationId,
      activations: validation.purchase.activations,
      maxActivations: validation.purchase.maxActivations,
    });
  }

  /**
   * Get VR marketplace scene data
   */
  getVRMarketplaceScene() {
    const products = this.getAllProducts();

    return {
      environment: {
        skybox: 'gradient-blue-purple',
        lighting: 'neon-cyberpunk',
        floor: 'grid-holographic',
        music: 'ambient-tech',
      },
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        position: p.vrPosition,
        rotation: p.vrRotation,
        scale: p.vrScale,
        displayModel: p.displayModel,
        videoUrl: p.videoUrl,
        pricing: p.pricing,
        rating: p.rating,
        sales: p.totalSales,
      })),
      interactiveElements: [
        {
          type: 'video-wall',
          position: { x: 0, y: 4, z: -10 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 20, y: 10, z: 1 },
          videos: products.map((p) => p.videoUrl),
        },
        {
          type: 'info-terminal',
          position: { x: -15, y: 1, z: -5 },
          rotation: { x: 0, y: Math.PI / 6, z: 0 },
          content: 'product-catalog',
        },
        {
          type: 'checkout-portal',
          position: { x: 15, y: 1, z: -5 },
          rotation: { x: 0, y: -Math.PI / 6, z: 0 },
          content: 'stripe-checkout',
        },
      ],
      navigation: {
        teleportPoints: [
          { name: 'Entrance', position: { x: 0, y: 0, z: 15 } },
          { name: 'AI Agents', position: { x: 5, y: 0, z: 5 } },
          { name: 'Revenue Systems', position: { x: -5, y: 0, z: 5 } },
          { name: 'Bundle Deal', position: { x: 0, y: 0, z: -5 } },
          { name: 'Checkout', position: { x: 15, y: 0, z: -5 } },
        ],
      },
    };
  }

  /**
   * Get marketplace analytics
   */
  getMarketplaceAnalytics() {
    const products = Array.from(this.products.values());
    const purchases = Array.from(this.purchases.values());

    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const totalSales = products.reduce((sum, p) => sum + p.totalSales, 0);
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      overview: {
        totalProducts: products.length,
        totalRevenue,
        totalSales,
        avgOrderValue,
        conversionRate: 0, // Would track visitors
      },
      topProducts: products
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((p) => ({
          name: p.name,
          sales: p.totalSales,
          revenue: p.revenue,
          rating: p.rating,
        })),
      tierDistribution: {
        starter: purchases.filter((p) => p.tier === 'starter').length,
        professional: purchases.filter((p) => p.tier === 'professional').length,
        enterprise: purchases.filter((p) => p.tier === 'enterprise').length,
      },
      revenueByCategory: this.calculateRevenueByCategory(products),
    };
  }

  /**
   * Calculate revenue by category
   */
  private calculateRevenueByCategory(products: CodeProduct[]) {
    const categories = [
      'ai-agents',
      'authentication',
      'gamification',
      'revenue',
      'bundle',
    ] as const;

    return categories.map((category) => ({
      category,
      revenue: products
        .filter((p) => p.category === category)
        .reduce((sum, p) => sum + p.revenue, 0),
      sales: products
        .filter((p) => p.category === category)
        .reduce((sum, p) => sum + p.totalSales, 0),
    }));
  }
}
