import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BiometricVerificationService } from './biometric-verification.service';

/**
 * Biometric Module
 * 
 * Provides biometric verification for all payment and approval flows
 */
@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [BiometricVerificationService],
  exports: [BiometricVerificationService],
})
export class BiometricModule {}
