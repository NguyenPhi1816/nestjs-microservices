export class BrandProductDto {
  id: number;
  slug: string;
  name: string;
  category: {
    id: number;
    slug: string;
    name: string;
  }[];
  brand: {
    id: number;
    slug: string;
    name: string;
  };
  status: string;
}
