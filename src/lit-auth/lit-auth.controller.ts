import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { LitAuthService } from './lit-auth.service';

@Controller('lit-auth')
export class LitAuthController {
  constructor(private readonly litAuthService: LitAuthService) {}

  @Post('associate-pkp')
  async associatePkp(@Body() body: { username: string; pkpPublicKey: string }) {
    return this.litAuthService.associatePkp(body.username, body.pkpPublicKey);
  }

  @Get('pkp')
  async getPkp(@Query('username') username: string) {
    return this.litAuthService.getPkp(username);
  }
}
