import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

interface UserSession {
  authenticated?: boolean;
  username?: string;
  authenticatedAt?: Date;
}

@Injectable()
export class WebAuthnAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as UserSession;

    console.log('🛡️ WebAuthn Guard checking authentication:', {
      authenticated: session?.authenticated,
      username: session?.username,
      authenticatedAt: session?.authenticatedAt,
      sessionAge: session?.authenticatedAt ? 
        Math.floor((Date.now() - new Date(session.authenticatedAt).getTime()) / 1000) : null
    });

    // Check if user is authenticated via WebAuthn
    if (!session?.authenticated || !session?.username) {
      console.log('❌ WebAuthn Guard: User not authenticated');
      throw new UnauthorizedException({
        message: 'WebAuthn authentication required',
        code: 'WEBAUTHN_REQUIRED',
        redirectTo: '/',
        action: 'authenticate'
      });
    }

    // Check session age (optional - expire after 24 hours)
    if (session.authenticatedAt) {
      const sessionAge = Date.now() - new Date(session.authenticatedAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge > maxAge) {
        console.log('❌ WebAuthn Guard: Session expired');
        // Clear expired session
        session.authenticated = false;
        session.username = undefined;
        session.authenticatedAt = undefined;
        
        throw new UnauthorizedException({
          message: 'Session expired. Please authenticate again.',
          code: 'SESSION_EXPIRED',
          redirectTo: '/',
          action: 'authenticate'
        });
      }
    }

    console.log(`✅ WebAuthn Guard: Access granted for user ${session.username}`);
    
    // Add user info to request for controllers to use
    (request as any).user = {
      username: session.username,
      authenticatedAt: session.authenticatedAt,
      sessionAge: session.authenticatedAt ? 
        Math.floor((Date.now() - new Date(session.authenticatedAt).getTime()) / 1000) : null
    };

    return true;
  }
}