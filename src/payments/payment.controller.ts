import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { WebPaymentService } from './web-payment.service';
import { BiometricVerificationService } from '../biometric/biometric-verification.service';

/**
 * Payment Controller
 * 
 * Handles all payment operations with biometric verification
 */
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly webPaymentService: WebPaymentService,
    private readonly biometricService: BiometricVerificationService,
  ) {}

  /**
   * Request payment
   * POST /payments/request
   * 
   * Example:
   * {
   *   "pkpAddress": "0x1234...",
   *   "amount": 19.99,
   *   "description": "Premium tier upgrade",
   *   "biometricToken": "bio_..."
   * }
   */
  @Post('request')
  async requestPayment(
    @Body()
    body: {
      pkpAddress: string;
      amount: number;
      description: string;
      biometricToken: string;
      metadata?: Record<string, any>;
    },
  ) {
    this.logger.log(`💳 Payment request: $${body.amount} - ${body.description}`);

    const payment = await this.webPaymentService.requestPayment(body);

    return {
      success: true,
      payment,
    };
  }

  /**
   * Charge immediately
   * POST /payments/charge
   * 
   * Example:
   * {
   *   "pkpAddress": "0x1234...",
   *   "amount": 9.99,
   *   "description": "Code package purchase",
   *   "biometricToken": "bio_..."
   * }
   */
  @Post('charge')
  async charge(
    @Body()
    body: {
      pkpAddress: string;
      amount: number;
      description: string;
      biometricToken: string;
    },
  ) {
    this.logger.log(`💳 Charging: $${body.amount} - ${body.description}`);

    const payment = await this.webPaymentService.charge(body);

    return {
      success: true,
      payment,
    };
  }

  /**
   * Create subscription
   * POST /payments/subscription
   * 
   * Example:
   * {
   *   "pkpAddress": "0x1234...",
   *   "amount": 4.99,
   *   "interval": "monthly",
   *   "biometricToken": "bio_..."
   * }
   */
  @Post('subscription')
  async createSubscription(
    @Body()
    body: {
      pkpAddress: string;
      amount: number;
      interval: 'monthly' | 'annual';
      biometricToken: string;
    },
  ) {
    this.logger.log(
      `🔄 Subscription: $${body.amount}/${body.interval} for PKP ${body.pkpAddress}`,
    );

    const subscription = await this.webPaymentService.createSubscription(body);

    return {
      success: true,
      subscription,
    };
  }

  /**
   * Authorize payment (pre-auth)
   * POST /payments/authorize
   * 
   * Example:
   * {
   *   "pkpAddress": "0x1234...",
   *   "amount": 50.00,
   *   "hold": true,
   *   "biometricToken": "bio_..."
   * }
   */
  @Post('authorize')
  async authorize(
    @Body()
    body: {
      pkpAddress: string;
      amount: number;
      hold: boolean;
      biometricToken: string;
    },
  ) {
    this.logger.log(`🔒 Payment authorization: $${body.amount} (hold: ${body.hold})`);

    const payment = await this.webPaymentService.authorize(body);

    return {
      success: true,
      payment,
    };
  }

  /**
   * Capture authorized payment
   * POST /payments/:paymentId/capture
   */
  @Post(':paymentId/capture')
  async capture(@Param('paymentId') paymentId: string) {
    this.logger.log(`✅ Capturing payment: ${paymentId}`);

    const payment = await this.webPaymentService.capture(paymentId);

    return {
      success: true,
      payment,
    };
  }

  /**
   * Create escrow
   * POST /payments/escrow
   * 
   * Example:
   * {
   *   "pkpAddress": "0x1234...",
   *   "amount": 100.00,
   *   "releaseCondition": "agent_work_complete",
   *   "biometricToken": "bio_..."
   * }
   */
  @Post('escrow')
  async createEscrow(
    @Body()
    body: {
      pkpAddress: string;
      amount: number;
      releaseCondition: string;
      biometricToken: string;
    },
  ) {
    this.logger.log(`🔒 Escrow: $${body.amount} (condition: ${body.releaseCondition})`);

    const escrow = await this.webPaymentService.createEscrow(body);

    return {
      success: true,
      escrow,
    };
  }

  /**
   * Release escrow
   * POST /payments/escrow/:escrowId/release
   */
  @Post('escrow/:escrowId/release')
  async releaseEscrow(@Param('escrowId') escrowId: string) {
    this.logger.log(`💰 Releasing escrow: ${escrowId}`);

    const escrow = await this.webPaymentService.releaseEscrow(escrowId);

    return {
      success: true,
      escrow,
    };
  }

  /**
   * VR payment request
   * POST /payments/vr
   * 
   * Example:
   * {
   *   "pkpAddress": "0x1234...",
   *   "amount": 29.99,
   *   "biometricToken": "spatial_bio_..." // From VR spatial biometric
   * }
   */
  @Post('vr')
  async requestVRPayment(
    @Body()
    body: {
      pkpAddress: string;
      amount: number;
      biometricToken: string;
    },
  ) {
    this.logger.log(`🥽 VR payment: $${body.amount} for PKP ${body.pkpAddress}`);

    const payment = await this.webPaymentService.requestVRPayment(body);

    return {
      success: true,
      payment,
    };
  }

  /**
   * Annual contract
   * POST /payments/contract
   * 
   * Example:
   * {
   *   "pkpAddress": "0x1234...",
   *   "amount": 300.00,
   *   "contractType": "white-label",
   *   "biometricToken": "enterprise_bio_..."
   * }
   */
  @Post('contract')
  async createAnnualContract(
    @Body()
    body: {
      pkpAddress: string;
      amount: number;
      contractType: string;
      biometricToken: string;
    },
  ) {
    this.logger.log(`📜 Annual contract: ${body.contractType} - $${body.amount}/year`);

    const payment = await this.webPaymentService.createAnnualContract(body);

    return {
      success: true,
      payment,
    };
  }

  /**
   * Refund payment
   * POST /payments/:paymentId/refund
   * 
   * Example:
   * {
   *   "reason": "Customer request"
   * }
   */
  @Post(':paymentId/refund')
  async refund(
    @Param('paymentId') paymentId: string,
    @Body() body: { reason: string },
  ) {
    this.logger.log(`↩️  Refunding payment: ${paymentId} (${body.reason})`);

    const payment = await this.webPaymentService.refund(paymentId, body.reason);

    return {
      success: true,
      payment,
    };
  }

  /**
   * Cancel subscription
   * POST /payments/subscription/:subscriptionId/cancel
   * 
   * Example:
   * {
   *   "immediate": false
   * }
   */
  @Post('subscription/:subscriptionId/cancel')
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { immediate?: boolean },
  ) {
    this.logger.log(`🚫 Canceling subscription: ${subscriptionId}`);

    const subscription = await this.webPaymentService.cancelSubscription(
      subscriptionId,
      body.immediate,
    );

    return {
      success: true,
      subscription,
    };
  }

  /**
   * Get payment
   * GET /payments/:paymentId
   */
  @Get(':paymentId')
  getPayment(@Param('paymentId') paymentId: string) {
    const payment = this.webPaymentService.getPayment(paymentId);

    return {
      success: true,
      payment,
    };
  }

  /**
   * Get payments for PKP
   * GET /payments/pkp/:pkpAddress
   */
  @Get('pkp/:pkpAddress')
  getPaymentsForPKP(@Param('pkpAddress') pkpAddress: string) {
    const payments = this.webPaymentService.getPaymentsForPKP(pkpAddress);

    return {
      success: true,
      payments,
      count: payments.length,
    };
  }

  /**
   * Get subscription
   * GET /payments/subscription/:subscriptionId
   */
  @Get('subscription/:subscriptionId')
  getSubscription(@Param('subscriptionId') subscriptionId: string) {
    const subscription = this.webPaymentService.getSubscription(subscriptionId);

    return {
      success: true,
      subscription,
    };
  }

  /**
   * Get subscriptions for PKP
   * GET /payments/subscriptions/pkp/:pkpAddress
   */
  @Get('subscriptions/pkp/:pkpAddress')
  getSubscriptionsForPKP(@Param('pkpAddress') pkpAddress: string) {
    const subscriptions = this.webPaymentService.getSubscriptionsForPKP(pkpAddress);

    return {
      success: true,
      subscriptions,
      count: subscriptions.length,
    };
  }

  /**
   * Get escrow
   * GET /payments/escrow/:escrowId
   */
  @Get('escrow/:escrowId')
  getEscrow(@Param('escrowId') escrowId: string) {
    const escrow = this.webPaymentService.getEscrow(escrowId);

    return {
      success: true,
      escrow,
    };
  }

  /**
   * Verify biometric and request payment
   * POST /payments/biometric-purchase
   * 
   * Combined endpoint that verifies biometric and creates payment in one call
   * 
   * Example:
   * {
   *   "pkpAddress": "0x1234...",
   *   "amount": 99.99,
   *   "description": "PKP purchase",
   *   "action": "purchase"
   * }
   */
  @Post('biometric-purchase')
  async biometricPurchase(
    @Body()
    body: {
      pkpAddress: string;
      amount: number;
      description: string;
      action: string;
    },
  ) {
    this.logger.log(`🔐 Biometric purchase: $${body.amount} - ${body.description}`);

    // Step 1: Verify biometric
    const biometric = await this.biometricService.verify({
      pkpAddress: body.pkpAddress,
      action: body.action,
      amount: body.amount,
    });

    if (!biometric.verified) {
      return {
        success: false,
        error: 'Biometric verification failed',
        biometric,
      };
    }

    // Step 2: Process payment with biometric token
    const payment = await this.webPaymentService.charge({
      pkpAddress: body.pkpAddress,
      amount: body.amount,
      description: body.description,
      biometricToken: biometric.token,
    });

    return {
      success: true,
      biometric,
      payment,
    };
  }
}
