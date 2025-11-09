import { Controller, Post, Body } from '@nestjs/common';
import { GeospatialGameManagerService } from './geospatial-game-manager.service';
import { GeospatialTask } from './geospatial-game-manager.interfaces';

@Controller('geospatial-game-manager')
export class GeospatialGameManagerController {
  constructor(
    private readonly geospatialGameManagerService: GeospatialGameManagerService,
  ) {}

  @Post('tasks')
  executeTask(@Body() task: GeospatialTask): void {
    this.geospatialGameManagerService.executeTask(task);
  }
}
