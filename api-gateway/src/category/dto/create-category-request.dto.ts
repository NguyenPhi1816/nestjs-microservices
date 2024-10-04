export default class CreateCategoryRequestDto {
  name: string;
  image: string;
  description: string;
  parentId: number | null;
}
