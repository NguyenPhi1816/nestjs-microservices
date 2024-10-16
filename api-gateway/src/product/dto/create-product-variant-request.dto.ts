export class CreateProductVariantRequestDto {
  baseProductId: number;
  image: string;
  imageId: string;
  quantity: number;
  price: number;
  optionValueIds: number[];
}
