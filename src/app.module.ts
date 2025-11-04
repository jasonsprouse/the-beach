import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { XrModule } from './xr/xr.module';
import { LitModule } from './lit/lit.module';
import { LitAuthModule } from './lit-auth/lit-auth.module';

@Module({
  imports: [EventsModule, XrModule, LitModule.forRoot(), LitAuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
