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
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface UserSession {
  currentChallenge?: string;
  username?: string; // Temporarily store username during registration
  authenticated?: boolean; // Session authentication status
  authenticatedAt?: Date; // When the session was authenticated
  authenticators?: Array<{
    credentialID: string; // Stored as base64url
    credentialPublicKey: Uint8Array;
    counter: number;
    transports?: AuthenticatorTransportFuture[];
    username?: string; // Associate username with authenticator
  }>;
}

interface StoredAuthenticator {
  credentialID: string;
  credentialPublicKey: string; // Base64 encoded for JSON storage
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string[];
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
  private readonly storageFile = path.join(process.cwd(), 'webauthn-users.json');

  constructor(private readonly litService: LitService) {
    // Load existing users on startup
    this.loadUsersFromFile();
  }

  private loadUsersFromFile() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = fs.readFileSync(this.storageFile, 'utf8');
        const storedUsers: Record<string, StoredAuthenticator[]> = JSON.parse(data);
        
        // Convert stored data back to in-memory format
        for (const [username, authenticators] of Object.entries(storedUsers)) {
          const convertedAuthenticators = authenticators.map(auth => ({
            credentialID: auth.credentialID,
            credentialPublicKey: Buffer.from(auth.credentialPublicKey, 'base64'),
            counter: auth.counter,
            credentialDeviceType: auth.credentialDeviceType,
            credentialBackedUp: auth.credentialBackedUp,
            transports: auth.transports,
          }));
          this.userAuthenticators.set(username, convertedAuthenticators);
        }
        console.log(`🔄 Loaded ${this.userAuthenticators.size} users from storage`);
      }
    } catch (error) {
      console.warn('⚠️ Could not load users from file:', error.message);
    }
  }

  private saveUsersToFile() {
    try {
      const storedUsers: Record<string, StoredAuthenticator[]> = {};
      
      // Convert in-memory data to JSON-serializable format
      for (const [username, authenticators] of this.userAuthenticators.entries()) {
        storedUsers[username] = authenticators.map(auth => ({
          credentialID: auth.credentialID,
          credentialPublicKey: Buffer.from(auth.credentialPublicKey).toString('base64'),
          counter: auth.counter,
          credentialDeviceType: auth.credentialDeviceType,
          credentialBackedUp: auth.credentialBackedUp,
          transports: auth.transports,
        }));
      }
      
      fs.writeFileSync(this.storageFile, JSON.stringify(storedUsers, null, 2));
      console.log(`💾 Saved ${this.userAuthenticators.size} users to storage`);
    } catch (error) {
      console.warn('⚠️ Could not save users to file:', error.message);
    }
  }

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

  /**
   * Generate a deterministic PKP address from user's credential
   * This ensures one-to-one mapping between user and PKP
   */
  private generatePKPAddress(username: string, credentialID: string): string {
    // Create a deterministic seed from username and credential
    const seed = `${username}:${credentialID}`;
    const hash = crypto.createHash('sha256').update(seed).digest();
    
    // Generate a deterministic private key from the hash
    // Note: In production, this should use more secure key derivation
    const privateKeyHex = hash.toString('hex');
    
    // Create an Ethereum-style address from the hash
    // Use SHA256 instead of keccak256 for Node.js compatibility
    const addressHash = crypto.createHash('sha256').update(hash).digest();
    const address = '0x' + addressHash.slice(-20).toString('hex');
    
    console.log(`🔑 Generated deterministic PKP address for ${username}: ${address}`);
    return address;
  }

  /**
   * Generate additional PKP for specific purposes (AI builds, concurrent paths, etc.)
   */
  private generateSubPKP(username: string, credentialID: string, purpose: string, index: number = 0): string {
    const seed = `${username}:${credentialID}:${purpose}:${index}`;
    const hash = crypto.createHash('sha256').update(seed).digest();
    const addressHash = crypto.createHash('sha256').update(hash).digest();
    const address = '0x' + addressHash.slice(-20).toString('hex');
    
    console.log(`🔧 Generated sub-PKP for ${username} (${purpose}#${index}): ${address}`);
    return address;
  }

  /**
   * Get PKP information for authenticated user with management capabilities
   */
  private getPKPForUser(username: string): { 
    ethAddress: string; 
    publicKey: string;
    subPKPs: Array<{
      address: string;
      purpose: string;
      index: number;
      createdAt: string;
    }>;
    canMint: boolean;
  } | null {
    const userAuthenticators = this.userAuthenticators.get(username);
    if (!userAuthenticators || userAuthenticators.length === 0) {
      return null;
    }

    // Since we maintain one-to-one mapping, use the single credential
    const credential = userAuthenticators[0];
    const ethAddress = this.generatePKPAddress(username, credential.credentialID);
    
    // Generate a deterministic public key (for demo purposes)
    const publicKey = crypto.createHash('sha256')
      .update(`${username}:${credential.credentialID}:pubkey`)
      .digest('hex');

    // Generate some default sub-PKPs for different purposes
    const subPKPs = [
      {
        address: this.generateSubPKP(username, credential.credentialID, 'ai-build', 0),
        purpose: 'ai-build-path-main',
        index: 0,
        createdAt: new Date().toISOString()
      },
      {
        address: this.generateSubPKP(username, credential.credentialID, 'ai-build', 1),
        purpose: 'ai-build-path-experimental',
        index: 1,
        createdAt: new Date().toISOString()
      },
      {
        address: this.generateSubPKP(username, credential.credentialID, 'session', 0),
        purpose: 'session-management',
        index: 0,
        createdAt: new Date().toISOString()
      }
    ];

    return {
      ethAddress,
      publicKey,
      subPKPs,
      canMint: true // This primary PKP can mint additional ones
    };
  }

  @Get('config')
  getConfig() {
    return this.litService.getConfig();
  }

  /**
   * Check session authentication status
   */
  @Get('session/status')
  getSessionStatus(@Session() session: UserSession) {
    return {
      authenticated: !!session.authenticated,
      username: session.username,
      authenticatedAt: session.authenticatedAt,
    };
  }

  /**
   * Logout and clear session
   */
  @Post('session/logout')
  logout(@Session() session: UserSession) {
    session.authenticated = false;
    session.username = undefined;
    session.authenticatedAt = undefined;
    session.currentChallenge = undefined;
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Get user profile information
   */
  @Get('user/profile')
  getUserProfile(@Session() session: UserSession) {
    if (!session.authenticated || !session.username) {
      throw new BadRequestException('Not authenticated');
    }

    const userAuthenticators = this.userAuthenticators.get(session.username);
    
    if (!userAuthenticators) {
      throw new BadRequestException('User not found');
    }

    return {
      username: session.username,
      authenticatorCount: userAuthenticators.length,
      lastLogin: session.authenticatedAt,
      isAuthenticated: true,
    };
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
      
      console.log('🔑 Registration challenge stored in session:', {
        challenge: options.challenge,
        username: username,
        hasSession: !!session
      });

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
  ): Promise<{ success: boolean; message: string; pkpInfo?: any }> {
    try {
      console.log('Verifying registration credential...');
      console.log('Credential received:', JSON.stringify(credential, null, 2));

      // Handle both direct credential and wrapped credential formats
      const actualCredential = credential.credential || credential;
      console.log('Actual credential for verification:', JSON.stringify(actualCredential, null, 2));

      if (!session.currentChallenge) {
        console.log('❌ No challenge found in session');
        console.log('🔍 Session contents:', {
          hasUsername: !!session.username,
          username: session.username,
          hasCurrentChallenge: !!session.currentChallenge,
          sessionKeys: Object.keys(session)
        });
        throw new BadRequestException('No registration challenge found');
      }

      if (!session.username) {
        console.log('❌ No username found in session');
        throw new BadRequestException('No username found in session');
      }

      console.log('🔍 Verification session state:', {
        storedChallenge: session.currentChallenge,
        storedUsername: session.username,
        hasSession: !!session
      });

      const verification = await verifyRegistrationResponse({
        response: actualCredential,
        expectedChallenge: session.currentChallenge,
        expectedOrigin: this.getExpectedOrigin(),
        expectedRPID: this.getRPID(),
        requireUserVerification: false,
      });

      console.log('Verification result:', verification);

      if (verification.verified && verification.registrationInfo) {
        // For one-to-one mapping: Replace any existing authenticator for this user
        // Instead of appending, we maintain only one credential per user
        console.log('📝 Implementing one-to-one user-to-credential mapping...');
        
        const newAuthenticator = {
          credentialID: verification.registrationInfo.credential.id,
          credentialPublicKey: verification.registrationInfo.credential.publicKey,
          counter: verification.registrationInfo.credential.counter,
          credentialDeviceType: verification.registrationInfo.credentialDeviceType,
          credentialBackedUp: verification.registrationInfo.credentialBackedUp,
          transports: credential.response.transports || [],
        };

        // Check if user already has an authenticator
        const existingAuthenticators = this.userAuthenticators.get(session.username);
        if (existingAuthenticators && existingAuthenticators.length > 0) {
          console.log(`⚠️ User ${session.username} already has ${existingAuthenticators.length} authenticator(s). Replacing with new one for one-to-one mapping.`);
        }

        // Replace (not append) - maintain one-to-one relationship
        this.userAuthenticators.set(session.username, [newAuthenticator]);

        // Save to persistent storage
        this.saveUsersToFile();

        console.log('✅ Registration successful for:', session.username);
        console.log('✅ One-to-one mapping maintained - user now has exactly 1 authenticator');

        // Generate PKP for the user
        console.log('🔑 Generating PKP for user:', session.username);
        const pkpInfo = this.getPKPForUser(session.username);
        console.log('🔑 PKP generated:', pkpInfo?.ethAddress);

        // Clear the challenge
        delete session.currentChallenge;

        return {
          success: true,
          message: 'Registration successful',
          pkpInfo: pkpInfo,
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
        
        // Set session as authenticated for use by AuthGuard
        session.authenticated = true;
        session.username = username;
        session.authenticatedAt = new Date();

        // Generate PKP information for one-to-one mapping
        const pkpInfo = this.getPKPForUser(username);
        
        console.log(`✅ Authentication successful for ${username} with one-to-one PKP mapping`);
        console.log(`🔑 PKP Address: ${pkpInfo?.ethAddress}`);

        return {
          success: true,
          verified: verification.verified,
          message: 'WebAuthn authentication successful',
          username: username,
          pkp: pkpInfo, // Include PKP information in response
          oneToOneMapping: true, // Indicate this uses one-to-one mapping
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

  /**
   * Get user's PKP management dashboard
   */
  @Get('pkp/dashboard')
  async getPKPDashboard(@Session() session: UserSession) {
    if (!session.authenticated || !session.username) {
      throw new BadRequestException('User not authenticated');
    }

    const pkpInfo = this.getPKPForUser(session.username);
    if (!pkpInfo) {
      throw new BadRequestException('No PKP found for user');
    }

    return {
      success: true,
      user: session.username,
      primaryPKP: {
        address: pkpInfo.ethAddress,
        publicKey: pkpInfo.publicKey,
        canMint: pkpInfo.canMint
      },
      subPKPs: pkpInfo.subPKPs,
      totalManagedPKPs: pkpInfo.subPKPs.length + 1,
      lastAccessed: session.authenticatedAt
    };
  }

  /**
   * Mint a new sub-PKP for specific purpose
   */
  @Post('pkp/mint')
  async mintSubPKP(
    @Body() body: { purpose: string; description?: string },
    @Session() session: UserSession
  ) {
    if (!session.authenticated || !session.username) {
      throw new BadRequestException('User not authenticated');
    }

    const userAuthenticators = this.userAuthenticators.get(session.username);
    if (!userAuthenticators || userAuthenticators.length === 0) {
      throw new BadRequestException('No credentials found for user');
    }

    const credential = userAuthenticators[0];
    
    // Generate next index for this purpose
    const existingPKPs = this.getPKPForUser(session.username);
    const purposeCount = existingPKPs?.subPKPs.filter(pkp => pkp.purpose.includes(body.purpose)).length || 0;
    
    const newSubPKP = {
      address: this.generateSubPKP(session.username, credential.credentialID, body.purpose, purposeCount),
      purpose: body.purpose,
      description: body.description || `Sub-PKP for ${body.purpose}`,
      index: purposeCount,
      createdAt: new Date().toISOString(),
      parentPKP: this.generatePKPAddress(session.username, credential.credentialID)
    };

    console.log(`🎯 Minted new sub-PKP for ${session.username}:`, newSubPKP);

    return {
      success: true,
      message: 'Sub-PKP minted successfully',
      subPKP: newSubPKP
    };
  }

  /**
   * Get AI build paths managed by user's PKPs
   */
  @Get('pkp/ai-builds')
  async getAIBuildPaths(@Session() session: UserSession) {
    if (!session.authenticated || !session.username) {
      throw new BadRequestException('User not authenticated');
    }

    const pkpInfo = this.getPKPForUser(session.username);
    if (!pkpInfo) {
      throw new BadRequestException('No PKP found for user');
    }

    // Filter AI build related PKPs
    const aiBuildPKPs = pkpInfo.subPKPs.filter(pkp => 
      pkp.purpose.includes('ai-build') || pkp.purpose.includes('concurrent')
    );

    return {
      success: true,
      user: session.username,
      primaryPKP: pkpInfo.ethAddress,
      aiBuildPaths: aiBuildPKPs.map(pkp => ({
        id: pkp.address,
        name: pkp.purpose,
        status: 'active', // This would come from actual build system
        iterations: Math.floor(Math.random() * 10) + 1, // Mock data
        lastBuild: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        pkpAddress: pkp.address,
        capabilities: ['concurrent-development', 'auto-iteration', 'branch-management']
      })),
      canCreateNew: pkpInfo.canMint
    };
  }
}
