import { Controller } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import CreateVoucherDto from './dto/create-voucher.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @MessagePattern({ cmd: 'create-voucher' })
  createVoucher(data: CreateVoucherDto) {
    return this.voucherService.createVoucher(data);
  }

  @MessagePattern({ cmd: 'get-vouchers-by-promotion-id' })
  getVouchersByPromotionId(data: { promotionId: number }) {
    return this.voucherService.getVouchersByPromotionId(data.promotionId);
  }
}
