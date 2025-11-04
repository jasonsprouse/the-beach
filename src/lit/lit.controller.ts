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
  private readonly userAuthenticators = new Map<string, Array<{
    credentialID: string;
    credentialPublicKey: Uint8Array;
    counter: number;
    credentialDeviceType: string;
    credentialBackedUp: boolean;
    transports: string[];
  }>>();

  constructor(private readonly litService: LitService) {}

  private getExpectedOrigin(): string {
    return process.env.NODE_ENV === 'production' 
      ? process.env.EXPECTED_ORIGIN || 'https://your-domain.com'
      : 'http://localhost:3000';
  }

  private getRPID(): string {
    return process.env.NODE_ENV === 'production'
      ? process.env.RP_ID || 'your-domain.com'
      : 'localhost';
  }

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
    @Body() credential: any,
    @Session() session: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Verifying registration credential...');
      console.log('Credential received:', JSON.stringify(credential, null, 2));

      if (!session.currentChallenge) {
        console.log('❌ No challenge found in session');
        throw new BadRequestException('No registration challenge found');
      }

      if (!session.username) {
        console.log('❌ No username found in session');
        throw new BadRequestException('No username found in session');
      }

      const verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge: session.currentChallenge,
        expectedOrigin: this.getExpectedOrigin(),
        expectedRPID: this.getRPID(),
        requireUserVerification: false,
      });

      console.log('Verification result:', verification);

      if (verification.verified && verification.registrationInfo) {
        // Store the authenticator
        if (!this.userAuthenticators.has(session.username)) {
          this.userAuthenticators.set(session.username, []);
        }

        const newAuthenticator = {
          credentialID: verification.registrationInfo.credential.id,
          credentialPublicKey: verification.registrationInfo.credential.publicKey,
          counter: verification.registrationInfo.credential.counter,
          credentialDeviceType: verification.registrationInfo.credentialDeviceType,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          transports: credential.response.transports || [],
        };

        const userAuthenticators = this.userAuthenticators.get(session.username);
        if (userAuthenticators) {
          userAuthenticators.push(newAuthenticator);
        }

        console.log('✅ Registration successful for:', session.username);
        console.log('Total authenticators:', this.userAuthenticators.get(session.username)?.length || 0);

        // Clear the challenge
        delete session.currentChallenge;

        return {
          success: true,
          message: 'Registration successful',
        };
      } else {
        console.log('❌ Registration verification failed');
        return {
          success: false,
          message: 'Registration verification failed',
        };
      }
    } catch (error) {
      console.error('Registration verification error:', error);
      throw new BadRequestException(
        'Registration verification failed: ' + error.message,
      );
    }
  }

  @Post('webauthn/demo-register')
  async demoRegister(
    @Body() body: { username?: string },
    @Session() session: any,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const username = body.username || `demo_${Date.now()}`;
      console.log('🎭 Demo registration for:', username);

      // Create a mock authenticator for demo purposes
      if (!this.userAuthenticators.has(username)) {
        this.userAuthenticators.set(username, []);
      }

      const demoAuthenticator = {
        credentialID: `demo_cred_${username}_${Date.now()}`,
        credentialPublicKey: new Uint8Array([1, 2, 3, 4, 5]), // Simple demo key
        counter: 0,
        credentialDeviceType: 'singleDevice',
        credentialBackedUp: false,
        transports: ['internal'],
      };

      const userAuthenticators = this.userAuthenticators.get(username);
      if (userAuthenticators) {
        userAuthenticators.push(demoAuthenticator);
      }

      console.log('✅ Demo registration successful for:', username);
      console.log('Total users:', Array.from(this.userAuthenticators.keys()));

      // Store username in session for demo auth
      session.demoUsername = username;

      return {
        success: true,
        message: `Demo registration successful for ${username}`,
      };
    } catch (error) {
      console.error('Demo registration error:', error);
      throw new BadRequestException('Demo registration failed: ' + error.message);
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
      const username = body.username || '';
      console.log('Authentication request for username:', username);
      console.log('Available users in storage:', Array.from(this.userAuthenticators.keys()));
      console.log('User authenticators for', username, ':', this.userAuthenticators.get(username)?.length || 0);

      const authenticators = this.userAuthenticators.get(username) || [];

      if (authenticators.length === 0) {
        throw new BadRequestException(
          'No authenticators registered for this username',
        );
      }

      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: authenticators.map((auth) => ({
          id: auth.credentialID,
          transports: auth.transports as any,
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

      // Find the authenticator across all users
      let authenticator: any = null;
      let username: string = '';
      
      for (const [user, userAuths] of this.userAuthenticators.entries()) {
        const found = userAuths.find(auth => auth.credentialID === body.id);
        if (found) {
          authenticator = found;
          username = user;
          break;
        }
      }

      if (!authenticator) {
        throw new BadRequestException('Authenticator not found');
      }

      console.log('Found authenticator for user:', username);

      const rpID = req.hostname;
      const origin = `${req.protocol}://${req.get('host')}`;

      const verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: session.currentChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        credential: {
          id: authenticator.credentialID,
          publicKey: new Uint8Array(authenticator.credentialPublicKey),
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
