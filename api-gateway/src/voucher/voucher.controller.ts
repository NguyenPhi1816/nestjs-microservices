import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import { Roles } from 'src/auth/decorator/roles.decorator';
import CreatePromotionDto from 'src/promotion/dto/create-promotion.dto';
import CreateVoucherDto from './dto/create-voucher.dto';

@Controller('api/voucher')
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createPromotion(@Body() body: CreateVoucherDto) {
    return this.voucherService.createVoucher(body);
  }
}
