import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PromotionModule } from './promotion/promotion.module';
import { VoucherModule } from './voucher/voucher.module';
import { DiscountModule } from './discount/discount.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    PrismaModule,
    PromotionModule,
    VoucherModule,
    DiscountModule,
  ],
})
export class AppModule {}
