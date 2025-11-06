import { Module } from '@nestjs/common';

import { EventsModule } from './events/events.module';
import { XrModule } from './xr/xr.module';
import { NPEModule } from './npe/npe.module';

@Module({
  imports: [EventsModule, XrModule, NPEModule], // Add EventsModule, XrModule, and NPEModule here
  controllers: [],
  providers: [],
})
export class AppModule {}
