import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
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

  @Get()
  getAvailableVouchers() {
    return this.voucherService.getAvailableVouchers();
  }
  
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createPromotion(@Body() body: CreateVoucherDto) {
    return this.voucherService.createVoucher(body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteVoucher(@Param('id', ParseIntPipe) id: number) {
    return this.voucherService.deleteVoucher(id);
  }

  @Put('/:id/:status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateVoucherStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: string,
  ) {
    return this.voucherService.updateVoucherStatus(id, status);
  }
}
