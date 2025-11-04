import { Controller, Get, Post, Body } from '@nestjs/common';
import { LitService } from './lit.service';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';

@Controller('lit')
export class LitController {
  constructor(private readonly litService: LitService) {}

  @Get('config')
  getConfig() {
    return this.litService.getConfig();
  }

  @Post('webauthn/verify-registration')
  verifyWebAuthnRegistration(
    @Body() options: PublicKeyCredentialCreationOptionsJSON,
  ) {
    // TODO: Implement actual verification of WebAuthn registration options
    console.log('Received WebAuthn registration options:', options);
    return {
      success: true,
      message: 'WebAuthn registration verified (placeholder)',
    };
  }
}
