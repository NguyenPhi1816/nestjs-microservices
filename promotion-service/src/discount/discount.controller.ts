import { Controller } from '@nestjs/common';
import { DiscountService } from './discount.service';
import CreateDiscountDto from './dto/create-discount.dto';
import { MessagePattern } from '@nestjs/microservices';
import ApplyDiscountDto from './dto/apply-discount.dto';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @MessagePattern({ cmd: 'create-discount' })
  createDiscount(data: CreateDiscountDto) {
    return this.discountService.createDiscount(data);
  }

  @MessagePattern({ cmd: 'get-discounts-by-promotion-id' })
  getDiscountsByPromotionId(data: { promotionId: number }) {
    return this.discountService.getDiscountsByPromotionId(data.promotionId);
  }

  @MessagePattern({ cmd: 'apply-discount-to-products' })
  applyDiscountToProduct(data: ApplyDiscountDto) {
    return this.discountService.applyDiscountToProducts(data);
  }
}
