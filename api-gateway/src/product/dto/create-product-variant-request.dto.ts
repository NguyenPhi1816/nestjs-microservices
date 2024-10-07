export class CreateProductVariantRequestDto {
  baseProductId: number;
  image: string;
  quantity: number;
  price: number;
  optionValueIds: number[];
}
