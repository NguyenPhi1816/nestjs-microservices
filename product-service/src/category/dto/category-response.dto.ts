import CategoryParentResponseDto from './category-parent-response.dto';

export default class CategoryResponseDto {
  id: number;
  slug: string;
  name: string;
  image: string;
  description: string;
  parent: CategoryParentResponseDto | null;
  numberOfBaseProduct: number;
  numberOfChildren: number;
}
