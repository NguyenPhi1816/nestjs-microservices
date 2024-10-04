export default class UpdateCategoryDto {
  id: number;
  name: string;
  existImage: string;
  newImage: Express.Multer.File;
  description: string;
  parentId: string | null;
}
