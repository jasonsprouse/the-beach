import {
  Controller,
  Get,
  Post,
  Body,
  Session,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { LitService } from './lit.service';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type RegistrationResponseJSON,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
} from '@simplewebauthn/server';
import { Request } from 'express';

interface UserSession {
  currentChallenge?: string;
  username?: string; // Temporarily store username during registration
  authenticators?: Array<{
    credentialID: string; // Stored as base64url
    credentialPublicKey: Uint8Array;
    counter: number;
    transports?: AuthenticatorTransportFuture[];
    username?: string; // Associate username with authenticator
  }>;
}

@Controller('lit')
export class LitController {
  private readonly rpName = 'The Beach';

  constructor(private readonly litService: LitService) {}

  @Get('config')
  getConfig() {
    return this.litService.getConfig();
  }

  /**
   * Generate WebAuthn registration options
   */
  @Post('webauthn/register-options')
  async generateRegisterOptions(
    @Body() body: { username?: string },
    @Session() session: UserSession,
    @Req() req: Request,
  ) {
    try {
      const rpID = req.hostname;
      const origin = `${req.protocol}://${req.get('host')}`;

      // Use provided username or generate a default one
      const username = body.username?.trim() || `user_${Date.now()}`;

      // Debug logging
      console.log('Registration request for username:', username);
      console.log('Request body:', body);

      // Basic validation
      if (username.length < 3) {
        throw new BadRequestException('Username must be at least 3 characters');
      }

      const options = await generateRegistrationOptions({
        rpName: this.rpName,
        rpID,
        userName: username,
        userDisplayName: username,
        // Prevent users from re-registering existing authenticators
        excludeCredentials:
          session.authenticators?.map((auth) => ({
            id: auth.credentialID,
            transports: auth.transports,
          })) || [],
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });

      // Store challenge and username in session for verification
      session.currentChallenge = options.challenge;
      session.username = username;

      return options;
    } catch (error) {
      console.error('Error generating registration options:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to generate registration options');
    }
  }

  /**
   * Verify WebAuthn registration response
   */
  @Post('webauthn/verify-registration')
  async verifyRegistration(
    @Body() body: RegistrationResponseJSON,
    @Session() session: UserSession,
    @Req() req: Request,
  ) {
    try {
      console.log('Registration verification started');
      console.log('Session username:', session.username);
      console.log('Session challenge exists:', !!session.currentChallenge);
      console.log('Request body received:', !!body);
      
      if (!session.currentChallenge) {
        console.log('ERROR: No challenge found in session');
        throw new BadRequestException('No challenge found in session');
      }

      const rpID = req.hostname;
      const origin = `${req.protocol}://${req.get('host')}`;
      console.log('Verification params - rpID:', rpID, 'origin:', origin);

      const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: session.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });

      console.log('Verification result:', {
        verified: verification.verified,
        hasRegistrationInfo: !!verification.registrationInfo,
        error: verification.verified ? null : 'Verification failed'
      });

      if (verification.verified && verification.registrationInfo) {
        if (!session.authenticators) {
          session.authenticators = [];
        }

        const { credential } = verification.registrationInfo;
        const newAuthenticator = {
          credentialID: Buffer.from(credential.id).toString('base64url'),
          credentialPublicKey: credential.publicKey,
          counter: credential.counter,
          transports: body.response.transports,
          username: session.username,
        };
        
        session.authenticators.push(newAuthenticator);

        // Debug logging
        console.log('Registration successful for username:', session.username);
        console.log('Total authenticators now:', session.authenticators.length);

        delete session.currentChallenge;
        delete session.username;

        return {
          success: true,
          verified: verification.verified,
          message: 'WebAuthn registration successful',
        };
      } else {
        console.log('Registration verification failed');
        console.log('Verification.verified:', verification.verified);
        console.log('Has registrationInfo:', !!verification.registrationInfo);
      }

      return {
        success: false,
        verified: false,
        message: 'Registration verification failed',
      };
    } catch (error) {
      console.error('Error verifying registration:', error);
      console.error('Error details:', error.message);
      throw new BadRequestException(
        `Registration verification failed: ${error.message}`,
      );
    }
  }

  /**
   * Generate WebAuthn authentication options
   */
  @Post('webauthn/authenticate-options')
  async generateAuthenticateOptions(
    @Body() body: { username?: string },
    @Session() session: UserSession,
    @Req() req: Request,
  ) {
    try {
      const rpID = req.hostname;

      // Debug logging
      console.log('Authentication request for username:', body.username);
      console.log('Session authenticators:', session.authenticators?.length || 0);
      console.log('Available usernames:', session.authenticators?.map(auth => auth.username) || []);

      const authenticators =
        session.authenticators?.filter(
          (auth) => auth.username === body.username,
        ) || [];

      if (authenticators.length === 0) {
        throw new BadRequestException(
          'No authenticators registered for this username',
        );
      }

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: authenticators.map((auth) => ({
          id: auth.credentialID,
          transports: auth.transports,
        })),
        userVerification: 'preferred',
      });

      session.currentChallenge = options.challenge;

      return options;
    } catch (error) {
      console.error('Error generating authentication options:', error);
      throw new BadRequestException('Failed to generate authentication options');
    }
  }

  /**
   * Verify WebAuthn authentication response
   */
  @Post('webauthn/verify-authentication')
  async verifyAuthentication(
    @Body() body: AuthenticationResponseJSON,
    @Session() session: UserSession,
    @Req() req: Request,
  ) {
    try {
      if (!session.currentChallenge) {
        throw new BadRequestException('No challenge found in session');
      }

      if (!session.authenticators || session.authenticators.length === 0) {
        throw new BadRequestException('No authenticators registered');
      }

      const authenticator = session.authenticators.find(
        (auth) => auth.credentialID === body.id,
      );

      if (!authenticator) {
        throw new BadRequestException('Authenticator not found');
      }

      const rpID = req.hostname;
      const origin = `${req.protocol}://${req.get('host')}`;

      const verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: session.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: authenticator.credentialID,
          publicKey: authenticator.credentialPublicKey,
          counter: authenticator.counter,
        },
      });

      if (verification.verified) {
        authenticator.counter = verification.authenticationInfo.newCounter;
        delete session.currentChallenge;

        return {
          success: true,
          verified: verification.verified,
          message: 'WebAuthn authentication successful',
          username: authenticator.username, // Return username on success
        };
      }

      return {
        success: false,
        verified: false,
        message: 'Authentication verification failed',
      };
    } catch (error) {
      console.error('Error verifying authentication:', error);
      throw new BadRequestException(
        `Authentication verification failed: ${error.message}`,
      );
    }
  }
}
