import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { LitComputeModule } from './lit-compute/lit-compute.module';
import { NPEModule } from './npe/npe.module';
import { XrModule } from './xr/xr.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { BiometricModule } from './biometric/biometric.module';
import { PaymentModule } from './payments/payment.module';

@Module({
  imports: [
    EventsModule,
    LitComputeModule,
    NPEModule,
    XrModule,
    MarketplaceModule,
    BiometricModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
