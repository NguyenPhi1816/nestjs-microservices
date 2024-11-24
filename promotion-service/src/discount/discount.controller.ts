import { Controller } from '@nestjs/common';
import { DiscountService } from './discount.service';
import CreateDiscountDto from './dto/create-discount.dto';
import { MessagePattern } from '@nestjs/microservices';
import ApplyDiscountDto from './dto/apply-discount.dto';
import UpdateDiscountStatus from './dto/update-status.dto';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @MessagePattern({ cmd: 'create-discount' })
  createDiscount(data: CreateDiscountDto) {
    return this.discountService.createDiscount(data);
  }

  @MessagePattern({ cmd: 'delete-discount' })
  deleteDiscount(discountId: number) {
    return this.discountService.deleteDiscount(discountId);
  }

  @MessagePattern({ cmd: 'get-discounts-by-promotion-id' })
  getDiscountsByPromotionId(data: { promotionId: number }) {
    return this.discountService.getDiscountsByPromotionId(data.promotionId);
  }

  @MessagePattern({ cmd: 'get-discount-by-id' })
  getDiscountsById(discountId: number) {
    return this.discountService.getDiscountsById(discountId);
  }

  @MessagePattern({ cmd: 'apply-discount-to-products' })
  applyDiscountToProduct(data: ApplyDiscountDto) {
    return this.discountService.applyDiscountToProducts(data);
  }

  @MessagePattern({ cmd: 'update-discount-status' })
  updateDiscountStatus(data: UpdateDiscountStatus) {
    return this.discountService.updateDiscountStatus(data);
  }

  @MessagePattern({ cmd: 'get-applied-promotion-by-product-id' })
  getAppliedPromotionByProductId(productId: number) {
    return this.discountService.getAppliedPromotionByProductId(productId);
  }
}
