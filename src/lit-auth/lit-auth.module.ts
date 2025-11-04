import { Module } from '@nestjs/common';
import { LitAuthController } from './lit-auth.controller';
import { LitAuthService } from './lit-auth.service';

@Module({
  controllers: [LitAuthController],
  providers: [LitAuthService]
})
export class LitAuthModule {}
