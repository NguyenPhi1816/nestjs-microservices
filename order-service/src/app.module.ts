import { Module } from '@nestjs/common';
import { OrderModule } from './order/order.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CartModule } from './cart/cart.module';
import { VnpayModule } from './vnpay/vnpay.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    OrderModule,
    PrismaModule,
    CartModule,
    VnpayModule,
  ],
})
export class AppModule {}
