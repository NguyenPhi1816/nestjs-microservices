export default class CreateCategoryDto {
  name: string;
  image: Express.Multer.File;
  description: string;
  parentId: string | null;
}
