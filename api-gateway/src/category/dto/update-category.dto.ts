export default class UpdateCategoryDto {
  id: string;
  name: string;
  existImage: string;
  existImageId: string;
  newImage: Express.Multer.File;
  description: string;
  parentId: string | null;
}
