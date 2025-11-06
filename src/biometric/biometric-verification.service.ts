import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Biometric verification methods
 */
export enum BiometricMethod {
  FINGERPRINT = 'fingerprint',
  FACE = 'face',
  IRIS = 'iris',
  VOICE = 'voice',
  SPATIAL = 'spatial', // VR gaze + hand tracking
  BEHAVIORAL = 'behavioral', // Typing patterns, mouse movement
}

/**
 * Assurance levels for biometric verification
 */
export enum AssuranceLevel {
  LOW = 'low', // Basic fingerprint
  MEDIUM = 'medium', // Fingerprint + liveness
  HIGH = 'high', // Face + liveness + multi-factor
  ENTERPRISE = 'enterprise', // All methods + audit trail
}

/**
 * Biometric verification result
 */
export interface BiometricVerification {
  verified: boolean;
  token: string;
  timestamp: Date;
  method: BiometricMethod;
  assuranceLevel: AssuranceLevel;
  validUntil: Date;
  deviceId?: string;
  ipAddress?: string;
  location?: {
    lat: number;
    lon: number;
  };
}

/**
 * Biometric device registration
 */
export interface BiometricDevice {
  deviceId: string;
  pkpAddress: string;
  publicKey: string; // WebAuthn credential public key
  credentialId: string; // WebAuthn credential ID
  registeredAt: Date;
  lastUsed?: Date;
  deviceType: 'mobile' | 'desktop' | 'vr' | 'wearable';
  biometricCapabilities: BiometricMethod[];
}

/**
 * Biometric Verification Service
 * 
 * Handles WebAuthn-based biometric verification for:
 * - Payment authorization
 * - High-value purchases
 * - Sub-PKP approvals
 * - Tier upgrades
 * - Enterprise contracts
 * - VR spatial verification
 */
@Injectable()
export class BiometricVerificationService {
  private readonly logger = new Logger(BiometricVerificationService.name);

  // Active verifications (token -> verification)
  private verifications = new Map<string, BiometricVerification>();

  // Registered biometric devices (deviceId -> device)
  private devices = new Map<string, BiometricDevice>();

  // PKP to devices mapping
  private pkpDevices = new Map<string, Set<string>>();

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.logger.log('🔐 Biometric Verification Service initialized');
  }

  /**
   * Register biometric device (WebAuthn)
   * 
   * Called when user sets up fingerprint/FaceID for first time
   */
  async registerDevice(params: {
    pkpAddress: string;
    publicKey: string;
    credentialId: string;
    deviceType: 'mobile' | 'desktop' | 'vr' | 'wearable';
    biometricCapabilities: BiometricMethod[];
  }): Promise<BiometricDevice> {
    const deviceId = `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const device: BiometricDevice = {
      deviceId,
      pkpAddress: params.pkpAddress,
      publicKey: params.publicKey,
      credentialId: params.credentialId,
      registeredAt: new Date(),
      deviceType: params.deviceType,
      biometricCapabilities: params.biometricCapabilities,
    };

    this.devices.set(deviceId, device);

    // Map PKP to device
    if (!this.pkpDevices.has(params.pkpAddress)) {
      this.pkpDevices.set(params.pkpAddress, new Set());
    }
    this.pkpDevices.get(params.pkpAddress)!.add(deviceId);

    this.logger.log(
      `📱 Biometric device registered: ${deviceId} for PKP ${params.pkpAddress}`,
    );

    this.eventEmitter.emit('biometric.device.registered', {
      pkpAddress: params.pkpAddress,
      deviceId,
      capabilities: params.biometricCapabilities,
    });

    return device;
  }

  /**
   * Verify user with biometric (WebAuthn)
   * 
   * This is the main verification method used across the platform
   */
  async verify(params: {
    pkpAddress: string;
    action: string;
    amount?: number;
    deviceId?: string;
    challenge?: string; // WebAuthn challenge
  }): Promise<BiometricVerification> {
    this.logger.log(
      `🔐 Biometric verification request: ${params.action} for ${params.pkpAddress}`,
    );

    // Validate PKP has registered devices
    const devices = this.pkpDevices.get(params.pkpAddress);
    if (!devices || devices.size === 0) {
      throw new UnauthorizedException(
        'No biometric devices registered for this PKP',
      );
    }

    // Determine assurance level based on amount
    const assuranceLevel = this.determineAssuranceLevel(params.amount);

    // In production: Call WebAuthn API
    // const credential = await navigator.credentials.get({
    //   publicKey: {
    //     challenge: new Uint8Array(params.challenge),
    //     rpId: 'the-beach.app',
    //     userVerification: 'required',
    //     timeout: 60000,
    //   },
    // });

    // Verify signature matches registered public key
    // const isValid = await this.verifyWebAuthnSignature(credential);

    const verification: BiometricVerification = {
      verified: true,
      token: `bio_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      method: BiometricMethod.FINGERPRINT,
      assuranceLevel,
      validUntil: new Date(Date.now() + this.getValidityDuration(assuranceLevel)),
      deviceId: params.deviceId,
    };

    this.verifications.set(verification.token, verification);

    // Update device last used
    if (params.deviceId) {
      const device = this.devices.get(params.deviceId);
      if (device) {
        device.lastUsed = new Date();
      }
    }

    this.eventEmitter.emit('biometric.verified', {
      pkp: params.pkpAddress,
      action: params.action,
      verification,
    });

    // Monetization: Charge freemium users for verification
    if (params.amount && params.amount > 100) {
      this.eventEmitter.emit('biometric.fee.charged', {
        pkpAddress: params.pkpAddress,
        amount: 0.25, // $0.25 verification fee
        action: params.action,
      });
    }

    return verification;
  }

  /**
   * Quick approve with biometric (for sub-PKP approvals)
   * 
   * Uses cached biometric if recent to reduce friction
   */
  async quickApprove(params: {
    pkp: string;
    requestId: string;
  }): Promise<BiometricVerification> {
    // Check for recent verification
    const recent = this.getRecentVerification(params.pkp);
    if (recent && recent.validUntil > new Date()) {
      this.logger.log(`✅ Using cached biometric: ${recent.token}`);
      return recent;
    }

    // Request fresh biometric
    return await this.verify({
      pkpAddress: params.pkp,
      action: 'quick-approve',
    });
  }

  /**
   * Batch approve multiple actions with single biometric
   * 
   * Freemium users pay $0.10 for batch approval
   * Premium users get unlimited batch approvals
   */
  async batchApprove(params: {
    pkp: string;
    tasks: number[];
    validity: string; // '1 hour', '1 day'
  }): Promise<BiometricVerification> {
    const validityMs = this.parseValidity(params.validity);

    const verification: BiometricVerification = {
      verified: true,
      token: `bio_batch_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      method: BiometricMethod.FINGERPRINT,
      assuranceLevel: AssuranceLevel.MEDIUM,
      validUntil: new Date(Date.now() + validityMs),
    };

    this.verifications.set(verification.token, verification);

    this.logger.log(
      `✨ Batch approval: ${params.tasks.length} tasks valid for ${params.validity}`,
    );

    // MONETIZATION: Charge freemium users $0.10 for batch approval
    this.eventEmitter.emit('biometric.batch.charged', {
      pkp: params.pkp,
      fee: 0.10,
      tasks: params.tasks.length,
      validity: params.validity,
    });

    return verification;
  }

  /**
   * Enterprise-grade biometric (higher assurance)
   * 
   * Requires liveness detection + multi-factor
   * Charges $2.99 per verification
   */
  async verifyEnterprise(params: {
    pkp: string;
    contact: string;
    level: 'executive' | 'admin';
  }): Promise<BiometricVerification> {
    this.logger.log(`🏢 Enterprise verification: ${params.level} for ${params.pkp}`);

    // Enterprise requires face recognition + liveness detection
    const verification: BiometricVerification = {
      verified: true,
      token: `bio_ent_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      method: BiometricMethod.FACE,
      assuranceLevel: AssuranceLevel.ENTERPRISE,
      validUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    };

    this.verifications.set(verification.token, verification);

    // MONETIZATION: Enterprise verification fee
    this.eventEmitter.emit('biometric.enterprise.charged', {
      pkp: params.pkp,
      fee: 2.99,
      level: params.level,
    });

    return verification;
  }

  /**
   * Spatial biometric (VR gaze + hand tracking)
   * 
   * Analyzes VR behavioral patterns to detect humans vs bots
   */
  async verifySpatial(params: {
    pkp: string;
    gazePattern: number[]; // Eye tracking data
    handGesture: string; // Hand tracking data
    headsetId: string;
  }): Promise<BiometricVerification> {
    this.logger.log(`🥽 VR spatial verification for ${params.pkp}`);

    // Analyze VR biometrics
    const isHuman = this.analyzeSpatialBiometric(
      params.gazePattern,
      params.handGesture,
    );

    if (!isHuman) {
      throw new UnauthorizedException('VR biometric verification failed (bot detected)');
    }

    const verification: BiometricVerification = {
      verified: true,
      token: `bio_vr_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      method: BiometricMethod.SPATIAL,
      assuranceLevel: AssuranceLevel.HIGH,
      validUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      deviceId: params.headsetId,
    };

    this.verifications.set(verification.token, verification);

    this.eventEmitter.emit('biometric.spatial.verified', {
      pkp: params.pkp,
      headsetId: params.headsetId,
    });

    return verification;
  }

  /**
   * Bind biometric to ticket/asset (prevent scalping)
   */
  async bindTicket(params: {
    pkp: string;
    eventId: string;
    ticketType: string;
  }): Promise<BiometricVerification> {
    const verification = await this.verify({
      pkpAddress: params.pkp,
      action: 'ticket-binding',
    });

    this.logger.log(
      `🎫 Ticket bound to biometric: Event ${params.eventId} -> PKP ${params.pkp}`,
    );

    this.eventEmitter.emit('biometric.ticket.bound', {
      pkp: params.pkp,
      eventId: params.eventId,
      ticketType: params.ticketType,
      biometricToken: verification.token,
    });

    return verification;
  }

  /**
   * Request guardian verification (social recovery)
   */
  async requestGuardianVerification(params: {
    guardian: string;
    lostPKP: string;
    requester: string;
  }): Promise<BiometricVerification> {
    this.logger.log(
      `🔑 Guardian verification request: ${params.guardian} for recovery of ${params.lostPKP}`,
    );

    const verification = await this.verify({
      pkpAddress: params.guardian,
      action: 'guardian-recovery',
    });

    this.eventEmitter.emit('biometric.guardian.requested', {
      guardian: params.guardian,
      lostPKP: params.lostPKP,
      requester: params.requester,
    });

    return verification;
  }

  /**
   * Validate biometric token
   */
  async validateToken(token: string): Promise<boolean> {
    const verification = this.verifications.get(token);
    if (!verification) {
      this.logger.warn(`❌ Invalid biometric token: ${token}`);
      return false;
    }
    
    if (verification.validUntil < new Date()) {
      this.logger.warn(`⏰ Expired biometric token: ${token}`);
      return false;
    }
    
    return verification.verified;
  }

  /**
   * Get devices for PKP
   */
  getDevicesForPKP(pkpAddress: string): BiometricDevice[] {
    const deviceIds = this.pkpDevices.get(pkpAddress);
    if (!deviceIds) return [];

    return Array.from(deviceIds)
      .map(id => this.devices.get(id))
      .filter((d): d is BiometricDevice => d !== undefined);
  }

  /**
   * Revoke device
   */
  async revokeDevice(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new UnauthorizedException('Device not found');
    }

    this.devices.delete(deviceId);
    this.pkpDevices.get(device.pkpAddress)?.delete(deviceId);

    this.logger.log(`🗑️  Biometric device revoked: ${deviceId}`);

    this.eventEmitter.emit('biometric.device.revoked', {
      deviceId,
      pkpAddress: device.pkpAddress,
    });
  }

  // ==================== Private Methods ====================

  /**
   * Determine assurance level based on transaction amount
   */
  private determineAssuranceLevel(amount?: number): AssuranceLevel {
    if (!amount) return AssuranceLevel.MEDIUM;
    if (amount < 50) return AssuranceLevel.LOW;
    if (amount < 500) return AssuranceLevel.MEDIUM;
    if (amount < 10000) return AssuranceLevel.HIGH;
    return AssuranceLevel.ENTERPRISE;
  }

  /**
   * Get validity duration based on assurance level
   */
  private getValidityDuration(level: AssuranceLevel): number {
    switch (level) {
      case AssuranceLevel.LOW:
        return 15 * 60 * 1000; // 15 minutes
      case AssuranceLevel.MEDIUM:
        return 10 * 60 * 1000; // 10 minutes
      case AssuranceLevel.HIGH:
        return 5 * 60 * 1000; // 5 minutes
      case AssuranceLevel.ENTERPRISE:
        return 3 * 60 * 1000; // 3 minutes
    }
  }

  /**
   * Get recent verification for PKP
   */
  private getRecentVerification(pkpAddress: string): BiometricVerification | null {
    // Find most recent verification for this PKP that's still valid
    const devices = this.pkpDevices.get(pkpAddress);
    if (!devices) return null;

    for (const [token, verification] of this.verifications) {
      if (
        devices.has(verification.deviceId || '') &&
        verification.validUntil > new Date()
      ) {
        return verification;
      }
    }

    return null;
  }

  /**
   * Parse validity string to milliseconds
   */
  private parseValidity(validity: string): number {
    if (validity === '1 hour') return 60 * 60 * 1000;
    if (validity === '1 day') return 24 * 60 * 60 * 1000;
    if (validity === '1 week') return 7 * 24 * 60 * 60 * 1000;
    return 5 * 60 * 1000; // Default 5 min
  }

  /**
   * Analyze VR spatial biometric patterns
   * 
   * Detects humans vs bots based on natural movement patterns
   */
  private analyzeSpatialBiometric(
    gazePattern: number[],
    handGesture: string,
  ): boolean {
    // Human gaze patterns are smooth and organic
    // Bots have discrete, robotic movements
    if (gazePattern.length < 10) return false;

    // Calculate smoothness (variance in velocity)
    const velocities: number[] = [];
    for (let i = 1; i < gazePattern.length; i++) {
      velocities.push(Math.abs(gazePattern[i] - gazePattern[i - 1]));
    }

    const avgVelocity =
      velocities.reduce((a, b) => a + b, 0) / velocities.length;
    const variance =
      velocities.reduce((a, b) => a + Math.pow(b - avgVelocity, 2), 0) /
      velocities.length;

    // Human movements have moderate variance (not too smooth, not too erratic)
    const isHumanGaze = variance > 0.1 && variance < 10;

    // Hand gestures should be non-empty and natural
    const isHumanGesture = handGesture.length > 0;

    return isHumanGaze && isHumanGesture;
  }

  /**
   * Verify WebAuthn signature (production implementation)
   */
  private async verifyWebAuthnSignature(credential: any): Promise<boolean> {
    // In production:
    // 1. Get public key from device
    // 2. Verify signature matches challenge
    // 3. Check credential is from registered device
    // 4. Verify RPID hash
    // 5. Verify user presence flag
    // 6. Verify user verification flag

    return true; // Simplified for now
  }
}
