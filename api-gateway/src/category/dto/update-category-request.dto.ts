export default class UpdateCategoryRequestDto {
  id: number;
  name: string;
  image: string;
  imageId: string;
  description: string;
  parentId: number | null;
}
