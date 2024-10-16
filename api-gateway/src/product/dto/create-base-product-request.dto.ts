export class createBPImage {
  image: string;
  id: string;
}

export class CreateBaseProductRequestDto {
  name: string;
  description: string;
  categoryIds: number[];
  brandId: number;
  images: createBPImage[];
  mainImageId: number;
}
