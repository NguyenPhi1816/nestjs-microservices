import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/constrants/enum/user-role.enum';
import CreateDiscountDto from './dto/create-discount.dto';
import ApplyDiscountDto from './dto/apply-discount.dto';

@Controller('api/discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createDiscount(@Body() body: CreateDiscountDto) {
    return this.discountService.createDiscount(body);
  }

  @Post('apply')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  applyDiscountToProducts(@Body() body: ApplyDiscountDto) {
    return this.discountService.applyDiscountToProducts(body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteDiscount(@Param('id', ParseIntPipe) id: number) {
    return this.discountService.deleteDiscount(id);
  }

  @Put('/:id/:status')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateDiscountStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: string,
  ) {
    return this.discountService.updateDiscountStatus(id, status);
  }
}
