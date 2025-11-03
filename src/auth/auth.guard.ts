import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { LitService } from '../lit/lit.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly litService: LitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }
    const [bearer, token] = authHeader.split(' ');
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
