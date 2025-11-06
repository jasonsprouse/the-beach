import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BiometricVerificationService } from '../biometric/biometric-verification.service';

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

/**
 * Payment method types
 */
export enum PaymentMethodType {
  CARD = 'card',
  GOOGLE_PAY = 'google-pay',
  APPLE_PAY = 'apple-pay',
  SAMSUNG_PAY = 'samsung-pay',
  CRYPTO = 'crypto',
}

/**
 * Payment request
 */
export interface PaymentRequest {
  id: string;
  pkpAddress: string;
  amount: number;
  currency: string;
  description: string;
  biometricToken: string;
  status: PaymentStatus;
  method?: PaymentMethodType;
  createdAt: Date;
  authorizedAt?: Date;
  capturedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Subscription
 */
export interface Subscription {
  id: string;
  pkpAddress: string;
  amount: number;
  interval: 'monthly' | 'annual';
  biometricToken: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

/**
 * Escrow payment
 */
export interface EscrowPayment {
  id: string;
  pkpAddress: string;
  amount: number;
  releaseCondition: string;
  biometricToken: string;
  status: 'held' | 'released' | 'refunded';
  createdAt: Date;
  releasedAt?: Date;
}

/**
 * Web Payment Service
 * 
 * Integrates with Web Payment Request API to support:
 * - Google Pay
 * - Apple Pay
 * - Samsung Pay
 * - Browser-stored payment methods
 * - Cryptocurrency wallets
 * 
 * All payments require biometric verification
 */
@Injectable()
export class WebPaymentService {
  private readonly logger = new Logger(WebPaymentService.name);

  private payments = new Map<string, PaymentRequest>();
  private subscriptions = new Map<string, Subscription>();
  private escrows = new Map<string, EscrowPayment>();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly biometricService: BiometricVerificationService,
  ) {
    this.logger.log('💳 Web Payment Service initialized');
  }

  /**
   * Request payment with Web Payment API
   * 
   * Integrates with browser Payment Request API:
   * - Shows native payment UI
   * - Supports Google Pay, Apple Pay, Samsung Pay
   * - Requires biometric verification
   */
  async requestPayment(params: {
    pkpAddress: string;
    amount: number;
    description: string;
    biometricToken: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentRequest> {
    this.logger.log(`💳 Payment request: $${params.amount} for ${params.description}`);

    // Validate biometric token
    const isValidBiometric = await this.biometricService.validateToken(
      params.biometricToken,
    );
    if (!isValidBiometric) {
      throw new BadRequestException('Invalid or expired biometric token');
    }

    // In production: Use Payment Request API
    // const paymentRequest = new PaymentRequest(
    //   [
    //     {
    //       supportedMethods: 'basic-card',
    //       data: {
    //         supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
    //         supportedTypes: ['credit', 'debit'],
    //       },
    //     },
    //     {
    //       supportedMethods: 'https://google.com/pay',
    //       data: {
    //         merchantInfo: {
    //           merchantId: 'BCR2DN6T3E...',
    //           merchantName: 'The Beach',
    //         },
    //       },
    //     },
    //     {
    //       supportedMethods: 'https://apple.com/apple-pay',
    //       data: {
    //         merchantIdentifier: 'merchant.app.the-beach',
    //       },
    //     },
    //   ],
    //   {
    //     total: {
    //       label: params.description,
    //       amount: { currency: 'USD', value: params.amount.toFixed(2) },
    //     },
    //   },
    // );

    // const paymentResponse = await paymentRequest.show();
    // await paymentResponse.complete('success');

    const payment: PaymentRequest = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      pkpAddress: params.pkpAddress,
      amount: params.amount,
      currency: 'USD',
      description: params.description,
      biometricToken: params.biometricToken,
      status: PaymentStatus.AUTHORIZED,
      createdAt: new Date(),
      authorizedAt: new Date(),
      metadata: params.metadata,
    };

    this.payments.set(payment.id, payment);

    this.eventEmitter.emit('payment.authorized', payment);

    return payment;
  }

  /**
   * Create recurring subscription
   * 
   * Used for:
   * - Tier upgrades (Basic, Premium)
   * - Agent marketplace subscriptions
   * - Biometric premium features
   */
  async createSubscription(params: {
    pkpAddress: string;
    amount: number;
    interval: 'monthly' | 'annual';
    biometricToken: string;
  }): Promise<Subscription> {
    this.logger.log(
      `🔄 Subscription created: $${params.amount}/${params.interval} for PKP ${params.pkpAddress}`,
    );

    // Validate biometric
    const isValid = await this.biometricService.validateToken(params.biometricToken);
    if (!isValid) {
      throw new BadRequestException('Invalid biometric token');
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (params.interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      pkpAddress: params.pkpAddress,
      amount: params.amount,
      interval: params.interval,
      biometricToken: params.biometricToken,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    };

    this.subscriptions.set(subscription.id, subscription);

    this.eventEmitter.emit('subscription.created', subscription);

    return subscription;
  }

  /**
   * Authorize payment (hold funds)
   * 
   * Used for:
   * - Lit Compute job pre-authorization
   * - VR marketplace holds
   * - Agent marketplace deposits
   */
  async authorize(params: {
    pkpAddress: string;
    amount: number;
    hold: boolean;
    biometricToken: string;
  }): Promise<PaymentRequest> {
    this.logger.log(`🔒 Payment authorization: $${params.amount} (hold: ${params.hold})`);

    // Validate biometric
    const isValid = await this.biometricService.validateToken(params.biometricToken);
    if (!isValid) {
      throw new BadRequestException('Invalid biometric token');
    }

    const payment: PaymentRequest = {
      id: `auth_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      pkpAddress: params.pkpAddress,
      amount: params.amount,
      currency: 'USD',
      description: 'Pre-authorization',
      biometricToken: params.biometricToken,
      status: PaymentStatus.AUTHORIZED,
      createdAt: new Date(),
      authorizedAt: new Date(),
      metadata: { hold: params.hold },
    };

    this.payments.set(payment.id, payment);

    this.eventEmitter.emit('payment.authorized', payment);

    return payment;
  }

  /**
   * Capture authorized payment
   * 
   * Called when:
   * - Lit Compute job completes
   * - VR asset delivered
   * - Agent work finished
   */
  async capture(paymentId: string): Promise<PaymentRequest> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== PaymentStatus.AUTHORIZED) {
      throw new BadRequestException(
        `Payment cannot be captured (status: ${payment.status})`,
      );
    }

    payment.status = PaymentStatus.CAPTURED;
    payment.capturedAt = new Date();

    this.logger.log(`✅ Payment captured: ${paymentId} ($${payment.amount})`);

    this.eventEmitter.emit('payment.captured', payment);

    return payment;
  }

  /**
   * Create escrow payment
   * 
   * Used for:
   * - Agent hiring (released on work completion)
   * - Marketplace disputes
   * - Multi-party transactions
   */
  async createEscrow(params: {
    pkpAddress: string;
    amount: number;
    releaseCondition: string;
    biometricToken: string;
  }): Promise<EscrowPayment> {
    this.logger.log(
      `🔒 Escrow created: $${params.amount} (condition: ${params.releaseCondition})`,
    );

    // Validate biometric
    const isValid = await this.biometricService.validateToken(params.biometricToken);
    if (!isValid) {
      throw new BadRequestException('Invalid biometric token');
    }

    const escrow: EscrowPayment = {
      id: `escrow_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      pkpAddress: params.pkpAddress,
      amount: params.amount,
      releaseCondition: params.releaseCondition,
      biometricToken: params.biometricToken,
      status: 'held',
      createdAt: new Date(),
    };

    this.escrows.set(escrow.id, escrow);

    this.eventEmitter.emit('escrow.created', escrow);

    return escrow;
  }

  /**
   * Release escrow payment
   */
  async releaseEscrow(escrowId: string): Promise<EscrowPayment> {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) {
      throw new BadRequestException('Escrow not found');
    }

    if (escrow.status !== 'held') {
      throw new BadRequestException(`Escrow already ${escrow.status}`);
    }

    escrow.status = 'released';
    escrow.releasedAt = new Date();

    this.logger.log(`💰 Escrow released: ${escrowId} ($${escrow.amount})`);

    this.eventEmitter.emit('escrow.released', escrow);

    return escrow;
  }

  /**
   * Charge payment immediately
   * 
   * Used for:
   * - Code package purchases
   * - Music track purchases
   * - Log data purchases
   * - One-time fees
   */
  async charge(params: {
    pkpAddress: string;
    amount: number;
    description: string;
    biometricToken: string;
  }): Promise<PaymentRequest> {
    this.logger.log(`💳 Charging: $${params.amount} for ${params.description}`);

    // Validate biometric
    const isValid = await this.biometricService.validateToken(params.biometricToken);
    if (!isValid) {
      throw new BadRequestException('Invalid biometric token');
    }

    const payment: PaymentRequest = {
      id: `charge_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      pkpAddress: params.pkpAddress,
      amount: params.amount,
      currency: 'USD',
      description: params.description,
      biometricToken: params.biometricToken,
      status: PaymentStatus.CAPTURED,
      createdAt: new Date(),
      authorizedAt: new Date(),
      capturedAt: new Date(),
    };

    this.payments.set(payment.id, payment);

    this.eventEmitter.emit('payment.captured', payment);

    return payment;
  }

  /**
   * VR payment request (spatial commerce)
   * 
   * Handles payments in VR environments:
   * - VR asset purchases
   * - Spatial biometric verification
   * - Gesture-based checkout
   */
  async requestVRPayment(params: {
    pkpAddress: string;
    amount: number;
    biometricToken: string; // From spatial biometric
  }): Promise<PaymentRequest> {
    this.logger.log(`🥽 VR payment: $${params.amount} for PKP ${params.pkpAddress}`);

    // Validate spatial biometric
    const isValid = await this.biometricService.validateToken(params.biometricToken);
    if (!isValid) {
      throw new BadRequestException('Invalid spatial biometric token');
    }

    const payment: PaymentRequest = {
      id: `vr_pay_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      pkpAddress: params.pkpAddress,
      amount: params.amount,
      currency: 'USD',
      description: 'VR purchase',
      biometricToken: params.biometricToken,
      status: PaymentStatus.AUTHORIZED,
      createdAt: new Date(),
      authorizedAt: new Date(),
      metadata: { channel: 'vr' },
    };

    this.payments.set(payment.id, payment);

    this.eventEmitter.emit('payment.vr.authorized', payment);

    return payment;
  }

  /**
   * Annual contract with biometric signing
   * 
   * Used for:
   * - White label addon ($300/year)
   * - Custom domain addon ($60/year)
   * - SLA guarantee addon ($600/year)
   * - Enterprise contracts
   */
  async createAnnualContract(params: {
    pkpAddress: string;
    amount: number;
    contractType: string;
    biometricToken: string;
  }): Promise<PaymentRequest> {
    this.logger.log(
      `📜 Annual contract: ${params.contractType} - $${params.amount}/year`,
    );

    // Validate enterprise biometric
    const isValid = await this.biometricService.validateToken(params.biometricToken);
    if (!isValid) {
      throw new BadRequestException('Invalid biometric token');
    }

    const payment: PaymentRequest = {
      id: `contract_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      pkpAddress: params.pkpAddress,
      amount: params.amount,
      currency: 'USD',
      description: `Annual contract: ${params.contractType}`,
      biometricToken: params.biometricToken,
      status: PaymentStatus.AUTHORIZED,
      createdAt: new Date(),
      authorizedAt: new Date(),
      metadata: {
        contractType: params.contractType,
        term: 'annual',
      },
    };

    this.payments.set(payment.id, payment);

    this.eventEmitter.emit('contract.signed', payment);

    return payment;
  }

  /**
   * Refund payment
   */
  async refund(paymentId: string, reason: string): Promise<PaymentRequest> {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException('Only captured payments can be refunded');
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.metadata = { ...payment.metadata, refundReason: reason };

    this.logger.log(`↩️  Payment refunded: ${paymentId} ($${payment.amount})`);

    this.eventEmitter.emit('payment.refunded', payment);

    return payment;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    immediate: boolean = false,
  ): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    if (immediate) {
      subscription.status = 'canceled';
    } else {
      subscription.cancelAtPeriodEnd = true;
    }

    this.logger.log(
      `🚫 Subscription ${immediate ? 'canceled' : 'will cancel at period end'}: ${subscriptionId}`,
    );

    this.eventEmitter.emit('subscription.canceled', subscription);

    return subscription;
  }

  /**
   * Get payment by ID
   */
  getPayment(paymentId: string): PaymentRequest | undefined {
    return this.payments.get(paymentId);
  }

  /**
   * Get payments for PKP
   */
  getPaymentsForPKP(pkpAddress: string): PaymentRequest[] {
    return Array.from(this.payments.values()).filter(
      (p) => p.pkpAddress === pkpAddress,
    );
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): Subscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Get subscriptions for PKP
   */
  getSubscriptionsForPKP(pkpAddress: string): Subscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.pkpAddress === pkpAddress,
    );
  }

  /**
   * Get escrow by ID
   */
  getEscrow(escrowId: string): EscrowPayment | undefined {
    return this.escrows.get(escrowId);
  }
}
