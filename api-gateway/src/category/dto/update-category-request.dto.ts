export default class UpdateCategoryRequestDto {
  id: number;
  name: string;
  image: string;
  description: string;
  parentId: number | null;
}
