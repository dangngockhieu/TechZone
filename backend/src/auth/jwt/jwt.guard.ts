import { ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedException } from '../../help/exception';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorater/customize';
import { Reflector } from '@nestjs/core';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
      super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('AccessToken invalid');
    }
    return user;
  }
}
