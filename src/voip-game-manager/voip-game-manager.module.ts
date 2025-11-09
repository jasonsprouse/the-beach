import { Module } from '@nestjs/common';
import { VoipGameManagerController } from './voip-game-manager.controller';
import { VoipGameManagerService } from './voip-game-manager.service';

@Module({
  controllers: [VoipGameManagerController],
  providers: [VoipGameManagerService]
})
export class VoipGameManagerModule {}
