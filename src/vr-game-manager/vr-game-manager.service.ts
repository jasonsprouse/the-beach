import { Injectable, Logger } from '@nestjs/common';
import { VRTask } from './vr-game-manager.interfaces';

@Injectable()
export class VrGameManagerService {
  private readonly logger = new Logger(VrGameManagerService.name);

  executeTask(task: VRTask): void {
    this.logger.log(`Executing VR task: ${task.name}`);
    this.logger.log(`Asset URL: ${task.assetUrl}`);
  }
}
