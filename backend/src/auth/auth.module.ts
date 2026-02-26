import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from '../help/mail/mail.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy} from './strategy';
import { RolesGuard } from './guard/roles.guard';
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
  providers: [AuthService, MailService, JwtStrategy, RolesGuard],
  exports: [JwtStrategy, PassportModule, RolesGuard],
})
export class AuthModule {}
