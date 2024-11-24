import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { DiscountStatus } from 'src/constants/discount-status.enum';

export default class UpdateDiscountStatus {
  @IsInt()
  @IsNotEmpty()
  discountId: number;

  @IsEnum(DiscountStatus)
  @IsNotEmpty()
  status: DiscountStatus;
}
