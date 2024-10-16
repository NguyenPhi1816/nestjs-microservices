export class UpdateBrandDto {
  id: string;
  name: string;
  existImage: string;
  existImageId: string;
  newImage: Express.Multer.File;
}
