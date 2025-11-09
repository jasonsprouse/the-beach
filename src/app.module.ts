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
import { GeospatialGameManagerModule } from './geospatial-game-manager/geospatial-game-manager.module';
import { VrGameManagerModule } from './vr-game-manager/vr-game-manager.module';
import { VoipGameManagerModule } from './voip-game-manager/voip-game-manager.module';
import { IotGameManagerModule } from './iot-game-manager/iot-game-manager.module';

@Module({
  imports: [
    EventsModule,
    LitComputeModule,
    NPEModule,
    XrModule,
    MarketplaceModule,
    BiometricModule,
    PaymentModule,
    GeospatialGameManagerModule,
    VrGameManagerModule,
    VoipGameManagerModule,
    IotGameManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
