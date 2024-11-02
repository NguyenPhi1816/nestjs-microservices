import { IsArray, IsInt, IsString, IsUrl } from 'class-validator';

export class CartResponseDto {
  productVariantId: number;
  quantity: number;
}
