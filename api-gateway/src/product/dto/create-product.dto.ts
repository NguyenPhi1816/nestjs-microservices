export type CreateBaseProductDto = {
  name: string;
  description: string;
  categoryIds: string[];
  brandId: string;
  images: Express.Multer.File[];
};
