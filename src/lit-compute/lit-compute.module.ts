import { Module } from '@nestjs/common';
import { NodesController } from './controllers/nodes.controller';
import { JobsController } from './controllers/jobs.controller';
import { CoordinatorService } from './services/coordinator.service';
import { QueueService } from './services/queue.service';
import { RedisService } from './services/redis.service';
import { LitComputeGateway } from './gateways/lit-compute.gateway';

@Module({
  controllers: [NodesController, JobsController],
  providers: [
    CoordinatorService,
    QueueService,
    RedisService,
    LitComputeGateway,
  ],
  exports: [CoordinatorService, QueueService, RedisService],
})
export class LitComputeModule {}
