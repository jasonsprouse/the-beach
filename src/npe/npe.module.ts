/**
 * NPE Module
 * 
 * This module provides NPE (Non-Person Entity) team management
 * for the Lit Compute Network development project.
 */

import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { NPEController } from './npe.controller';
import { PKPController } from './pkp.controller';
import { LitComputeTeamService } from './lit-compute-team.service';
import { GameManagerService } from './game-manager.service';
import { NPETierManagerService } from './npe-tier-manager.service';
import { GeoDeploymentService } from './geo-deployment.service';
import { PKPTaskManagerService } from './pkp-task-manager.service';

@Module({
  imports: [EventEmitterModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [NPEController, PKPController],
  providers: [
    LitComputeTeamService,
    GameManagerService,
    NPETierManagerService,
    GeoDeploymentService,
    PKPTaskManagerService,
  ],
  exports: [
    LitComputeTeamService,
    GameManagerService,
    NPETierManagerService,
    GeoDeploymentService,
    PKPTaskManagerService,
  ],
})
export class NPEModule {}
