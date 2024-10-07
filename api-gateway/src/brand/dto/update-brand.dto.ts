export class UpdateBrandDto {
  id: string;
  name: string;
  existImage: string;
  newImage: Express.Multer.File;
}
