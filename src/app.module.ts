import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { LitComputeModule } from './lit-compute/lit-compute.module';
import { NPEModule } from './npe/npe.module';

@Module({
  imports: [EventsModule, LitComputeModule, NPEModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
