import { Module } from '@nestjs/common';
import { VnpayController } from './vnpay.controller';
import { VnpayService } from './vnpay.service';
import { DatabaseModule } from '../../help/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [VnpayController],
    providers: [VnpayService],
    exports: [VnpayService],
})
export class VnpayModule {}
  