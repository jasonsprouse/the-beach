import { Module } from '@nestjs/common';

import { EventsModule } from './events/events.module';
import { XrModule } from './xr/xr.module';
import { LitModule } from './lit/lit.module';

@Module({
  imports: [EventsModule, XrModule, LitModule], // Add EventsModule, XrModule and LitModule here
  controllers: [],
  providers: [],
})
export class AppModule {}
