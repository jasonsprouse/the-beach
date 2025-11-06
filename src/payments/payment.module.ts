import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WebPaymentService } from './web-payment.service';
import { PaymentController } from './payment.controller';
import { BiometricModule } from '../biometric/biometric.module';

/**
 * Payment Module
 * 
 * Provides Web Payment API integration with biometric verification
 */
@Module({
  imports: [EventEmitterModule.forRoot(), BiometricModule],
  providers: [WebPaymentService],
  controllers: [PaymentController],
  exports: [WebPaymentService],
})
export class PaymentModule {}
