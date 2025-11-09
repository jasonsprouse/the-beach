import { Controller, Post, Body } from '@nestjs/common';
import { IotGameManagerService } from './iot-game-manager.service';
import { IoTTask } from './iot-game-manager.interfaces';

@Controller('iot-game-manager')
export class IotGameManagerController {
  constructor(
    private readonly iotGameManagerService: IotGameManagerService,
  ) {}

  @Post('tasks')
  executeTask(@Body() task: IoTTask): void {
    this.iotGameManagerService.executeTask(task);
  }
}
