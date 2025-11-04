import {
  Controller,
  Get,
  Post,
  Body,
  Session,
  BadRequestException,
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

interface UserSession {
  currentChallenge?: string;
  username?: string; // Temporarily store username during registration
  authenticators?: Array<{
    credentialID: string;
    credentialPublicKey: Uint8Array;
    counter: number;
    transports?: AuthenticatorTransportFuture[];
    username?: string; // Associate username with authenticator
  }>;
}

@Controller('lit')
export class LitController {
  private readonly rpName = 'The Beach';
  private readonly rpID =
    process.env.RP_ID ||
    (process.env.NODE_ENV === 'production'
      ? 'the-beach.vercel.app'
      : 'localhost');
  private readonly origin =
    process.env.ORIGIN ||
    (process.env.NODE_ENV === 'production'
      ? 'https://the-beach.vercel.app'
      : 'http://localhost:3000');

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
  ) {
    try {
      // Use provided username or generate a default one
      const username = body.username?.trim() || `user_${Date.now()}`;

      // Basic validation
      if (username.length < 3) {
        throw new BadRequestException('Username must be at least 3 characters');
      }

      const options = await generateRegistrationOptions({
        rpName: this.rpName,
        rpID: this.rpID,
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
      // Re-throw BadRequestException as is, wrap other errors
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
  ) {
    try {
      if (!session.currentChallenge) {
        throw new BadRequestException('No challenge found in session');
      }

      const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: session.currentChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        // Initialize authenticators array if it doesn't exist
        if (!session.authenticators) {
          session.authenticators = [];
        }

        // Store the authenticator with the username
        const { credential } = verification.registrationInfo;
        session.authenticators.push({
          credentialID: Buffer.from(credential.id).toString('base64url'),
          credentialPublicKey: credential.publicKey,
          counter: credential.counter,
          transports: body.response.transports,
          username: session.username, // Associate username
        });

        // Clear the challenge and temporary username
        delete session.currentChallenge;
        delete session.username;

        return {
          success: true,
          verified: verification.verified,
          message: 'WebAuthn registration successful',
        };
      }

      return {
        success: false,
        verified: false,
        message: 'Registration verification failed',
      };
    } catch (error) {
      console.error('Error verifying registration:', error);
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
    ) {
    try {
      // Find authenticators for the given username
      const authenticators = session.authenticators?.filter(
        (auth) => auth.username === body.username,
      ) || [];

      if (authenticators.length === 0) {
        throw new BadRequestException('No authenticators registered for this username');
      }

      const options = await generateAuthenticationOptions({
        rpID: this.rpID,
        allowCredentials: authenticators.map((auth) => ({
          id: auth.credentialID,
          transports: auth.transports,
        })),
        userVerification: 'preferred',
      });

      // Store challenge in session for verification
      session.currentChallenge = options.challenge;

      return options;
    } catch (error) {
      console.error('Error generating authentication options:', error);
      throw new BadRequestException(
        'Failed to generate authentication options',
      );
    }
  }

  /**
   * Verify WebAuthn authentication response
   */
  @Post('webauthn/verify-authentication')
  async verifyAuthentication(
    @Body() body: AuthenticationResponseJSON,
    @Session() session: UserSession,
  ) {
    try {
      if (!session.currentChallenge) {
        throw new BadRequestException('No challenge found in session');
      }

      if (!session.authenticators || session.authenticators.length === 0) {
        throw new BadRequestException('No authenticators registered');
      }

      // Find the authenticator
      const authenticator = session.authenticators.find(
        (auth) => auth.credentialID === body.id,
      );

      if (!authenticator) {
        throw new BadRequestException('Authenticator not found');
      }

      // Get the username associated with the authenticator
      const username = authenticator.username;

      const verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: session.currentChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        credential: {
          id: authenticator.credentialID,
          publicKey: authenticator.credentialPublicKey,
          counter: authenticator.counter,
        },
      });

      if (verification.verified) {
        // Update counter
        authenticator.counter = verification.authenticationInfo.newCounter;

        // Clear the challenge
        delete session.currentChallenge;

        return {
          success: true,
          verified: verification.verified,
          message: 'WebAuthn authentication successful',
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
