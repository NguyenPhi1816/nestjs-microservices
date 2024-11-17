import { Module } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { VoucherService } from 'src/voucher/voucher.service';
import { DiscountService } from 'src/discount/discount.service';

@Module({
  controllers: [PromotionController],
  providers: [PromotionService, VoucherService, DiscountService],
})
export class PromotionModule {}
