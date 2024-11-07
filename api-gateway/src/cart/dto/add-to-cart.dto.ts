import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class AddToCartRequestDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
