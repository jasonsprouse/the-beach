import { Controller, Get } from '@nestjs/common';
import { LitService } from './lit.service';

@Controller('lit')
export class LitController {
  constructor(private readonly litService: LitService) {}

  @Get('config')
  getConfig() {
    return this.litService.getConfig();
  }
}
