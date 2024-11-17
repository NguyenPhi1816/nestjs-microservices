import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateDiscountDto from './dto/create-discount.dto';
import ApplyDiscountDto from './dto/apply-discount.dto';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async createDiscount(data: CreateDiscountDto) {
    const discount = await this.prisma.discount.create({
      data: {
        type: data.type,
        value: data.value,
        status: data.status,
        promotionId: data.promotionId,
      },
    });

    return discount;
  }

  async getDiscountsByPromotionId(promotionId: number) {
    const discounts = await this.prisma.discount.findMany({
      where: {
        promotionId: promotionId,
      },
      select: {
        id: true,
        type: true,
        value: true,
        status: true,
        baseProductDiscounts: {
          select: {
            baseProductId: true,
          },
        },
      },
    });

    const response = discounts.map((item) => ({
      id: item.id,
      type: item.type,
      value: item.value,
      status: item.status,
      appliedBaseProductIds: item.baseProductDiscounts.map(
        (i) => i.baseProductId,
      ),
    }));

    return response;
  }

  async applyDiscountToProducts(data: ApplyDiscountDto) {
    const baseProductDiscounts = await Promise.all(
      data.baseProductIds.map((item) =>
        this.prisma.baseProductDiscount.create({
          data: {
            baseProductId: item,
            discountId: data.discountId,
          },
        }),
      ),
    );

    return baseProductDiscounts;
  }
}
