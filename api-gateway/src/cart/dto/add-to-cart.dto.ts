import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddToCartRequestDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @IsNotEmpty()
  baseProductId: number;

  @IsInt()
  @IsNotEmpty()
  categoryIds: number[];
}
