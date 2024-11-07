import { Module } from '@nestjs/common';
import { VnpayController } from './vnpay.controller';
import { VnpayService } from './vnpay.service';
import { OrderService } from 'src/order/order.service';

@Module({
  controllers: [VnpayController],
  providers: [VnpayService, OrderService],
})
export class VnpayModule {}
