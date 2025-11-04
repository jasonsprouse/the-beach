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
    }>();
    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Authorization header not found');
    }
    const parts = authHeader.split(' ');
    const bearer = parts[0];
    const token = parts[1];
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }
    const isValid = await this.litService.verifyAuthToken(token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}
