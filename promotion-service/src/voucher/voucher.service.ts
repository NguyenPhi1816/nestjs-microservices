import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateVoucherDto from './dto/create-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(private prisma: PrismaService) {}

  async createVoucher(data: CreateVoucherDto) {
    const voucher = await this.prisma.voucher.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscountValue: data.maxDiscountValue,
        usageLimit: data.usageLimit,
        status: data.status,
        promotionId: data.promotionId,
      },
    });

    return voucher;
  }

  async getVouchersByPromotionId(id: number) {
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        promotionId: id,
      },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        minOrderValue: true,
        maxDiscountValue: true,
        status: true,
        usageLimit: true,
        usedCount: true,
      },
    });

    return vouchers;
  }
}
