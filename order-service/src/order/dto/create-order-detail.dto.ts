import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateOrderDetailDto {
  @IsInt()
  @IsNotEmpty()
  productVariantId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}
