import { Controller } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import CreatePromotionDto from './dto/create-promotion.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @MessagePattern({ cmd: 'create-promotion' })
  createPromotion(data: CreatePromotionDto) {
    return this.promotionService.createPromotion(data);
  }

  @MessagePattern({ cmd: 'get-promotions' })
  getPromotions() {
    return this.promotionService.getPromotions();
  }

  @MessagePattern({ cmd: 'get-promotion-by-id' })
  getPromotionById(data: { promotionId: number }) {
    return this.promotionService.getPromotionById(data.promotionId);
  }
}
