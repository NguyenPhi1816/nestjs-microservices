import { IsEnum, IsInt, IsNotEmpty, IsNumber } from 'class-validator';
import { DiscountStatus } from 'src/constants/discount-status.enum';
import { DiscountType } from 'src/constants/discount-type.enum';

export default class CreateDiscountDto {
  @IsEnum(DiscountType)
  @IsNotEmpty()
  type: DiscountType;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsEnum(DiscountStatus)
  @IsNotEmpty()
  status: DiscountStatus;

  @IsInt()
  @IsNotEmpty()
  promotionId: number;
}
