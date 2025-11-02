import { Module } from '@nestjs/common';

import { EventsModule } from './events/events.module';
import { XrModule } from './xr/xr.module';

@Module({
  imports: [EventsModule, XrModule], // Add EventsModule and XrModule here
  controllers: [],
  providers: [],
})
export class AppModule {}
