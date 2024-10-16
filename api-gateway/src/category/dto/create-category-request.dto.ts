export default class CreateCategoryRequestDto {
  name: string;
  image: string;
  imageId: string;
  description: string;
  parentId: number | null;
}
