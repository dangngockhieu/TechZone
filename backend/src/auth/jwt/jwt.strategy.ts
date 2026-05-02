import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { UserAccount } from '../interface';
import { Role } from '../../enums';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: number; email: string; role: Role; name: string }): Promise<UserAccount> {
    return { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
  }
}