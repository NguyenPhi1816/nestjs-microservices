import { ProductVariantRequest } from './product-variant-request.dto';

export class GetReviewsByBPSlugRequest {
  products: ProductVariantRequest[];
  rating?: number;
  page: number = 1;
  limit: string = '5';
}
