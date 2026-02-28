import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from '../help/mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local';
import { JwtStrategy } from './jwt';
import { RolesGuard } from './jwt/roles.guard';
import { UserModule } from '../modules/user/user.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtStrategy, LocalStrategy, RolesGuard],
  exports: [JwtStrategy, LocalStrategy, PassportModule, RolesGuard],
})
export class AuthModule {}
