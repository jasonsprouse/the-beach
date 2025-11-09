import { Module } from '@nestjs/common';
import { IotGameManagerController } from './iot-game-manager.controller';
import { IotGameManagerService } from './iot-game-manager.service';

@Module({
  controllers: [IotGameManagerController],
  providers: [IotGameManagerService]
})
export class IotGameManagerModule {}
