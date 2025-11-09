import { Module } from '@nestjs/common';
import { GeospatialGameManagerController } from './geospatial-game-manager.controller';
import { GeospatialGameManagerService } from './geospatial-game-manager.service';

@Module({
  controllers: [GeospatialGameManagerController],
  providers: [GeospatialGameManagerService]
})
export class GeospatialGameManagerModule {}
