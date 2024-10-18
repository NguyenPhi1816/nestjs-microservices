export default class UpdateProductVariantDto {
  productVariantId: string;
  image: Express.Multer.File | null;
  imageUrl: string;
  imageId: string;
  price: string;
  quantity: string;
}
