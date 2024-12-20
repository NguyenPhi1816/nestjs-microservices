import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import CreateVoucherDto from './dto/create-voucher.dto';
import { RpcException } from '@nestjs/microservices';
import UpdateVoucherStatus from './dto/update-status.dto';
import { VoucherType } from 'src/constants/voucher-type.enum';

@Injectable()
export class VoucherService {
  constructor(private prisma: PrismaService) {}

  async createVoucher(data: CreateVoucherDto) {
    if (data.type == VoucherType.PERCENTAGE && data.value > 100) {
      throw new RpcException(
        new ConflictException(`Giá trị phiếu mua hàng không hợp lệ`),
      );
    }

    const existedVoucher = await this.prisma.voucher.findUnique({
      where: {
        code: data.code,
      },
    });

    if (existedVoucher) {
      throw new RpcException(
        new ConflictException(`Mã phiếu mua hàng đã tồn tại`),
      );
    }

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
          `Không thể tạo phiếu mua hàng vì đợt khuyến mãi này đã được diễn ra`,
        ),
      );
    }

    const voucher = await this.prisma.voucher.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderValue: data.minOrderValue,
        maxDiscountValue: data.maxDiscountValue,
        usageLimit: data.usageLimit,
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

  async getVoucherById(voucherId: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: {
        id: voucherId,
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

    return voucher;
  }

  async deleteVoucher(voucherId: number): Promise<any> {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id: voucherId },
      include: { promotion: true },
    });

    if (!voucher) {
      throw new RpcException(new BadRequestException('Voucher không tồn tại.'));
    }

    const currentDate = new Date();
    const { startDate, endDate } = voucher.promotion;

    // Kiểm tra điều kiện thời gian
    if (currentDate >= startDate && currentDate <= endDate) {
      throw new RpcException(
        new BadRequestException(
          'Không thể xóa voucher vì Promotion đang hoạt động.',
        ),
      );
    }

    if (currentDate > endDate) {
      throw new RpcException(
        new BadRequestException(
          'Không thể xóa voucher vì Promotion đã kết thúc trong quá khứ.',
        ),
      );
    }

    return await this.prisma.voucher.delete({
      where: { id: voucherId },
    });
  }

  async updateVoucherStatus(data: UpdateVoucherStatus): Promise<any> {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id: data.voucherId },
    });

    if (!voucher) {
      throw new RpcException(new BadRequestException('Voucher không tồn tại.'));
    }

    return await this.prisma.voucher.update({
      where: { id: data.voucherId },
      data: { status: data.status },
    });
  }

  async getAvailableVouchers() {
    const currentDate = new Date();

    const vouchers = await this.prisma.voucher.findMany({
      where: {
        status: 'ACTIVE',
        promotion: {
          startDate: { lte: currentDate },
          endDate: { gte: currentDate },
        },
      },
      select: {
        id: true,
        code: true,
        type: true,
        value: true,
        minOrderValue: true,
        maxDiscountValue: true,
        usageLimit: true,
        usedCount: true,
        promotion: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    const availableVouchers = vouchers.filter(
      (voucher) => voucher.usageLimit > voucher.usedCount,
    );

    return availableVouchers;
  }

  async applyVoucher(voucherId: number) {
    const voucher = await this.prisma.voucher.findUnique({
      where: {
        id: voucherId,
      },
      select: {
        usageLimit: true,
        usedCount: true,
      },
    });

    if (voucher.usedCount >= voucher.usageLimit) {
      throw new RpcException(
        new ConflictException('Phiếu mua hàng đã được sử dụng hết'),
      );
    }

    const updatedVoucher = await this.prisma.voucher.update({
      where: {
        id: voucherId,
      },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });

    return { message: 'Áp dụng phiếu mua hàng thành công', status: 200 };
  }
}
