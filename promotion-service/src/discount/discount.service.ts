import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateDiscountDto from './dto/create-discount.dto';
import ApplyDiscountDto from './dto/apply-discount.dto';
import { RpcException } from '@nestjs/microservices';
import UpdateDiscountStatus from './dto/update-status.dto';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}

  async createDiscount(data: CreateDiscountDto) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: data.promotionId },
      select: {
        startDate: true,
      },
    });

    if (!promotion) {
      throw new RpcException(
        new NotFoundException(`Không tìm thấy thông tin đợt khuyến mãi`),
      );
    }

    const now = new Date();
    if (now >= promotion.startDate) {
      throw new RpcException(
        new ConflictException(
          `Không thể tạo giảm giá vì đợt khuyến mãi này đã được diễn ra`,
        ),
      );
    }

    const existingDiscounts = await this.prisma.baseProductDiscount.findMany({
      where: {
        baseProductId: { in: data.appliedProductIds },
        discount: {
          promotionId: data.promotionId,
        },
      },
      select: {
        baseProductId: true,
      },
    });

    if (existingDiscounts.length > 0) {
      const existingProductIds = existingDiscounts.map(
        (discount) => discount.baseProductId,
      );
      throw new RpcException(
        new ConflictException(
          `Sản phẩm đã được giảm giá trong đợt khuyến mãi này: ${existingProductIds.join(
            ', ',
          )}`,
        ),
      );
    }

    const discount = await this.prisma.discount.create({
      data: {
        type: data.type,
        value: data.value,
        promotionId: data.promotionId,
      },
      select: {
        id: true,
        type: true,
        value: true,
        status: true,
      },
    });

    const request: ApplyDiscountDto = {
      discountId: discount.id,
      baseProductIds: data.appliedProductIds,
    };

    const saveAppliedProducts = await this.applyDiscountToProducts(request);
    const appliedProductIds = saveAppliedProducts.map(
      (item) => item.baseProductId,
    );

    return { ...discount, appliedBaseProductIds: appliedProductIds };
  }

  async deleteDiscount(discountId: number) {
    console.log(discountId);
    const discount = await this.prisma.discount.findUnique({
      where: { id: discountId },
      include: { promotion: true },
    });

    if (!discount) {
      throw new RpcException(
        new BadRequestException('Discount không tồn tại.'),
      );
    }

    const currentDate = new Date();
    const { startDate, endDate } = discount.promotion;

    if (currentDate >= startDate && currentDate <= endDate) {
      throw new RpcException(
        new BadRequestException(
          'Không thể xóa giảm giá này vì nó thuộc đợt khuyến mãi đang hoạt động.',
        ),
      );
    }

    if (currentDate > endDate) {
      throw new RpcException(
        new BadRequestException(
          'Không thể xóa giảm giá vì đợt khuyến mãi đã kết thúc trong quá khứ.',
        ),
      );
    }

    await this.prisma.baseProductDiscount.deleteMany({
      where: { discountId },
    });

    return await this.prisma.discount.delete({
      where: { id: discountId },
    });
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

  async getDiscountsById(discountId: number) {
    const discount = await this.prisma.discount.findUnique({
      where: {
        id: discountId,
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

    const response = {
      id: discount.id,
      type: discount.type,
      value: discount.value,
      status: discount.status,
      appliedBaseProductIds: discount.baseProductDiscounts.map(
        (i) => i.baseProductId,
      ),
    };

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

  async updateDiscountStatus(data: UpdateDiscountStatus): Promise<any> {
    const discount = await this.prisma.discount.findUnique({
      where: { id: data.discountId },
    });

    if (!discount) {
      throw new RpcException(
        new BadRequestException('Discount không tồn tại.'),
      );
    }

    return await this.prisma.discount.update({
      where: { id: data.discountId },
      data: { status: data.status },
    });
  }

  async getAppliedPromotionByProductId(productId: number) {
    const activeDiscount = await this.prisma.baseProductDiscount.findFirst({
      where: {
        baseProductId: productId,
        discount: {
          status: 'ACTIVE',
          promotion: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
      select: {
        discount: {
          select: {
            id: true,
            type: true,
            value: true,
          },
        },
      },
    });

    if (!activeDiscount) {
      return {};
    }

    return {
      discountId: activeDiscount.discount.id,
      type: activeDiscount.discount.type,
      value: activeDiscount.discount.value,
    };
  }
}
