import { Injectable, Logger } from '@nestjs/common';
import { VoIPTask } from './voip-game-manager.interfaces';

@Injectable()
export class VoipGameManagerService {
  private readonly logger = new Logger(VoipGameManagerService.name);

  executeTask(task: VoIPTask): void {
    this.logger.log(`Executing VoIP task: ${task.name}`);
    this.logger.log(`Stream URL: ${task.streamUrl}`);
  }
}
