import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export default class ApplyDiscountDto {
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  baseProductIds: number[];

  @IsInt()
  @IsNotEmpty()
  discountId: number;
}
