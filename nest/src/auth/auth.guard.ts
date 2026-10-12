import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';
import { AuthService, TokenPayload } from './auth.service';

export type AuthedRequest = Request & { user: TokenPayload };

/**
 * Registered globally (APP_GUARD), so every endpoint is protected by default.
 * It accepts only tokens signed by /auth/login.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException({ code: 'TOKEN_MISSING', message: 'Missing bearer token.' });
    }
    try {
      req.user = await this.auth.verify(token);
      return true;
    } catch {
      throw new UnauthorizedException({ code: 'TOKEN_INVALID', message: 'Session expired or token is invalid.' });
    }
  }
}
