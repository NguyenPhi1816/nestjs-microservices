import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreatePromotionDto from './dto/create-promotion.dto';
import { VoucherService } from 'src/voucher/voucher.service';
import { DiscountService } from 'src/discount/discount.service';

@Injectable()
export class PromotionService {
  constructor(
    private prisma: PrismaService,
    private voucherSerivce: VoucherService,
    private discountSerivce: DiscountService,
  ) {}

  async createPromotion(data: CreatePromotionDto) {
    const promotion = await this.prisma.promotion.create({
      data: {
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });

    return promotion;
  }

  async getPromotions() {
    const promotions = await this.prisma.promotion.findMany({
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });
    return promotions;
  }

  async getPromotionById(promotionId: number) {
    const promotion = await this.prisma.promotion.findUnique({
      where: {
        id: promotionId,
      },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });
    const vouchers =
      await this.voucherSerivce.getVouchersByPromotionId(promotionId);
    const discounts =
      await this.discountSerivce.getDiscountsByPromotionId(promotionId);
    return { ...promotion, vouchers, discounts };
  }
}
