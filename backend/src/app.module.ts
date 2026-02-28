import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './help/database/database.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './help/mail/mail.module';
import { JwtAuthGuard } from './auth/guard';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { VnpayModule } from './modules/vnpay/vnpay.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), 
    }),
    DatabaseModule, 
    AuthModule,
    ProductModule,
    OrderModule,
    CartModule,
    MailModule,
    UserModule,
    VnpayModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }
  ]
})
export class AppModule {}
