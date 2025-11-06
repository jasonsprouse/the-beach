/**
 * NPE Module
 * 
 * This module provides NPE (Non-Person Entity) team management
 * for the Lit Compute Network development project.
 */

import { Module } from '@nestjs/common';
import { LitComputeTeamService } from './lit-compute-team.service';
import { NPEController } from './npe.controller';

@Module({
  providers: [LitComputeTeamService],
  controllers: [NPEController],
  exports: [LitComputeTeamService],
})
export class NPEModule {}
