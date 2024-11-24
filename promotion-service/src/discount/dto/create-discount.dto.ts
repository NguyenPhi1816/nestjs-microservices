import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { DiscountStatus } from 'src/constants/discount-status.enum';
import { DiscountType } from 'src/constants/discount-type.enum';

export default class CreateDiscountDto {
  @IsEnum(DiscountType)
  @IsNotEmpty()
  type: DiscountType;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsInt()
  @IsNotEmpty()
  promotionId: number;

  @IsArray()
  @IsInt({ each: true })
  appliedProductIds: number[];
}
