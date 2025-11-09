import { Controller, Post, Body } from '@nestjs/common';
import { VrGameManagerService } from './vr-game-manager.service';
import { VRTask } from './vr-game-manager.interfaces';

@Controller('vr-game-manager')
export class VrGameManagerController {
  constructor(
    private readonly vrGameManagerService: VrGameManagerService,
  ) {}

  @Post('tasks')
  executeTask(@Body() task: VRTask): void {
    this.vrGameManagerService.executeTask(task);
  }
}
