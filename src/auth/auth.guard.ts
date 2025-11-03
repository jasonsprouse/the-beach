import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LitService } from '../lit/lit.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly litService: LitService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return false;
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return false;
    }
    return this.litService.verifyAuthToken(token);
  }
}
