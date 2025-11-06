import { Module } from '@nestjs/common';
import { PkpSalesController } from './pkp-sales.controller';
import { PkpSalesService } from './services/pkp-sales.service';
import { LitComputeModule } from '../lit-compute/lit-compute.module';
import { BiometricModule } from '../biometric/biometric.module';

@Module({
  imports: [LitComputeModule, BiometricModule],
  controllers: [PkpSalesController],
  providers: [PkpSalesService],
  exports: [PkpSalesService],
})
export class MarketplaceModule {}
