import { Controller, Post, Body } from '@nestjs/common';
import { VoipGameManagerService } from './voip-game-manager.service';
import { VoIPTask } from './voip-game-manager.interfaces';

@Controller('voip-game-manager')
export class VoipGameManagerController {
  constructor(
    private readonly voipGameManagerService: VoipGameManagerService,
  ) {}

  @Post('tasks')
  executeTask(@Body() task: VoIPTask): void {
    this.voipGameManagerService.executeTask(task);
  }
}
