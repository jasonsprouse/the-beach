import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { XrModule } from './xr/xr.module';
import { LitModule } from './lit/lit.module';

@Module({
  imports: [EventsModule, XrModule, LitModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
