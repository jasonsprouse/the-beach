import { Injectable, Logger } from '@nestjs/common';
import { GeospatialTask } from './geospatial-game-manager.interfaces';

@Injectable()
export class GeospatialGameManagerService {
  private readonly logger = new Logger(GeospatialGameManagerService.name);

  executeTask(task: GeospatialTask): void {
    this.logger.log(`Executing geospatial task: ${task.name}`);
    this.logger.log(`Location: ${task.location.latitude}, ${task.location.longitude}`);
  }
}
