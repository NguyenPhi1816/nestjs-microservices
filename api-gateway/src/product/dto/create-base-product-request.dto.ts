export class CreateBaseProductRequestDto {
  name: string;
  description: string;
  categoryIds: number[];
  brandId: number;
  images: string[];
  mainImageId: number;
}
