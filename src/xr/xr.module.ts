import { Module } from '@nestjs/common';
import { XrController } from './xr.controller';
import { LitModule } from '../lit/lit.module';
import { AuthGuard } from '../auth/auth.guard';

@Module({
  imports: [LitModule.forRoot()],
  controllers: [XrController],
  providers: [AuthGuard],
  exports: [],
})
export class XrModule {}
