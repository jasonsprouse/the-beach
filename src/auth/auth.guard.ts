import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { LitService } from '../lit/lit.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly litService: LitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      session?: any;
    }>();
    
    // First, check if there's a session-based authentication (WebAuthn session)
    if (request.session && request.session.authenticated) {
      console.log('✅ Session-based authentication found');
      return true;
    }
    
    // Fallback to token-based authentication
    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('No valid authentication found. Please login again.');
    }

    // Split and validate the Authorization header format
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedException(
        'Invalid token format - expected "Bearer <token>"',
      );
    }

    const [bearer, token] = parts;
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Invalid token format - expected "Bearer <token>"',
      );
    }

    const isValid = await this.litService.verifyAuthToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
