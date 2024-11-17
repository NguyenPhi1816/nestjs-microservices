import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import CreatePromotionDto from './dto/create-promotion.dto';
import { AccessTokenGuard } from 'src/auth/guard/access-token.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { UserRole } from 'src/constrants/enum/user-role.enum';

@Controller('api/promotion')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createPromotion(@Body() body: CreatePromotionDto) {
    return this.promotionService.createPromotion(body);
  }

  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPromotions() {
    return this.promotionService.getPromotions();
  }

  @Get('/:promotionId')
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPromotionById(@Param() param: { promotionId: string }) {
    return this.promotionService.getPromotionById(
      Number.parseInt(param.promotionId),
    );
  }
}
