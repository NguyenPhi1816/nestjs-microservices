export default class UpdateCategoryDto {
  id: string;
  name: string;
  existImage: string;
  newImage: Express.Multer.File;
  description: string;
  parentId: string | null;
}
