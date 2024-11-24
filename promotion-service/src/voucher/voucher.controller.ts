import { Controller } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import CreateVoucherDto from './dto/create-voucher.dto';
import { MessagePattern } from '@nestjs/microservices';
import UpdateVoucherStatus from './dto/update-status.dto';

@Controller('voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @MessagePattern({ cmd: 'create-voucher' })
  createVoucher(data: CreateVoucherDto) {
    return this.voucherService.createVoucher(data);
  }

  @MessagePattern({ cmd: 'delete-voucher' })
  deleteVoucher(voucherId: number) {
    return this.voucherService.deleteVoucher(voucherId);
  }

  @MessagePattern({ cmd: 'get-vouchers-by-promotion-id' })
  getVouchersByPromotionId(data: { promotionId: number }) {
    return this.voucherService.getVouchersByPromotionId(data.promotionId);
  }

  @MessagePattern({ cmd: 'get-voucher-by-id' })
  getVoucherByVoucherId(voucherId: number) {
    return this.voucherService.getVoucherById(voucherId);
  }

  @MessagePattern({ cmd: 'update-voucher-status' })
  updateVoucherStatus(data: UpdateVoucherStatus) {
    return this.voucherService.updateVoucherStatus(data);
  }

  @MessagePattern({ cmd: 'get-available-vouchers' })
  getAvailableVouchers() {
    return this.voucherService.getAvailableVouchers();
  }
}
