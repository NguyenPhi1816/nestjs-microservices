export type CreateProductVariantDto = {
  baseProductId: string;
  image: Express.Multer.File;
  quantity: string;
  price: string;
  optionValueIds: string[];
};
