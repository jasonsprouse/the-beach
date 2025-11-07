import { Module } from '@nestjs/common';
import { VrGameManagerController } from './vr-game-manager.controller';
import { VrGameManagerService } from './vr-game-manager.service';

@Module({
  controllers: [VrGameManagerController],
  providers: [VrGameManagerService]
})
export class VrGameManagerModule {}
