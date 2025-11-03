import { Module } from '@nestjs/common';
import { LitService } from './lit.service';
import { LitController } from './lit.controller';

@Module({
  providers: [LitService],
  controllers: [LitController],
  exports: [LitService],
})
export class LitModule {}
