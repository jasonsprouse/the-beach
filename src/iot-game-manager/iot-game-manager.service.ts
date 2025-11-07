import { Injectable, Logger } from '@nestjs/common';
import { IoTTask } from './iot-game-manager.interfaces';

@Injectable()
export class IotGameManagerService {
  private readonly logger = new Logger(IotGameManagerService.name);

  executeTask(task: IoTTask): void {
    this.logger.log(`Executing IoT task: ${task.name}`);
    this.logger.log(`Device ID: ${task.deviceId}`);
    this.logger.log(`Payload: ${JSON.stringify(task.payload)}`);
  }
}
