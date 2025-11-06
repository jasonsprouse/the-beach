import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  VRCodeMarketplaceService,
  CodeProduct,
  Purchase,
} from './vr-code-marketplace.service';

/**
 * VR Code Marketplace Controller
 *
 * REST API for buying and selling NPE code packages
 * VR Experience: /vr-marketplace.html
 * Marketing Videos: goodfaith.church/post
 */

@Controller('marketplace')
export class VRCodeMarketplaceController {
  constructor(private readonly marketplaceService: VRCodeMarketplaceService) {}

  /**
   * GET /marketplace/products
   * Get all products or filter by category
   */
  @Get('products')
  getProducts(@Query('category') category?: CodeProduct['category']) {
    if (category) {
      return {
        success: true,
        products: this.marketplaceService.getProductsByCategory(category),
      };
    }

    return {
      success: true,
      products: this.marketplaceService.getAllProducts(),
    };
  }

  /**
   * GET /marketplace/products/:id
   * Get product details
   */
  @Get('products/:id')
  getProduct(@Param('id') productId: string) {
    const product = this.marketplaceService.getProduct(productId);

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    return {
      success: true,
      product,
    };
  }

  /**
   * POST /marketplace/purchase
   * Create a purchase (Stripe checkout)
   */
  @Post('purchase')
  async createPurchase(
    @Body()
    data: {
      productId: string;
      tier: 'starter' | 'professional' | 'enterprise';
      customerId: string;
      customerEmail: string;
      paymentMethod?: 'stripe' | 'crypto' | 'pkp-wallet';
    },
  ) {
    try {
      const result = await this.marketplaceService.createPurchase({
        ...data,
        paymentMethod: data.paymentMethod || 'stripe',
      });

      return {
        success: true,
        checkoutUrl: result.checkoutUrl,
        purchaseId: result.purchaseId,
        message: 'Redirect to checkout',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * POST /marketplace/webhook/stripe
   * Stripe webhook for payment completion
   */
  @Post('webhook/stripe')
  async stripeWebhook(
    @Body()
    data: {
      purchaseId: string;
      transactionId: string;
      status: 'success' | 'failed';
    },
  ) {
    if (data.status !== 'success') {
      return {
        success: false,
        error: 'Payment failed',
      };
    }

    try {
      const purchase = await this.marketplaceService.completePurchase(
        data.purchaseId,
        data.transactionId,
      );

      return {
        success: true,
        purchase,
        message: 'Purchase completed! Check your email for license key.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * POST /marketplace/license/validate
   * Validate license key
   */
  @Post('license/validate')
  validateLicense(@Body() data: { licenseKey: string; activationId?: string }) {
    const validation = this.marketplaceService.validateLicense(
      data.licenseKey,
      data.activationId,
    );

    return {
      success: validation.valid,
      ...validation,
    };
  }

  /**
   * POST /marketplace/license/activate
   * Activate license on a new machine
   */
  @Post('license/activate')
  async activateLicense(
    @Body() data: { licenseKey: string; activationId: string },
  ) {
    try {
      await this.marketplaceService.activateLicense(
        data.licenseKey,
        data.activationId,
      );

      return {
        success: true,
        message: 'License activated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * GET /marketplace/vr/scene
   * Get VR marketplace scene data
   */
  @Get('vr/scene')
  getVRScene() {
    return {
      success: true,
      scene: this.marketplaceService.getVRMarketplaceScene(),
    };
  }

  /**
   * GET /marketplace/analytics
   * Get marketplace analytics
   */
  @Get('analytics')
  getAnalytics() {
    return {
      success: true,
      analytics: this.marketplaceService.getMarketplaceAnalytics(),
    };
  }

  /**
   * GET /marketplace/demo/purchase-flow
   * Demo: Complete purchase flow
   */
  @Get('demo/purchase-flow')
  async demoPurchaseFlow() {
    console.log('\n🛒 VR Code Marketplace - Purchase Flow Demo\n');

    // Step 1: Browse products
    const products = this.marketplaceService.getAllProducts();
    console.log(`📦 Available Products: ${products.length}`);
    products.forEach((p) => {
      console.log(
        `  - ${p.name}: $${p.pricing.professional} (${p.linesOfCode} lines)`,
      );
    });

    // Step 2: Select product
    const selectedProduct = products.find(
      (p) => p.id === 'freemium-digital-agents',
    );
    console.log(`\n✅ Selected: ${selectedProduct?.name}`);
    console.log(`   Price: $${selectedProduct?.pricing.professional}`);
    console.log(`   Video: ${selectedProduct?.videoUrl}`);

    // Step 3: Create purchase
    const purchase = await this.marketplaceService.createPurchase({
      productId: 'freemium-digital-agents',
      tier: 'professional',
      customerId: 'demo-customer',
      customerEmail: 'demo@example.com',
      paymentMethod: 'stripe',
    });

    console.log(`\n💳 Checkout URL: ${purchase.checkoutUrl}`);
    console.log(`   Purchase ID: ${purchase.purchaseId}`);

    // Step 4: Complete purchase (simulate webhook)
    const completed = await this.marketplaceService.completePurchase(
      purchase.purchaseId,
      'txn-demo-123',
    );

    console.log(`\n✅ Purchase Completed!`);
    console.log(`   License Key: ${completed.licenseKey}`);
    console.log(`   Download: ${completed.downloadUrl}`);
    console.log(`   Max Activations: ${completed.maxActivations}`);

    // Step 5: Validate license
    const validation = this.marketplaceService.validateLicense(
      completed.licenseKey,
    );
    console.log(
      `\n🔐 License Validation: ${validation.valid ? 'VALID' : 'INVALID'}`,
    );

    // Step 6: Activate license
    await this.marketplaceService.activateLicense(
      completed.licenseKey,
      'machine-demo-001',
    );
    console.log(`   Activated on machine: machine-demo-001`);

    // Step 7: Get analytics
    const analytics = this.marketplaceService.getMarketplaceAnalytics();
    console.log(`\n📊 Marketplace Analytics:`);
    console.log(`   Total Revenue: $${analytics.overview.totalRevenue}`);
    console.log(`   Total Sales: ${analytics.overview.totalSales}`);
    console.log(
      `   Avg Order Value: $${analytics.overview.avgOrderValue.toFixed(2)}`,
    );

    return {
      success: true,
      message: 'Demo completed! Check console for details.',
      purchase: completed,
      analytics,
    };
  }

  /**
   * GET /marketplace/demo/vr-experience
   * Demo: VR marketplace experience guide
   */
  @Get('demo/vr-experience')
  demoVRExperience() {
    const scene = this.marketplaceService.getVRMarketplaceScene();

    console.log('\n🥽 VR Code Marketplace Experience\n');
    console.log('Environment:');
    console.log(`  - Skybox: ${scene.environment.skybox}`);
    console.log(`  - Lighting: ${scene.environment.lighting}`);
    console.log(`  - Floor: ${scene.environment.floor}`);
    console.log(`  - Music: ${scene.environment.music}`);

    console.log(`\n📦 Products (${scene.products.length}):`);
    scene.products.forEach((p) => {
      console.log(`  - ${p.name}`);
      console.log(
        `    Position: (${p.position.x}, ${p.position.y}, ${p.position.z})`,
      );
      console.log(`    Display: ${p.displayModel}`);
      console.log(`    Video: ${p.videoUrl}`);
      console.log(`    Price: $${p.pricing.professional}`);
    });

    console.log(`\n🎮 Interactive Elements:`);
    scene.interactiveElements.forEach((el) => {
      console.log(`  - ${el.type}: ${el.content}`);
    });

    console.log(`\n🚶 Teleport Points:`);
    scene.navigation.teleportPoints.forEach((tp) => {
      console.log(
        `  - ${tp.name}: (${tp.position.x}, ${tp.position.y}, ${tp.position.z})`,
      );
    });

    console.log('\n📺 Marketing Videos:');
    console.log('   All videos from: goodfaith.church/post');

    console.log('\n🎯 How to Experience:');
    console.log('   1. Open: http://localhost:3000/vr-marketplace.html');
    console.log('   2. Walk around with WASD keys');
    console.log('   3. Click products to view details');
    console.log('   4. Click "Enter VR" for immersive mode');
    console.log('   5. Use VR controllers to teleport');
    console.log('   6. Purchase products directly in VR!');

    return {
      success: true,
      scene,
      vrUrl: 'http://localhost:3000/vr-marketplace.html',
      marketingVideos: 'https://goodfaith.church/post',
    };
  }

  /**
   * GET /marketplace/pricing/comparison
   * Get pricing comparison table
   */
  @Get('pricing/comparison')
  getPricingComparison() {
    const products = this.marketplaceService.getAllProducts();

    const comparison = products.map((product) => ({
      product: product.name,
      category: product.category,
      tiers: {
        starter: {
          price: product.pricing.starter,
          includes: {
            sourceCode: product.includes.sourceCode,
            support: product.includes.support,
            updates: product.includes.updates,
          },
        },
        professional: {
          price: product.pricing.professional,
          includes: {
            sourceCode: product.includes.sourceCode,
            support: product.includes.support,
            updates: product.includes.updates,
          },
        },
        enterprise: {
          price: product.pricing.enterprise,
          includes: {
            sourceCode: product.includes.sourceCode,
            support: product.includes.support,
            updates: product.includes.updates,
            whiteLabel: product.includes.whiteLabel,
          },
        },
      },
      linesOfCode: product.linesOfCode,
      videoUrl: product.videoUrl,
    }));

    return {
      success: true,
      comparison,
    };
  }
}
